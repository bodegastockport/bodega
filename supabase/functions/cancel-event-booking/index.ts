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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization") || "";
    const callerToken = authHeader.replace("Bearer ", "").trim();

    if (!callerToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerData, error: callerErr } = await supabase.auth.getUser(callerToken);

    if (callerErr || !callerData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerRole = callerData.user.user_metadata?.role;

    if (callerRole !== "admin" && callerRole !== "team") {
      return new Response(JSON.stringify({ error: "Staff access only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Missing booking_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: bookingErr } = await supabase
      .from("event_bookings")
      .select("id, status, stripe_payment_intent_id, guest_name, event_id")
      .eq("id", booking_id)
      .maybeSingle();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.status === "cancelled") {
      return new Response(JSON.stringify({ error: "Booking is already cancelled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let refunded = false;

    if (booking.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
        apiVersion: "2024-04-10",
        httpClient: Stripe.createFetchHttpClient(),
      });

      try {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
        refunded = true;
      } catch (stripeErr) {
        console.error("Stripe refund failed:", stripeErr);
        return new Response(
          JSON.stringify({ error: "Refund failed in Stripe. Booking was not cancelled. " + (stripeErr.message || "") }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { error: updateErr } = await supabase
      .from("event_bookings")
      .update({ status: "cancelled" })
      .eq("id", booking_id);

    if (updateErr) {
      console.error("Failed to mark booking cancelled after refund:", updateErr);
      return new Response(
        JSON.stringify({ error: "Refund succeeded but failed to update the booking record. Please check Stripe and update manually." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ cancelled: true, refunded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("cancel-event-booking error:", err);
    return new Response(JSON.stringify({ error: "Failed to cancel booking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});