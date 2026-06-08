import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(key: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const header  = encode({ alg: "RS256", typ: "JWT" });
  const payload = encode({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });

  const toSign  = `${header}.${payload}`;
  const pemBody = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");

  const keyBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(toSign)
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${toSign}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function writeGrid(token: string, sheetId: string, sheetName: string, values: string[][]): Promise<void> {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName + "!A1")}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );
}

async function clearGrid(token: string, sheetId: string, sheetName: string): Promise<void> {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}:clear`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data: slots, error } = await supabase
      .from("vault_slots")
      .select("id, section, row_label, column_number, status, member_id")
      .order("section")
      .order("row_label")
      .order("column_number")
      .range(0, 1999);

    if (error) throw error;

    const memberIds = [...new Set((slots || []).filter((s) => s.member_id).map((s) => s.member_id))];
    const memberMap: Record<string, string> = {};

    if (memberIds.length > 0) {
      const { data: members } = await supabase
        .from("cellar_members")
        .select("id, name, membership_tier")
        .in("id", memberIds);

      if (members) {
        for (const m of members) {
          memberMap[m.id] = m.name + (m.membership_tier ? ` (${m.membership_tier})` : "");
        }
      }
    }

    const rows = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

    const buildGrid = (section: string, cols: number): string[][] => {
      const header = ["", ...Array.from({ length: cols }, (_, i) => String(i + 1))];
      const grid: string[][] = [header];
      for (const row of rows) {
        const rowData: string[] = [row];
        for (let col = 1; col <= cols; col++) {
          const slot = (slots || []).find(
            (s) => s.section === section && s.row_label === row && s.column_number === col
          );
          if (!slot || slot.status === "available") {
            rowData.push("");
          } else if (slot.status === "pending_release") {
            rowData.push("PENDING");
          } else if (slot.member_id && memberMap[slot.member_id]) {
            rowData.push(memberMap[slot.member_id]);
          } else {
            rowData.push(slot.status);
          }
        }
        grid.push(rowData);
      }
      return grid;
    };

    const allRows = [
      [["LEFT WALL"]],
      buildGrid("L", 20),
      [[""]],
      [["BACK WALL"]],
      buildGrid("B", 8),
      [[""]],
      [["RIGHT WALL"]],
      buildGrid("R", 20),
    ].flat();

    const saKey = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!);
    const sheetId = "1d-w9q4PoToaYAS3AqcCnPch57ogpzP_taGj8iVbQ6yU";
    const sheetName = "Vault Map";

    const token = await getAccessToken(saKey);
    await clearGrid(token, sheetId, sheetName);
    await writeGrid(token, sheetId, sheetName, allRows);

    return new Response(JSON.stringify({ ok: true, slots: slots?.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});