import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { CartLine } from '../components/Overlays.jsx';
import { PageHeader } from '../components/ui.jsx';
import { discounts } from '../services/api.js';
import { money, SHIPPING, shippingFor } from '../lib/format.js';

export function DiscountForm() {
  const { subtotal, cart, setDiscount, discountAmount } = useStore();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  async function apply(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const d = await discounts.validate(code, subtotal);
      setDiscount(d);
      setMsg({ type: 'ok', text: `${d.label} applied.` });
      setCode('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (cart.discount) {
    return (
      <div className="discount-applied">
        <span>
          <strong>{cart.discount.code}</strong> · {cart.discount.label}
          {discountAmount === 0 && <em className="field-error"> — not applicable to this bag</em>}
        </span>
        <button className="line__remove" onClick={() => setDiscount(null)}>
          Remove
        </button>
      </div>
    );
  }
  return (
    <form className="discount" onSubmit={apply}>
      <label className="sr-only" htmlFor="dc">
        Discount code
      </label>
      <input id="dc" className="input" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="btn btn--ghost btn--sm" disabled={busy}>
        {busy ? '…' : 'Apply'}
      </button>
      {msg.text && <p className={msg.type === 'error' ? 'field-error' : 'news-form__ok'}>{msg.text}</p>}
    </form>
  );
}

export function Totals({ zone, shippingLabel }) {
  const { subtotal, discountAmount } = useStore();
  const shipping = shippingFor(zone, subtotal - discountAmount);
  const total = Math.max(0, subtotal - discountAmount) + shipping;
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(subtotal)}</dd>
      </div>
      {discountAmount > 0 && (
        <div>
          <dt>Discount</dt>
          <dd>− {money(discountAmount)}</dd>
        </div>
      )}
      <div>
        <dt>{shippingLabel || 'Shipping'}</dt>
        <dd>{shipping === 0 ? 'Complimentary' : money(shipping)}</dd>
      </div>
      <div className="totals__grand">
        <dt>Total</dt>
        <dd>{money(total)}</dd>
      </div>
    </dl>
  );
}

export default function Cart() {
  const { cart } = useStore();
  const [zone, setZone] = useState('cairo');

  if (cart.lines.length === 0) {
    return (
      <section className="container notfound">
        <p className="eyebrow eyebrow--gold">Your bag</p>
        <h1 className="h1">Your bag is empty.</h1>
        <p className="lead">Five essences are waiting to meet you.</p>
        <div className="hero__ctas" style={{ justifyContent: 'center' }}>
          <Link to="/shop" className="btn">
            Continue shopping
          </Link>
          <Link to="/create" className="btn btn--ghost">
            Create your perfume
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Your bag" title="Shopping bag" />
      <section className="container cart" style={{ paddingBottom: 'clamp(72px, 9vw, 130px)' }}>
        <div className="cart__lines">
          {cart.lines.map((l) => (
            <CartLine key={l.key} line={l} />
          ))}
          <Link to="/shop" className="link" style={{ marginTop: 28 }}>
            ← Continue shopping
          </Link>
        </div>
        <aside className="summary">
          <h2 className="h3">Order summary</h2>
          <div className="field">
            <label htmlFor="zone">Estimate shipping to</label>
            <select id="zone" className="select" value={zone} onChange={(e) => setZone(e.target.value)}>
              {SHIPPING.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label} · {z.eta}
                </option>
              ))}
            </select>
          </div>
          <DiscountForm />
          <Totals zone={zone} />
          <Link to="/checkout" className="btn btn--block">
            Proceed to checkout
          </Link>
          <p className="tiny muted center">Secure checkout · Cards, mobile wallets, Fawry or cash on delivery</p>
        </aside>
      </section>
    </>
  );
}
