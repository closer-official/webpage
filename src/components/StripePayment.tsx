import { useState, useEffect, useCallback } from 'react';
import { isApiAvailable, api } from '../lib/api';
import type { PriceResult, BillingSelection, PricePlans } from '../lib/api';

const DEFAULT_BILLING: BillingSelection = { plan: 'normal' };

export function StripePayment() {
  const [billing, setBilling] = useState<BillingSelection>(DEFAULT_BILLING);
  const [pricePlans, setPricePlans] = useState<PricePlans | null>(null);
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    if (!isApiAvailable()) return;
    try {
      const b = await api.getBilling();
      setBilling({ ...DEFAULT_BILLING, ...b });
    } catch {
      setBilling(DEFAULT_BILLING);
    }
  }, []);

  const loadPricePlans = useCallback(async () => {
    if (!isApiAvailable()) return;
    try {
      const p = await api.getPricePlans();
      setPricePlans(p);
    } catch {
      setPricePlans(null);
    }
  }, []);

  const loadPrice = useCallback(async () => {
    if (!isApiAvailable()) return;
    try {
      const result = await api.getPrice(billing);
      setPrice(result);
    } catch {
      setPrice(null);
    }
  }, [billing]);

  useEffect(() => {
    loadBilling();
    loadPricePlans();
  }, [loadBilling, loadPricePlans]);

  useEffect(() => {
    loadPrice();
  }, [loadPrice]);

  useEffect(() => {
    if (!isApiAvailable()) return;
    api.getStripeConfigured().then((r) => setStripeConfigured(r.configured)).catch(() => setStripeConfigured(false));
  }, []);

  const updateBilling = useCallback(
    (patch: Partial<BillingSelection>) => {
      const next = { ...billing, ...patch };
      setBilling(next);
      if (isApiAvailable()) api.setBilling(next);
    },
    [billing]
  );

  const handlePay = async () => {
    if (!price || price.amountYen <= 0) return;
    setError(null);
    setLoading(true);
    try {
      const origin = window.location.origin + window.location.pathname;
      const { url } = await api.createCheckoutSession(
        billing,
        `${origin}?payment=success`,
        `${origin}?payment=cancel`
      );
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : '決済の開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isApiAvailable()) return null;

  return (
    <div className="panel stripe-payment">
      <h2>料金・お支払い</h2>
      <p className="hint">プランとオプションを選ぶと合計が算出されます。Stripeで決済できます。</p>

      {/* プラン */}
      {pricePlans && pricePlans.plans.length > 0 && (
        <div className="billing-section">
          <h3>プラン</h3>
          <div className="plan-options">
            {pricePlans.plans.map((p) => (
              <label key={p.id} className="plan-option">
                <input
                  type="radio"
                  name="plan"
                  checked={(billing.plan || 'normal') === p.id}
                  onChange={() => updateBilling({ plan: p.id as BillingSelection['plan'] })}
                />
                <span className="plan-name">{p.name}</span>
                <span className="plan-yen">{p.yen.toLocaleString()}円</span>
                {p.target && <span className="plan-target">（{p.target}）</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 削除オプション（値引き） */}
      {pricePlans && Object.keys(pricePlans.removals).length > 0 && (
        <div className="billing-section">
          <h3>削除オプション（値引き）</h3>
          <ul className="option-list">
            {Object.entries(pricePlans.removals).map(([key, v]) => {
              if (key === 'languageRemovalPer') {
                const count = billing.languageRemovalCount ?? 0;
                return (
                  <li key={key} className="option-item">
                    <span className="option-label">{v.namePer}（1つ ▲2,000円）</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={count}
                      onChange={(e) => updateBilling({ languageRemovalCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      style={{ width: 56 }}
                    />
                  </li>
                );
              }
              const checked = !!billing[key as keyof BillingSelection];
              const yenLabel = v.yen < 0 ? `▲${(-v.yen).toLocaleString()}円` : `+${v.yen.toLocaleString()}円`;
              return (
                <li key={key} className="option-item">
                  <span className="option-label">{v.name}（{yenLabel}）</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateBilling({ [key]: e.target.checked })}
                    />
                    <span className="slider" />
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 追加オプション */}
      {pricePlans && Object.keys(pricePlans.addons).length > 0 && (
        <div className="billing-section">
          <h3>追加オプション</h3>
          <ul className="option-list">
            {Object.entries(pricePlans.addons).map(([key, v]) => (
              <li key={key} className="option-item">
                <span className="option-label">{v.name}（+{v.yen.toLocaleString()}円）</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!billing[key as keyof BillingSelection]}
                    onChange={(e) => updateBilling({ [key]: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* その他サービス */}
      {pricePlans && Object.keys(pricePlans.other).length > 0 && (
        <div className="billing-section">
          <h3>その他サービス</h3>
          <ul className="option-list">
            {Object.entries(pricePlans.other).map(([key, v]) => (
              <li key={key} className="option-item">
                <span className="option-label">{v.name}（+{v.yen.toLocaleString()}円）{v.note && ` ${v.note}`}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!billing[key as keyof BillingSelection]}
                    onChange={(e) => updateBilling({ [key]: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="small" onClick={loadPrice} style={{ marginBottom: 12 }}>
        料金を再計算
      </button>

      {price && (
        <>
          <ul className="price-items">
            {price.items.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <span>{item.yen >= 0 ? item.yen.toLocaleString() : `▲${(-item.yen).toLocaleString()}`}円</span>
              </li>
            ))}
          </ul>
          <p className="price-total">
            合計: <strong>{price.amountYen.toLocaleString()}円</strong>
          </p>
          {stripeConfigured ? (
            <>
              <button
                type="button"
                className="primary"
                onClick={handlePay}
                disabled={loading || price.amountYen <= 0}
              >
                {loading ? 'リダイレクト中…' : 'Stripeで支払う'}
              </button>
              {error && <p className="error">{error}</p>}
            </>
          ) : (
            <p className="hint">サーバーに STRIPE_SECRET_KEY を設定すると「Stripeで支払う」が利用できます。</p>
          )}
        </>
      )}
    </div>
  );
}
