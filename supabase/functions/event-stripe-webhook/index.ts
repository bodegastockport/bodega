import Stripe from "https://esm.sh/stripe@11.2.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("EVENT_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const meta = session.metadata || {};

    if (!meta.event_id) {
      console.log("Ignoring checkout session, not an event booking:", session.id);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("event_bookings")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .maybeSingle();

    if (existing) {
      console.log("Booking already recorded for payment intent:", session.payment_intent);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newBooking, error: bookingErr } = await supabase
      .from("event_bookings")
      .insert({
        event_id: meta.event_id,
        guest_name: meta.guest_name,
        email: meta.email,
        phone: meta.phone,
        party_size: Number(meta.party_size) || 1,
        dietary_requirements: meta.dietary_requirements || null,
        stripe_payment_intent_id: session.payment_intent as string,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (bookingErr || !newBooking) {
      console.error("Error creating event booking:", bookingErr);
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const functionsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-event-booking`;
      await fetch(functionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ booking_id: newBooking.id }),
      });
    } catch (notifyErr) {
      console.error("Error triggering notify-event-booking:", notifyErr);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});