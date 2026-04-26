import type { Express } from "express";
import express from "express";
import { stripe } from "./stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export function registerStripeWebhook(app: Express) {
  if (!stripe) return;

  // Raw body necessário para verificar assinatura do Stripe
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET não configurado");
        return res.status(500).send("Webhook secret não configurado");
      }

      let event: any;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe Webhook] Assinatura inválida:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      const db = await getDb();
      if (!db) return res.json({ received: true });

      try {
        switch (event.type) {
          // Pagamento inicial ou renovação bem-sucedida
          case "checkout.session.completed": {
            const session = event.data.object;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;
            const customerEmail = session.customer_email || session.customer_details?.email;

            // Busca a subscription para pegar priceId e período
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            const periodEnd = new Date(subscription.current_period_end * 1000);

            // Atualiza usuário pelo email ou stripeCustomerId
            const whereClause = customerEmail
              ? eq(users.email, customerEmail)
              : eq(users.stripeCustomerId, customerId);

            await db.update(users)
              .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: periodEnd,
                subscriptionStatus: "active",
              })
              .where(whereClause);

            console.log(`[Stripe] Assinatura ativada para ${customerEmail}`);
            break;
          }

          // Renovação mensal
          case "invoice.payment_succeeded": {
            const invoice = event.data.object;
            if (invoice.billing_reason === "subscription_cycle") {
              const subscriptionId = invoice.subscription as string;
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const periodEnd = new Date(subscription.current_period_end * 1000);
              const priceId = subscription.items.data[0]?.price.id;

              await db.update(users)
                .set({
                  subscriptionStatus: "active",
                  stripeCurrentPeriodEnd: periodEnd,
                  stripePriceId: priceId,
                })
                .where(eq(users.stripeSubscriptionId, subscriptionId));

              console.log(`[Stripe] Renovação processada — subscription ${subscriptionId}`);
            }
            break;
          }

          // Pagamento falhou
          case "invoice.payment_failed": {
            const invoice = event.data.object;
            const subscriptionId = invoice.subscription as string;

            await db.update(users)
              .set({ subscriptionStatus: "expired" })
              .where(eq(users.stripeSubscriptionId, subscriptionId));

            console.log(`[Stripe] Pagamento falhou — subscription ${subscriptionId}`);
            break;
          }

          // Assinatura cancelada ou expirada
          case "customer.subscription.deleted": {
            const subscription = event.data.object;
            await db.update(users)
              .set({ subscriptionStatus: "canceled", stripeSubscriptionId: null })
              .where(eq(users.stripeSubscriptionId, subscription.id));

            console.log(`[Stripe] Assinatura cancelada — ${subscription.id}`);
            break;
          }

          // Assinatura pausada/atualizada
          case "customer.subscription.updated": {
            const subscription = event.data.object;
            const status = subscription.status === "active" ? "active" : "expired";
            const periodEnd = new Date(subscription.current_period_end * 1000);
            const priceId = subscription.items.data[0]?.price.id;

            await db.update(users)
              .set({ subscriptionStatus: status, stripeCurrentPeriodEnd: periodEnd, stripePriceId: priceId })
              .where(eq(users.stripeSubscriptionId, subscription.id));
            break;
          }
        }
      } catch (err) {
        console.error("[Stripe Webhook] Erro ao processar evento:", err);
      }

      res.json({ received: true });
    }
  );
}
