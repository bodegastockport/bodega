import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JWT } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getGoogleAccessToken(serviceAccountKey: string): Promise<string> {
  const sa = JSON.parse(serviceAccountKey);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const privateKey = sa.private_key;
  const jwt = await JWT.sign(payload, privateKey, { algorithm: "RS256" });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function writeSheet(
  accessToken: string,
  sheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
}

async function clearSheet(accessToken: string, sheetId: string, sheetName: string): Promise<void> {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

Deno.serve(async (req) => {
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
      .order("column_number").range(0, 1999);

    if (error) throw error;

    const memberIds = [...new Set(slots.filter((s) => s.member_id).map((s) => s.member_id))];
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
          const slot = slots.find(
            (s) => s.section === section && s.row_label === row && s.column_number === col
          );
          if (!slot) {
            rowData.push("");
          } else if (slot.status === "available") {
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

    const leftGrid = buildGrid("L", 20);
    const backGrid = buildGrid("B", 8);
    const rightGrid = buildGrid("R", 20);

    const spacer = [[""]];
    const leftHeader = [["LEFT WALL"]];
    const backHeader = [["BACK WALL"]];
    const rightHeader = [["RIGHT WALL"]];

    const allRows = [
      ...leftHeader,
      ...leftGrid,
      ...spacer,
      ...backHeader,
      ...backGrid,
      ...spacer,
      ...rightHeader,
      ...rightGrid,
    ];

    const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!;
    const sheetId = Deno.env.get("VAULT_MAP_SHEET_ID")!;
    const sheetName = "Vault Map";

    const accessToken = await getGoogleAccessToken(serviceAccountKey);
    await clearSheet(accessToken, sheetId, sheetName);
    await writeSheet(accessToken, sheetId, `${sheetName}!A1`, allRows);

    return new Response(JSON.stringify({ ok: true, slots: slots.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});