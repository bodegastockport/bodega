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
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
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
    const meta = session.metadata!;

    const { data: existing } = await supabase
      .from("cellar_members")
      .select("id")
      .eq("email", meta.email)
      .maybeSingle();

    if (existing) {
      console.log("Member already exists:", meta.email);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billingInterval = meta.interval === "year" ? "year" : "month";

    const { data: newMember, error: memberErr } = await supabase
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
        billing_interval: billingInterval,
      })
      .select("id")
      .single();

    if (memberErr || !newMember) {
      console.error("Error creating member:", memberErr);
      return new Response(JSON.stringify({ error: "Failed to create member" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("BODEGA_NOTIFY_EMAIL");
    const priceId = meta.price_id || "";
    let slotRange = "";

    const TIER_SLOT_MAP: Record<string, number> = {
      "price_1TUq5Z6zpi5C7YnTcOr6xOU2": 6,
      "price_1Tmcr56zpi5C7YnTPPLQVNjj": 6,
      "price_1TUq5a6zpi5C7YnTBmIVcAO7": 12,
      "price_1Tmcrg6zpi5C7YnTf2jkpQs1": 12,
      "price_1TUq5Z6zpi5C7YnTmY2UrAXB": 18,
      "price_1Tmcsm6zpi5C7YnT7q5mI4N4": 18,
      "price_1TUq5Y6zpi5C7YnThI7Xd3mA": 6,
      "price_1TmctD6zpi5C7YnT5k0RNVx8": 6,
      "price_1TUq5Z6zpi5C7YnTmrGYas0G": 12,
      "price_1Tmctd6zpi5C7YnTeOgXsnn3": 12,
      "price_1TUq5Z6zpi5C7YnTjU77emKW": 18,
      "price_1TmcuA6zpi5C7YnThOzGtYNO": 18,
      "price_1TUq5d6zpi5C7YnTcNuBkyTU": 24,
      "price_1Tmcuh6zpi5C7YnT14an4x5o": 24,
    };

    const slotCount = TIER_SLOT_MAP[priceId];

    if (slotCount) {
      try {
        const { data: rpcResult, error: rpcErr } = await supabase.rpc(
          "assign_vault_slots",
          { p_member_id: newMember.id, p_slot_count: slotCount }
        );

        if (rpcErr) {
          console.error("Slot assignment RPC error:", rpcErr);
        } else {
          slotRange = rpcResult || "";
        }
      } catch (slotErr) {
        console.error("Slot assignment threw:", slotErr);
      }

      if (!slotRange && resendKey && notifyEmail) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Bodega System <hello@bodegawine.co.uk>",
            to: notifyEmail,
            subject: `URGENT — Vault slot assignment failed for ${meta.name}`,
            html: `<div style="font-family: 'Courier New', monospace; padding: 24px; color: #0A242C;"><p>Slot assignment failed for new member <strong>${meta.name}</strong> (${meta.email}, ${meta.tier}).</p><p>The member record has been created but no slots were assigned. Please assign slots manually in the admin panel.</p></div>`,
          }),
        });
      }
    } else {
      console.error("Unknown price ID, cannot assign slots:", priceId);
      if (resendKey && notifyEmail) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Bodega System <hello@bodegawine.co.uk>",
            to: notifyEmail,
            subject: `URGENT — Unknown price ID for ${meta.name}`,
            html: `<div style="font-family: 'Courier New', monospace; padding: 24px; color: #0A242C;"><p>An unknown Stripe price ID was received for new member <strong>${meta.name}</strong> (${meta.email}, ${meta.tier}).</p><p>Price ID received: <strong>${priceId || "empty"}</strong></p><p>The member record has been created but no slots were assigned. Please check the Stripe price ID mapping in the Edge Function and assign slots manually.</p></div>`,
          }),
        });
      }
    }

    const { error: authErr } = await supabase.auth.admin.createUser({
      email: meta.email,
      email_confirm: true,
      user_metadata: { role: "member", name: meta.name },
    });

    if (authErr && !authErr.message.includes("already registered")) {
      console.error("Error creating auth user:", authErr);
    }

    if (resendKey) {
      const slotLine = slotRange
        ? `<p style="font-size: 13px; line-height: 1.7; margin-bottom: 16px; color: #0A242C;">Your vault space: <strong>${slotRange}</strong></p>`
        : "";

      const isCorporate = meta.tier.startsWith("Corporate");
      const logoHtml = `<img src="https://bodegawine.co.uk/bodega_logo_teal.png" alt="Bodega" width="180" style="display: block; margin-bottom: 32px;" />`;

      const individualHtml = `
        <div style="background-color: #f3f2ee; font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #0A242C;">
          ${logoHtml}
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">Bodega Cellar Club</p>
          <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 24px; color: #0A242C;">Welcome, ${meta.name.split(" ")[0]}.</h1>
          <p style="font-size: 13px; line-height: 1.7; margin-bottom: 16px; color: #0A242C;">Your ${meta.tier} membership is confirmed and your subscription is active.</p>
          ${slotLine}
          <p style="font-size: 13px; line-height: 1.7; margin-bottom: 24px; color: #0A242C;">Your account is ready. Log in to your member account using the button below.</p>
          <a href="https://bodegawine.co.uk/login" style="display: inline-block; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 32px;">Log in to my account →</a>
          <div style="border-top: 1px solid #d8d6d0; padding-top: 24px; margin-top: 8px;">
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">Drop-offs must be arranged at least 24 hours in advance and are by appointment only, between 2–6pm Tuesday to Thursday and 2–4pm Friday to Sunday. Please note that wine cannot be consumed on the same day it is dropped off. Reply to this email to arrange your first drop-off.</p>
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">Only you as the named member may deposit and consume wine from your vault. We may request photographic ID at any time.</p>
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">A corkage charge applies each time you open a bottle. Current rates are available at the bar.</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 0;">Bodega, Unit 12, Weir Mill, 3 Woodhead Lane, Stockport, SK3 0GR</p>
          </div>
        </div>
      `;

      const corporateHtml = `
        <div style="background-color: #f3f2ee; font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #0A242C;">
          ${logoHtml}
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">Bodega Cellar Club</p>
          <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 24px; color: #0A242C;">Welcome, ${meta.name.split(" ")[0]}.</h1>
          <p style="font-size: 13px; line-height: 1.7; margin-bottom: 16px; color: #0A242C;">Your ${meta.tier} corporate membership is confirmed and your subscription is active.</p>
          ${slotLine}
          <p style="font-size: 13px; line-height: 1.7; margin-bottom: 24px; color: #0A242C;">Your account is ready. Log in to your member account using the button below.</p>
          <a href="https://bodegawine.co.uk/login" style="display: inline-block; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 32px;">Log in to my account →</a>
          <div style="border-top: 1px solid #d8d6d0; padding-top: 24px; margin-top: 8px;">
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">Drop-offs must be arranged at least 24 hours in advance and are by appointment only, between 2–6pm Tuesday to Thursday and 2–4pm Friday to Sunday. Please note that wine cannot be consumed on the same day it is dropped off. Reply to this email to arrange your first drop-off.</p>
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">Only authorised users registered against your membership may deposit and consume wine from your vault. We may request photographic ID from any authorised user at any time.</p>
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">To add or remove authorised users, please contact us in writing at hello@bodegawine.co.uk. Changes take effect once confirmed by Bodega.</p>
            <p style="font-size: 12px; line-height: 1.7; color: #666; margin-bottom: 8px;">A corkage charge applies each time a bottle is opened. Current rates are available at the bar.</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 0;">Bodega, Unit 12, Weir Mill, 3 Woodhead Lane, Stockport, SK3 0GR</p>
          </div>
        </div>
      `;

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
          html: isCorporate ? corporateHtml : individualHtml,
        }),
      });

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
              <div style="background-color: #f3f2ee; font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 32px; color: #0A242C;">
                <img src="https://bodegawine.co.uk/bodega_logo_teal.png" alt="Bodega" width="180" style="display: block; margin-bottom: 32px;" />
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">New member</p>
                <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 24px; color: #0A242C;">${meta.name}</h1>
                <table style="font-size: 12px; border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 6px 0; color: #666; width: 140px;">Email</td><td>${meta.email}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Phone</td><td>${meta.phone || "—"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Tier</td><td>${meta.tier}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Vault slots</td><td>${slotRange || "Assignment failed — check logs"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Address</td><td>${meta.address_line1}, ${meta.postcode}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">How heard</td><td>${meta.how_heard || "—"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Marketing</td><td>${meta.marketing === "true" ? "Yes" : "No"}</td></tr>
                </table>
                <a href="https://bodegawine.co.uk/admin" style="display: inline-block; margin-top: 24px; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">View in admin →</a>
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