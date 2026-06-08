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
    const { member_id } = await req.json();

    if (!member_id) {
      return new Response(JSON.stringify({ error: "member_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data: member, error: fetchErr } = await supabase
      .from("cellar_members")
      .select("id, name, email, stripe_subscription_id, status")
      .eq("id", member_id)
      .single();

    if (fetchErr || !member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (member.stripe_subscription_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
        apiVersion: "2024-04-10",
        httpClient: Stripe.createFetchHttpClient(),
      });

      try {
        await stripe.subscriptions.cancel(member.stripe_subscription_id);
      } catch (stripeErr) {
        console.error("Stripe cancellation error:", stripeErr);
        return new Response(JSON.stringify({ error: "Failed to cancel Stripe subscription" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error: updateErr } = await supabase
      .from("cellar_members")
      .update({ status: "inactive" })
      .eq("id", member_id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "Failed to update member status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: storedBottles } = await supabase
      .from("cellar_bottles")
      .select("id")
      .eq("member_id", member_id)
      .eq("status", "stored");

    const bottleCount = storedBottles?.length || 0;

    if (bottleCount === 0) {
      await supabase
        .from("vault_slots")
        .update({ status: "available", member_id: null, updated_at: new Date().toISOString() })
        .eq("member_id", member_id)
        .eq("status", "assigned");
    } else {
      await supabase
        .from("vault_slots")
        .update({ status: "pending_release", updated_at: new Date().toISOString() })
        .eq("member_id", member_id)
        .eq("status", "assigned");
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("BODEGA_NOTIFY_EMAIL");

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
          subject: `Cellar Club cancellation — ${member.name}`,
          html: `
            <div style="font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0A242C;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E4D5A; margin-bottom: 8px;">Membership cancelled</p>
              <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 24px;">${member.name}</h1>
              <table style="font-size: 12px; border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 6px 0; color: #666; width: 140px;">Email</td><td>${member.email}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Stripe subscription</td><td>${member.stripe_subscription_id ? "Cancelled" : "None on record"}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Bottles in vault</td><td>${bottleCount}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Vault slots</td><td>${bottleCount === 0 ? "Released" : "Pending release — bottles to collect"}</td></tr>
              </table>
              ${bottleCount > 0 ? `<p style="margin-top: 24px; font-size: 12px; color: #c0392b;">This member has ${bottleCount} bottle${bottleCount !== 1 ? "s" : ""} still in the vault. Contact them to arrange collection.</p>` : ""}
              <a href="https://bodegawine.co.uk/admin" style="display: inline-block; margin-top: 24px; padding: 10px 24px; background-color: #1E4D5A; color: #f3f2ee; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">View in admin →</a>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, bottles_remaining: bottleCount }), {
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
