import Stripe from "https://esm.sh/stripe@11.2.0?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_IDS: Record<string, string> = {
  "Cellar 6":     "price_1TUq5Z6zpi5C7YnTcOr6xOU2",
  "Cellar 12":    "price_1TUq5a6zpi5C7YnTBmIVcAO7",
  "Cellar 18":    "price_1TUq5Z6zpi5C7YnTmY2UrAXB",
  "Corporate 6":  "price_1TUq5Y6zpi5C7YnThI7Xd3mA",
  "Corporate 12": "price_1TUq5Z6zpi5C7YnTmrGYas0G",
  "Corporate 18": "price_1TUq5Z6zpi5C7YnTjU77emKW",
  "Corporate 24": "price_1TUq5d6zpi5C7YnTcNuBkyTU",
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

    const body = await req.json();
    const { name, email, phone, dob, tier, address_line1, postcode, how_heard, marketing, agreed_terms } = body;

    if (!name || !email || !tier || !address_line1 || !postcode || !agreed_terms) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid membership tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://bodegawine.co.uk/cellar-club/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://bodegawine.co.uk/cellar-club",
      allow_promotion_codes: true,
      metadata: {
        name,
        email,
        phone: phone || "",
        dob: dob || "",
        tier,
        price_id: priceId,
        address_line1,
        postcode,
        how_heard: how_heard || "",
        marketing: String(marketing),
        agreed_terms: String(agreed_terms),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Stripe checkout error:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});