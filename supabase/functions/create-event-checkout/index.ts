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

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-04-10",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { event_id, guest_name, email, phone, party_size, dietary_requirements } = body;

    if (!event_id || !guest_name || !email || !phone || !party_size) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedPartySize = Number(party_size);
    if (!Number.isInteger(requestedPartySize) || requestedPartySize < 1) {
      return new Response(JSON.stringify({ error: "Invalid party size" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, date, price_per_person, capacity, requires_booking")
      .eq("id", event_id)
      .maybeSingle();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!event.price_per_person) {
      return new Response(JSON.stringify({ error: "This event does not require booking" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.capacity) {
      const { data: existingBookings, error: bookingsError } = await supabase
        .from("event_bookings")
        .select("party_size")
        .eq("event_id", event_id)
        .eq("status", "confirmed");

      if (bookingsError) {
        console.error("Capacity check error:", bookingsError);
        return new Response(JSON.stringify({ error: "Failed to check availability" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bookedCount = (existingBookings || []).reduce(
        (sum, b) => sum + (b.party_size || 0),
        0
      );

      if (bookedCount + requestedPartySize > event.capacity) {
        return new Response(JSON.stringify({ error: "This event is fully booked" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const amount = event.price_per_person * requestedPartySize;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: event.title,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://bodegawine.co.uk/events/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://bodegawine.co.uk/events",
      allow_promotion_codes: true,
      metadata: {
        event_id,
        guest_name,
        email,
        phone,
        party_size: String(requestedPartySize),
        dietary_requirements: dietary_requirements || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Event checkout error:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
