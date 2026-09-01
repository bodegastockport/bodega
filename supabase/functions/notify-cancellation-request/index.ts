const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
    const request = payload.record;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const BODEGA_NOTIFY_EMAIL = Deno.env.get("BODEGA_NOTIFY_EMAIL");

    const formattedMembershipStart = request.membership_start
      ? new Date(request.membership_start).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

    const formattedSubmitted = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const bodegaHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:0;background-color:#f3f2ee;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f2ee;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #d8d6d0;">
              <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#777777;">Cellar Club — 14-day cancellation request</p>
              <h1 style="margin:0;font-size:18px;font-weight:400;color:#0A242C;">${request.name}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Email</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${request.email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Membership tier</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${request.membership_tier || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Membership started</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${formattedMembershipStart}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Request submitted</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${formattedSubmitted}</p>
                  </td>
                </tr>
                ${request.message ? `
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Message</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${request.message}</p>
                  </td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;border-top:1px solid #d8d6d0;">
              <p style="margin:0;font-size:13px;color:#777777;line-height:1.7;">
                This member has asked to cancel within their 14-day cooling-off period and is entitled to a full refund.
                This needs to be actioned manually — refund via Stripe, then cancel the membership.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bodega <hello@bodegawine.co.uk>",
        to: [BODEGA_NOTIFY_EMAIL],
        subject: `14-day cancellation request — ${request.name}`,
        html: bodegaHtml,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});