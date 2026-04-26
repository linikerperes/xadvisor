import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY não configurada — pagamentos desativados.");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" })
  : null;

// IDs dos preços no Stripe (configurar no .env após criar produtos no dashboard)
export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "",  // R$ 97/mês
  pro:     process.env.STRIPE_PRICE_PRO || "",       // R$ 197/mês
};

export const PLAN_NAMES: Record<string, string> = {
  [STRIPE_PRICES.starter]: "Starter",
  [STRIPE_PRICES.pro]:     "Pro",
};
