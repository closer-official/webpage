/**
 * Stripe Checkout Session 作成（STRIPE_SECRET_KEY が設定されている場合のみ有効）
 */
let stripe = null;

async function getStripe() {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) return null;
  const { default: Stripe } = await import('stripe');
  stripe = new Stripe(key);
  return stripe;
}

/**
 * @param {number} amountYen - 合計金額（円）
 * @param {Array<{ name: string, yen: number }>} items - 内訳（表示用）
 * @param {string} successUrl - 決済成功時のリダイレクトURL
 * @param {string} cancelUrl - キャンセル時のリダイレクトURL
 * @param {Record<string, unknown>} metadata - プラン・オプション（metadata に保存）
 */
export async function createCheckoutSession(amountYen, items, successUrl, cancelUrl, metadata = {}) {
  const s = await getStripe();
  if (!s) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'jpy',
      product_data: {
        name: item.name,
        description: `${item.yen}円`,
      },
      unit_amount: item.yen,
    },
    quantity: 1,
  }));

  const session = await s.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      billing: JSON.stringify(metadata),
    },
  });

  return { url: session.url, sessionId: session.id };
}

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!(key && key.startsWith('sk_'));
}
