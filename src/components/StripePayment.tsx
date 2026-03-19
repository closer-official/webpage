import { useState, useEffect, useCallback } from 'react';
import { isApiAvailable, api } from '../lib/api';
import type { PriceResult, BillingSelection, PricePlans } from '../lib/api';

const DEFAULT_BILLING: BillingSelection = { plan: 'normal' };

function normalizeBilling(b: BillingSelection): BillingSelection {
  const out = { ...b };
  if (out.plan === 'studentReferral') out.plan = 'student';
  if (out.domainSetup && !out.storeOfficialSubdomain) {
    out.storeOfficialSubdomain = true;
  }
  delete out.domainSetup;
  return out;
}

export function StripePayment() {
  const [billing, setBilling] = useState<BillingSelection>(DEFAULT_BILLING);
  const [pricePlans, setPricePlans] = useState<PricePlans | null>(null);
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payInfo, setPayInfo] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    if (!isApiAvailable()) return;
    try {
      const b = await api.getBilling();
      setBilling(normalizeBilling({ ...DEFAULT_BILLING, ...b }));
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
    setPayInfo(null);
    setLoading(true);
    try {
      const origin = window.location.origin + window.location.pathname;
      const res = await api.createCheckoutSession(
        billing,
        `${origin}?payment=success`,
        `${origin}?payment=cancel`
      );
      if (res.free || !res.url) {
        setPayInfo(res.message ?? 'この内容ではオンライン決済は不要です。運営よりご連絡します。');
        return;
      }
      window.location.href = res.url;
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

      {/* 紹介コード */}
      <div className="billing-section">
        <h3>紹介コード（任意）</h3>
        <p className="hint">
          お渡しした紹介コードをお持ちの方は入力してください。有効なコードは<strong>通常プラン／学割プランの基本料金のみ無料</strong>になります（オプションは別途）。コードは紹介者ごとに異なります。
        </p>
        <input
          type="text"
          className="billing-referral-input"
          value={billing.referralCode ?? ''}
          onChange={(e) => updateBilling({ referralCode: e.target.value })}
          placeholder="コードを入力"
          autoComplete="off"
          style={{ maxWidth: 280, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
      </div>

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
            {Object.entries(pricePlans.other).map(([key, v]) => {
              if ('yenPerYear' in v && typeof v.yenPerYear === 'number') {
                const maxY = v.maxYears ?? 10;
                const years = billing.customDomainYears ?? 0;
                return (
                  <li key={key} className="option-item">
                    <span className="option-label">
                      {v.name}（1年 +{v.yenPerYear.toLocaleString()}円）{v.note && ` ${v.note}`}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={maxY}
                      value={years}
                      onChange={(e) =>
                        updateBilling({
                          customDomainYears: Math.max(0, Math.min(maxY, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      style={{ width: 56 }}
                    />
                  </li>
                );
              }
              const fixed = v as { yen: number; name: string; note?: string };
              return (
                <li key={key} className="option-item">
                  <span className="option-label">
                    {fixed.name}（+{fixed.yen.toLocaleString()}円）{fixed.note && ` ${fixed.note}`}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!billing[key as keyof BillingSelection]}
                      onChange={(e) => updateBilling({ [key]: e.target.checked } as Partial<BillingSelection>)}
                    />
                    <span className="slider" />
                  </label>
                </li>
              );
            })}
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
          {price.referralBaseWaived && (
            <p className="hint" style={{ color: '#0f766e' }}>
              紹介コードが適用され、基本料金は無料の計算です。
            </p>
          )}
          {price.amountYen <= 0 ? (
            <p className="hint" style={{ marginTop: 12, fontWeight: 600 }}>
              この内容では<strong>オンライン決済は不要</strong>です。お手続き・公開URLのご案内は、運営よりメールまたはLINEで行います。
            </p>
          ) : stripeConfigured ? (
            <>
              <button
                type="button"
                className="primary"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? 'リダイレクト中…' : 'Stripeで支払う'}
              </button>
              {payInfo && (
                <p className="hint" style={{ marginTop: 8, color: '#0f766e' }}>
                  {payInfo}
                </p>
              )}
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
