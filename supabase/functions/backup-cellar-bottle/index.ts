// supabase/functions/backup-cellar-bottle/index.ts
//
// Triggered by: INSERT, UPDATE, DELETE on cellar_bottles (via Supabase webhook)
// Writes / updates / marks removed in the Bottles tab of Bodega Cellar Backup sheet
//
// Sheet column order (must match row 1 headers exactly):
// A:id | B:member_id | C:wine_name | D:producer | E:vintage |
// F:cellar_location | G:type | H:quantity | I:notes | J:status |
// K:checked_out_at | L:created_at | M:updated_at

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

async function getSheetValues(token: string, sheetId: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Bottles!A:M`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.values || [];
}

async function updateRow(token: string, sheetId: string, rowIndex: number, values: string[]) {
  const range = `Bottles!A${rowIndex + 2}:M${rowIndex + 2}`;
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res   = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  if (!res.ok) throw new Error(`Update failed: ${await res.text()}`);
}

async function appendRow(token: string, sheetId: string, values: string[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Bottles!A:M:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  if (!res.ok) throw new Error(`Append failed: ${await res.text()}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload   = await req.json();
    const eventType = payload.type;
    const bottle    = payload.record || payload.old_record;
    if (!bottle) throw new Error("No record in webhook payload");

    const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "");
    const sheetId        = Deno.env.get("GOOGLE_SHEET_ID") || "";

    const now   = new Date().toISOString().replace("T", " ").substring(0, 19);
    const token = await getAccessToken(serviceAccount);
    const rows  = await getSheetValues(token, sheetId);

    const existingIndex = rows.slice(1).findIndex((r) => r[0] === bottle.id);

    if (eventType === "DELETE") {
      // Never hard-delete — mark as removed for audit trail
      if (existingIndex >= 0) {
        const existing  = [...rows[existingIndex + 1]];
        existing[9]  = "removed";  // J — status
        existing[12] = now;        // M — updated_at
        await updateRow(token, sheetId, existingIndex + 1, existing);
      }
    } else {
      const rowValues = [
        bottle.id               || "",  // A
        bottle.member_id        || "",  // B
        bottle.wine_name        || "",  // C
        bottle.producer         || "",  // D
        bottle.vintage          || "",  // E
        bottle.cellar_location  || "",  // F
        bottle.type             || "",  // G
        String(bottle.quantity ?? ""), // H
        bottle.notes            || "",  // I
        bottle.status           || "",  // J
        bottle.checked_out_at   || "",  // K
        bottle.created_at       || now, // L
        bottle.updated_at       || now, // M
      ];

      if (existingIndex >= 0) {
        await updateRow(token, sheetId, existingIndex + 1, rowValues);
      } else {
        await appendRow(token, sheetId, rowValues);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("backup-cellar-bottle error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
