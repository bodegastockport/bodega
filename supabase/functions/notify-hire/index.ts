import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ error: "No record in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("BODEGA_NOTIFY_EMAIL");

    if (!resendKey || !notifyEmail) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submittedAt = record.created_at
      ? new Date(record.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "Unknown";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bodega System <hello@bodegawine.co.uk>",
        to: notifyEmail,
        subject: `New hire enquiry from ${record.name}`,
        html: `
          <div style="font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0A242C;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">New hire enquiry</p>
            <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 24px;">${record.name}</h1>
            <table style="font-size: 12px; border-collapse: collapse; width: 100%; margin-bottom: 24px;">
              <tr><td style="padding: 6px 0; color: #666; width: 140px;">Email</td><td><a href="mailto:${record.email}" style="color: #1E4D5A;">${record.email}</a></td></tr>
              ${record.phone ? `<tr><td style="padding: 6px 0; color: #666;">Phone</td><td>${record.phone}</td></tr>` : ""}
              ${record.event_type ? `<tr><td style="padding: 6px 0; color: #666;">Event type</td><td>${record.event_type}</td></tr>` : ""}
              ${record.date ? `<tr><td style="padding: 6px 0; color: #666;">Preferred date</td><td>${record.date}</td></tr>` : ""}
              ${record.guests ? `<tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${record.guests}</td></tr>` : ""}
              <tr><td style="padding: 6px 0; color: #666;">Received</td><td>${submittedAt}</td></tr>
            </table>
            ${record.message ? `
            <div style="background: #eceae4; border: 1px solid #d8d6d0; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-bottom: 8px;">Message</p>
              <p style="font-size: 13px; line-height: 1.7; color: #0A242C; margin: 0;">${record.message}</p>
            </div>` : ""}
            <a href="https://bodegawine.co.uk/admin" style="display: inline-block; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">View in admin →</a>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});