import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const expectedAuth = `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`;
  const providedAuth = req.headers.get("Authorization");

  if (providedAuth !== expectedAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Missing booking_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: bookingErr } = await supabase
      .from("event_bookings")
      .select("id, event_id, guest_name, email, party_size, dietary_requirements")
      .eq("id", booking_id)
      .maybeSingle();

    if (bookingErr || !booking) {
      console.error("Booking not found:", bookingErr);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: eventRow, error: eventErr } = await supabase
      .from("events")
      .select("id, title, date, time, price_per_person")
      .eq("id", booking.event_id)
      .maybeSingle();

    if (eventErr || !eventRow) {
      console.error("Event not found:", eventErr);
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("BODEGA_NOTIFY_EMAIL");

    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scanUrl = `https://bodegawine.co.uk/scan-event/${booking.id}`;
    const encodedQrData = encodeURIComponent(scanUrl);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedQrData}&size=240x240&margin=10`;

    const formattedDate = new Date(eventRow.date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const dateTimeLine = eventRow.time
      ? `${formattedDate} at ${eventRow.time}`
      : formattedDate;

    const logoHtml = `<img src="https://bodegawine.co.uk/bodega_logo_teal.png" alt="Bodega" width="180" style="display: block; margin-bottom: 32px;" />`;

    const isFree = !eventRow.price_per_person;
    const perPersonAmount = eventRow.price_per_person ? eventRow.price_per_person / 100 : 0;
    const totalAmount = perPersonAmount * booking.party_size;
    const bookingRef = booking.id.split("-")[0].toUpperCase();

    const guestHtml = `
      <div style="background-color: #f3f2ee; font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #0A242C;">
        ${logoHtml}
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">Booking Confirmed</p>
        <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 8px; color: #0A242C;">${eventRow.title}</h1>
        <p style="font-size: 13px; line-height: 1.7; margin-bottom: 24px; color: #0A242C;">${dateTimeLine}</p>

        <div style="border: 1px solid #d8d6d0; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #777; margin-bottom: 12px;">Booking details</p>
          <table style="font-size: 13px; width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #777;">Booking ref</td><td style="padding: 4px 0; text-align: right;">${bookingRef}</td></tr>
            <tr><td style="padding: 4px 0; color: #777;">Name</td><td style="padding: 4px 0; text-align: right;">${booking.guest_name}</td></tr>
            <tr><td style="padding: 4px 0; color: #777;">Party size</td><td style="padding: 4px 0; text-align: right;">${booking.party_size}</td></tr>
            ${booking.dietary_requirements ? `<tr><td style="padding: 4px 0; color: #777;">Dietary</td><td style="padding: 4px 0; text-align: right;">${booking.dietary_requirements}</td></tr>` : ""}
          </table>
          <div style="border-top: 1px solid #d8d6d0; margin-top: 12px; padding-top: 12px;">
            <table style="font-size: 13px; width: 100%; border-collapse: collapse;">
              ${isFree
                ? `<tr><td style="padding: 4px 0;">Price</td><td style="padding: 4px 0; text-align: right;">Free</td></tr>`
                : `<tr><td style="padding: 4px 0; color: #777;">£${perPersonAmount.toFixed(2)} × ${booking.party_size}</td><td style="padding: 4px 0; text-align: right; color: #777;">£${totalAmount.toFixed(2)}</td></tr>
                   <tr><td style="padding: 4px 0; font-weight: bold;">Total paid</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">£${totalAmount.toFixed(2)}</td></tr>`
              }
            </table>
          </div>
        </div>

        <div style="border: 1px solid #1E4D5A; padding: 24px; margin-bottom: 24px; text-align: center;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 16px;">Your ticket — show on arrival</p>
          <img src="${qrUrl}" alt="Booking QR code" width="180" height="180" style="display: block; margin: 0 auto 12px auto;" />
          <p style="font-size: 11px; color: #777; margin: 0;">One scan covers your whole party of ${booking.party_size}</p>
          <p style="font-size: 10px; color: #999; margin-top: 8px;">Ref: ${bookingRef}</p>
        </div>

        <div style="border-top: 1px solid #d8d6d0; padding-top: 24px; margin-top: 8px;">
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">Bodega, Unit 12, Weir Mill, 3 Woodhead Lane, Stockport, SK3 0GR</p>
        </div>
      </div>
    `;

    const guestEmailResult = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bodega Events <hello@bodegawine.co.uk>",
        to: booking.email,
        subject: `Booking confirmed — ${eventRow.title}`,
        html: guestHtml,
      }),
    });

    if (!guestEmailResult.ok) {
      console.error("Failed to send guest confirmation email:", await guestEmailResult.text());
    }

    if (notifyEmail) {
      const notifyHtml = `
        <div style="background-color: #f3f2ee; font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #0A242C;">
          ${logoHtml}
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">New event booking</p>
          <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 24px; color: #0A242C;">${eventRow.title}</h1>
          <table style="font-size: 12px; border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px 0; color: #666; width: 140px;">Guest</td><td>${booking.guest_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Email</td><td>${booking.email}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Party size</td><td>${booking.party_size}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td>${dateTimeLine}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Dietary</td><td>${booking.dietary_requirements || "—"}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Price</td><td>${isFree ? "Free" : `£${totalAmount.toFixed(2)} (£${perPersonAmount.toFixed(2)} × ${booking.party_size})`}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Booking ref</td><td>${bookingRef}</td></tr>
          </table>
          <a href="https://bodegawine.co.uk/admin" style="display: inline-block; margin-top: 24px; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">View in admin →</a>
        </div>
      `;

      const notifyResult = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bodega System <hello@bodegawine.co.uk>",
          to: notifyEmail,
          subject: `New event booking — ${eventRow.title}`,
          html: notifyHtml,
        }),
      });

      if (!notifyResult.ok) {
        console.error("Failed to send Bodega notification email:", await notifyResult.text());
      }
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("notify-event-booking error:", err);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});