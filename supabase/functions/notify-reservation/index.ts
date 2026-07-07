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
    const reservation = payload.record;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const BODEGA_NOTIFY_EMAIL = Deno.env.get("BODEGA_NOTIFY_EMAIL");

    const formattedDate = new Date(reservation.date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const guestHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f2ee;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f2ee;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;color:#1E4D5A;letter-spacing:0.1em;text-transform:uppercase;">Bodega</p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #d8d6d0;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:400;color:#0A242C;">Your table is booked</h1>
              <p style="margin:0;font-size:13px;color:#777777;line-height:1.6;">
                Hi ${reservation.guest_name}, we're looking forward to seeing you. Here are your booking details.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 0;border-bottom:1px solid #d8d6d0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Date</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${formattedDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Time</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.time}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Guests</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.party_size} ${reservation.party_size === 1 ? "guest" : "guests"}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Location</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">Bodega, Unit 12, Weir Mill, 3 Woodhead Lane, Stockport, SK3 0GR</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${reservation.requested_bottle_label ? `
          <tr>
            <td style="padding:24px 0;border-bottom:1px solid #d8d6d0;">
              <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Requested bottle</p>
              <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.requested_bottle_label}</p>
            </td>
          </tr>
          ` : ""}

          ${reservation.special_requests ? `
          <tr>
            <td style="padding:24px 0;border-bottom:1px solid #d8d6d0;">
              <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Your notes</p>
              <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.special_requests}</p>
            </td>
          </tr>
          ` : ""}

          <tr>
            <td style="padding:24px 0;border-bottom:1px solid #d8d6d0;">
              <p style="margin:0;font-size:13px;color:#777777;line-height:1.7;">
                Need to cancel or make a change? Reply to this email or get in touch at
                <a href="mailto:hello@bodegawine.co.uk" style="color:#1E4D5A;text-decoration:none;">hello@bodegawine.co.uk</a>
                and we'll sort it for you.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:13px;color:#777777;">See you soon.</p>
              <p style="margin:8px 0 0;font-size:13px;color:#0A242C;">The Bodega team</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
              <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#777777;">New booking</p>
              <h1 style="margin:0;font-size:18px;font-weight:400;color:#0A242C;">${reservation.guest_name}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Date</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${formattedDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Time</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.time}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Guests</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.party_size}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Email</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Phone</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.phone}</p>
                  </td>
                </tr>
                ${reservation.requested_bottle_label ? `
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Requested bottle</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.requested_bottle_label}</p>
                  </td>
                </tr>
                ` : ""}
                ${reservation.special_requests ? `
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#777777;">Notes</p>
                    <p style="margin:0;font-size:13px;color:#0A242C;">${reservation.special_requests}</p>
                  </td>
                </tr>
                ` : ""}
              </table>
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
        to: [reservation.email],
        subject: `Booking confirmed — ${formattedDate} at ${reservation.time}`,
        html: guestHtml,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bodega <hello@bodegawine.co.uk>",
        to: [BODEGA_NOTIFY_EMAIL],
        subject: `New booking — ${reservation.guest_name}, ${formattedDate} at ${reservation.time}`,
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