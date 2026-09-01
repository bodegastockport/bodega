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

function resolveSlotReference(slotId: string | null, slots: Array<{ id: string; row_label: string; column_number: number }>): string {
  if (!slotId) return "";
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) return "";
  return `${slot.row_label}${slot.column_number}`;
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
    const payload   = await req.json();
    const eventType = payload.type;
    const bottle    = payload.record || payload.old_record;
    if (!bottle) throw new Error("No record in webhook payload");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const dedupeKey = eventType === "DELETE"
      ? `${bottle.id}:delete`
      : `${bottle.id}:${bottle.updated_at || bottle.created_at || ""}`;

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

    let slotReference = "";
    if (bottle.slot_id) {
      const { data: slotData } = await supabase
        .from("vault_slots")
        .select("id, row_label, column_number")
        .eq("id", bottle.slot_id)
        .single();
      if (slotData) {
        slotReference = `${slotData.row_label}${slotData.column_number}`;
      }
    }

    const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "");
    const sheetId        = Deno.env.get("GOOGLE_SHEET_ID") || "";

    const now   = new Date().toISOString().replace("T", " ").substring(0, 19);
    const token = await getAccessToken(serviceAccount);
    const rows  = await getSheetValues(token, sheetId);

    const existingIndex = rows.slice(1).findIndex((r) => r[0] === bottle.id);

    if (eventType === "DELETE") {
      if (existingIndex >= 0) {
        const existing  = [...rows[existingIndex + 1]];
        existing[9]  = "removed";
        existing[12] = now;
        await updateRow(token, sheetId, existingIndex + 1, existing);
      }
    } else {
      const rowValues = [
        bottle.id               || "",
        bottle.member_id        || "",
        bottle.wine_name        || "",
        bottle.producer         || "",
        bottle.vintage          || "",
        slotReference,
        bottle.type             || "",
        String(bottle.quantity ?? ""),
        bottle.notes            || "",
        bottle.status           || "",
        bottle.checked_out_at   || "",
        bottle.created_at       || now,
        bottle.updated_at       || now,
      ];

      if (existingIndex >= 0) {
        await updateRow(token, sheetId, existingIndex + 1, rowValues);
      } else {
        const recheckRows = await getSheetValues(token, sheetId);
        const recheckIndex = recheckRows.slice(1).findIndex((r) => r[0] === bottle.id);
        if (recheckIndex >= 0) {
          await updateRow(token, sheetId, recheckIndex + 1, rowValues);
        } else {
          await appendRow(token, sheetId, rowValues);
        }
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