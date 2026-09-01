// supabase/functions/backup-cellar-member/index.ts
//
// Triggered by: INSERT and UPDATE on cellar_members (via Supabase webhook)
// Writes / updates a row in the Members tab of Bodega Cellar Backup sheet
//
// Sheet column order (must match row 1 headers exactly):
// A:id | B:name | C:email | D:phone | E:birthday | F:membership_tier |
// G:membership_start | H:status | I:bottles_stored | J:marketing_opt_in |
// K:how_did_you_hear | L:is_early_bird | M:stripe_customer_id |
// N:stripe_subscription_id | O:notes | P:created_at | Q:updated_at

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

async function getSheetMeta(token: string, sheetId: string): Promise<{ sheetIdNum: number }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(sheetId,title))`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const sheet = (data.sheets || []).find((s: any) => s.properties.title === "Members");
  return { sheetIdNum: sheet?.properties.sheetId ?? 0 };
}

async function getSheetValues(token: string, sheetId: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Members!A:Q`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.values || [];
}

async function updateRow(token: string, sheetId: string, rowIndex: number, values: string[]) {
  const range = `Members!A${rowIndex + 2}:Q${rowIndex + 2}`;
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res   = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  if (!res.ok) throw new Error(`Update failed: ${await res.text()}`);
}

async function appendRow(token: string, sheetId: string, values: string[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Members!A:Q:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  if (!res.ok) throw new Error(`Append failed: ${await res.text()}`);
}

async function deleteRows(token: string, sheetId: string, sheetIdNum: number, rowIndexes: number[]) {
  if (rowIndexes.length === 0) return;
  const requests = rowIndexes
    .sort((a, b) => b - a)
    .map((rowIndex) => ({
      deleteDimension: {
        range: {
          sheetId: sheetIdNum,
          dimension: "ROWS",
          startIndex: rowIndex + 1,
          endIndex: rowIndex + 2,
        },
      },
    }));
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) throw new Error(`Delete rows failed: ${await res.text()}`);
}

async function dedupeMemberRows(token: string, sheetId: string, sheetIdNum: number, memberId: string) {
  const rows = await getSheetValues(token, sheetId);
  const matches: number[] = [];
  rows.slice(1).forEach((r, i) => { if (r[0] === memberId) matches.push(i); });

  if (matches.length <= 1) return;

  let latestIndex = matches[0];
  for (const idx of matches) {
    const currentUpdatedAt = rows[idx + 1][16] || "";
    const latestUpdatedAt = rows[latestIndex + 1][16] || "";
    if (currentUpdatedAt > latestUpdatedAt) latestIndex = idx;
  }

  const toDelete = matches.filter((idx) => idx !== latestIndex);
  await deleteRows(token, sheetId, sheetIdNum, toDelete);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const webhookSecret = Deno.env.get("DB_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-webhook-secret");

  if (!webhookSecret || providedSecret !== webhookSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const member  = payload.record;
    if (!member) throw new Error("No record in webhook payload");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const dedupeKey = `${member.id}:${member.updated_at || member.created_at || ""}`;

    const { error: dedupeErr } = await supabase
      .from("webhook_dedup")
      .insert({ id: dedupeKey });

    if (dedupeErr) {
      if (dedupeErr.code === "23505") {
        return new Response(JSON.stringify({ success: true, skipped: "duplicate" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Dedupe check failed, continuing anyway:", dedupeErr);
    }

    const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "");
    const sheetId        = Deno.env.get("GOOGLE_SHEET_ID") || "";

    const token = await getAccessToken(serviceAccount);
    const { sheetIdNum } = await getSheetMeta(token, sheetId);

    const rowValues = [
      member.id                     || "",  // A
      member.name                   || "",  // B
      member.email                  || "",  // C
      member.phone                  || "",  // D
      member.birthday               || "",  // E
      member.membership_tier        || "",  // F
      member.membership_start       || "",  // G
      member.status                 || "",  // H
      String(member.bottles_stored ?? ""), // I
      String(member.marketing_opt_in ?? ""), // J
      member.how_did_you_hear       || "",  // K
      String(member.is_early_bird ?? ""),  // L
      member.stripe_customer_id     || "",  // M
      member.stripe_subscription_id || "",  // N
      member.notes                  || "",  // O
      member.created_at             || "",  // P
      member.updated_at             || "",  // Q
    ];

    const rows = await getSheetValues(token, sheetId);
    const existingIndex = rows.slice(1).findIndex((r) => r[0] === member.id);

    if (existingIndex >= 0) {
      await updateRow(token, sheetId, existingIndex + 1, rowValues);
    } else {
      await appendRow(token, sheetId, rowValues);
    }

    await dedupeMemberRows(token, sheetId, sheetIdNum, member.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("backup-cellar-member error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});