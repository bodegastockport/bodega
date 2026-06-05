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

async function writeGrid(token: string, sheetId: string, gridValues: string[][]) {
  const rowCount = gridValues.length;
  const colCount = gridValues[0]?.length || 0;

  function colLetter(n: number): string {
    let s = "";
    while (n > 0) {
      n--;
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }

  const endCol = colLetter(colCount);
  const range = `Vault Map!A1:${endCol}${rowCount}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: gridValues }),
  });

  if (!res.ok) throw new Error(`Grid write failed: ${await res.text()}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data: slots, error: slotsErr } = await supabase
      .from("vault_slots")
      .select("row_label, column_number, status, member_id")
      .order("row_label", { ascending: true })
      .order("column_number", { ascending: true });

    if (slotsErr || !slots) throw new Error(`Failed to fetch vault slots: ${slotsErr?.message}`);

    const memberIds = [...new Set(slots.filter(s => s.member_id).map(s => s.member_id))];
    const memberMap: Record<string, string> = {};

    if (memberIds.length > 0) {
      const { data: members } = await supabase
        .from("cellar_members")
        .select("id, name, membership_tier")
        .in("id", memberIds);

      for (const m of members || []) {
        memberMap[m.id] = `${m.name} — ${m.membership_tier || ""}`.trim().replace(/—\s*$/, "");
      }
    }

    const ROWS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const COLS = Array.from({ length: 30 }, (_, i) => i + 1);

    const slotMap: Record<string, { status: string; member_id: string | null }> = {};
    for (const slot of slots) {
      slotMap[`${slot.row_label}-${slot.column_number}`] = {
        status: slot.status,
        member_id: slot.member_id,
      };
    }

    const headerRow = ["", ...COLS.map(c => String(c))];
    const dataRows = ROWS.map(row => {
      const cells = COLS.map(col => {
        const slot = slotMap[`${row}-${col}`];
        if (!slot) return "";
        if (slot.status === "available") return "";
        if (slot.status === "pending_release") return "PENDING";
        if (slot.status === "assigned" && slot.member_id) {
          return memberMap[slot.member_id] || "Assigned";
        }
        return "";
      });
      return [row, ...cells];
    });

    const gridValues = [headerRow, ...dataRows];

    const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "");
    const sheetId = Deno.env.get("VAULT_MAP_SHEET_ID") || "";
    const token = await getAccessToken(serviceAccount);

    await writeGrid(token, sheetId, gridValues);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("backup-vault-map error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
