import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
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
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
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
    const meta = session.metadata!;

    // Check if member already exists (avoid duplicates)
    const { data: existing } = await supabase
      .from("cellar_members")
      .select("id")
      .eq("email", meta.email)
      .single();

    if (existing) {
      console.log("Member already exists:", meta.email);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create member record
    const { error: memberErr } = await supabase
      .from("cellar_members")
      .insert({
        name: meta.name,
        email: meta.email,
        phone: meta.phone || null,
        birthday: meta.dob || null,
        address_line1: meta.address_line1,
        postcode: meta.postcode,
        membership_tier: meta.tier,
        how_did_you_hear: meta.how_heard || null,
        marketing_opt_in: meta.marketing === "true",
        status: "active",
        membership_start: new Date().toISOString().split("T")[0],
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      });

    if (memberErr) {
      console.error("Error creating member:", memberErr);
      return new Response(JSON.stringify({ error: "Failed to create member" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase auth account for member (magic link login)
    const { error: authErr } = await supabase.auth.admin.createUser({
      email: meta.email,
      email_confirm: true,
      user_metadata: { role: "member", name: meta.name },
    });

    if (authErr && !authErr.message.includes("already registered")) {
      console.error("Error creating auth user:", authErr);
      // Don't fail — member record is created, auth can be fixed manually
    }

    // Send welcome email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("BODEGA_NOTIFY_EMAIL");

    if (resendKey) {
      // Welcome email to member
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bodega Cellar Club <hello@bodegawine.co.uk>",
          to: meta.email,
          subject: "Welcome to the Cellar Club",
          html: `
            <div style="font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0A242C;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">Bodega Cellar Club</p>
              <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 24px;">Welcome, ${meta.name.split(" ")[0]}.</h1>
              <p style="font-size: 13px; line-height: 1.7; margin-bottom: 16px;">Your ${meta.tier} membership is confirmed and your subscription is active.</p>
              <p style="font-size: 13px; line-height: 1.7; margin-bottom: 16px;">To access your member account, click the button below. We'll send you a secure login link to this email address.</p>
              <a href="https://bodegawine.co.uk/login" style="display: inline-block; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 32px;">Log in to my account →</a>
              <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">Drop-offs are by appointment — between 2–6pm Tuesday to Thursday and 2–4pm Friday to Sunday. Reply to this email to arrange your first drop-off.</p>
              <p style="font-size: 12px; color: #666;">Bodega, Weir Mill, Stockport, SK3 0AG</p>
            </div>
          `,
        }),
      });

      // Notification to Bodega team
      if (notifyEmail) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Bodega System <hello@bodegawine.co.uk>",
            to: notifyEmail,
            subject: `New Cellar Club member — ${meta.name}`,
            html: `
              <div style="font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0A242C;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">New member</p>
                <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 24px;">${meta.name}</h1>
                <table style="font-size: 12px; border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 6px 0; color: #666; width: 140px;">Email</td><td>${meta.email}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Phone</td><td>${meta.phone || "—"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Tier</td><td>${meta.tier}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Address</td><td>${meta.address_line1}, ${meta.postcode}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">How heard</td><td>${meta.how_heard || "—"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Marketing</td><td>${meta.marketing === "true" ? "Yes" : "No"}</td></tr>
                </table>
                <a href="https://bodega-nu.vercel.app/admin" style="display: inline-block; margin-top: 24px; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">View in admin →</a>
              </div>
            `,
          }),
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
