import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, lineUnitPrice } from '../context/StoreContext.jsx';
import { orders, auth, MODE } from '../services/api.js';
import { PAYMENT_METHODS, startPayment } from '../services/payments.js';
import { LineThumb, LineDetails } from '../components/Overlays.jsx';
import { DiscountForm, Totals } from './Cart.jsx';
import { money, cls, SHIPPING, shippingFor } from '../lib/format.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+?20)?0?1[0125]\d{8}$/;

export default function Checkout() {
  const { cart, subtotal, discountAmount, user, setUser, clearCart } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState(user ? 'account' : 'guest');
  const [f, setF] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    zone: 'cairo',
    notes: '',
    saveDetails: true,
  });
  const [payment, setPayment] = useState('card');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState('');

  useEffect(() => {
    if (user) {
      setMode('account');
      setF((x) => ({
        ...x,
        email: user.email,
        firstName: x.firstName || user.firstName,
        lastName: x.lastName || user.lastName,
        phone: x.phone || user.phone || '',
        city: x.city || user.city || '',
        address: x.address || user.address || '',
      }));
    }
  }, [user]);

  if (cart.lines.length === 0) {
    return (
      <section className="container notfound">
        <h1 className="h1">There is nothing to check out yet.</h1>
        <Link to="/shop" className="btn">
          Continue shopping
        </Link>
      </section>
    );
  }

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const shipping = shippingFor(f.zone, subtotal - discountAmount);
  const total = Math.max(0, subtotal - discountAmount) + shipping;
  const zone = SHIPPING.zones.find((z) => z.id === f.zone);

  function validate() {
    const e = {};
    if (!EMAIL_RE.test(f.email)) e.email = 'Please enter a valid email address.';
    if (!PHONE_RE.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Please enter a valid Egyptian mobile number, e.g. 010 1234 5678.';
    if (!f.firstName.trim()) e.firstName = 'Required.';
    if (!f.lastName.trim()) e.lastName = 'Required.';
    if (f.address.trim().length < 5) e.address = 'Please enter your street address.';
    if (!f.city.trim()) e.city = 'Required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder(ev) {
    ev.preventDefault();
    setFatal('');
    if (!validate()) {
      setTimeout(() => document.querySelector('.checkout .field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
      return;
    }
    setBusy(true);
    try {
      const order = await orders.create({
        userId: user?.id || null,
        email: f.email,
        phone: f.phone,
        customer: { firstName: f.firstName.trim(), lastName: f.lastName.trim() },
        shippingAddress: { address: f.address.trim(), apartment: f.apartment.trim(), city: f.city.trim(), zone: zone.label },
        notes: f.notes.trim(),
        items: cart.lines.map((l) => ({
          name: l.name,
          type: l.type,
          productId: l.productId,
          size: l.size,
          sizeLabel: l.sizeLabel,
          qty: l.qty,
          unitPrice: lineUnitPrice(l),
          options: l.options,
          creation: l.creation ? { id: l.creation.id, perfumeName: l.creation.perfumeName, creatorName: l.creation.creatorName, silhouette: l.creation.silhouette, glass: l.creation.glass, liquid: l.creation.liquid, cap: l.creation.cap, engraving: l.creation.engraving, engravingStyle: l.creation.engravingStyle } : undefined,
        })),
        subtotal,
        discount: cart.discount && discountAmount > 0 ? { code: cart.discount.code, amount: discountAmount } : null,
        shipping,
        total,
        payment: { method: payment, provider: PAYMENT_METHODS.find((m) => m.id === payment).provider, status: 'pending' },
      });
      const pay = await startPayment(order, payment);
      if (pay.status === 'redirecting') return; // gateway page takes over
      if (user && f.saveDetails) {
        auth.updateProfile(user.id, { phone: f.phone, city: f.city, address: f.address }).then(setUser).catch(() => {});
      }
      clearCart();
      navigate(`/order/${order.id}`, { state: { payment: pay } });
    } catch (err) {
      setFatal(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <section className="container checkout">
      <form className="checkout__form" onSubmit={placeOrder} noValidate>
        <h1 className="h1">Checkout</h1>

        <div className="checkout__mode" role="tablist" aria-label="Checkout type">
          {user ? (
            <p className="small">
              Signed in as <strong>{user.email}</strong>.{' '}
            </p>
          ) : (
            <>
              <button type="button" role="tab" aria-selected={mode === 'guest'} className={cls('tab', mode === 'guest' && 'is-active')} onClick={() => setMode('guest')}>
                Guest checkout
              </button>
              <button type="button" role="tab" aria-selected={mode === 'account'} className={cls('tab', mode === 'account' && 'is-active')} onClick={() => setMode('account')}>
                I have an account
              </button>
            </>
          )}
        </div>
        {!user && mode === 'account' && (
          <div className="notice" style={{ marginBottom: 24 }}>
            <Link to="/login?next=/checkout" className="link-inline">
              Sign in
            </Link>{' '}
            to use your saved details and see this order in your account — your bag will be waiting.
          </div>
        )}

        <fieldset className="checkout__section">
          <legend className="h3">
            <span className="numeral">01</span> Customer information
          </legend>
          <div className="form-grid">
            <F id="email" label="Email" error={errors.email} full>
              <input id="email" type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" readOnly={!!user} />
            </F>
            <F id="fn" label="First name" error={errors.firstName}>
              <input id="fn" className="input" value={f.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" />
            </F>
            <F id="ln" label="Last name" error={errors.lastName}>
              <input id="ln" className="input" value={f.lastName} onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" />
            </F>
            <F id="phone" label="Phone number" error={errors.phone} full>
              <input id="phone" type="tel" className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="010 1234 5678" />
            </F>
          </div>
        </fieldset>

        <fieldset className="checkout__section">
          <legend className="h3">
            <span className="numeral">02</span> Shipping address
          </legend>
          <div className="form-grid">
            <F id="addr" label="Street address" error={errors.address} full>
              <input id="addr" className="input" value={f.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />
            </F>
            <F id="apt" label="Building, floor, apartment (optional)" full>
              <input id="apt" className="input" value={f.apartment} onChange={(e) => set('apartment', e.target.value)} />
            </F>
            <F id="city" label="City / district" error={errors.city}>
              <input id="city" className="input" value={f.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" />
            </F>
            <F id="zone" label="Region">
              <select id="zone" className="select" value={f.zone} onChange={(e) => set('zone', e.target.value)}>
                {SHIPPING.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </F>
            <F id="notes" label="Delivery notes (optional)" full>
              <textarea id="notes" className="textarea" rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Landmark, preferred delivery time…" />
            </F>
          </div>
          <p className="small muted">
            {zone.label}: {zone.eta} · {shipping === 0 ? 'Complimentary shipping' : `${money(shipping)} shipping`}
          </p>
          {user && (
            <label className="check">
              <input type="checkbox" checked={f.saveDetails} onChange={(e) => set('saveDetails', e.target.checked)} />
              <span>Save these details to my account</span>
            </label>
          )}
        </fieldset>

        <fieldset className="checkout__section">
          <legend className="h3">
            <span className="numeral">03</span> Payment method
          </legend>
          <div className="pay-options" role="radiogroup">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={cls('pay', payment === m.id && 'is-active')}>
                <input type="radio" name="pay" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                <span className="pay__radio" />
                <span>
                  <strong>{m.label}</strong>
                  {m.provider && <em> · via {m.provider}</em>}
                  <small>{m.desc}</small>
                </span>
              </label>
            ))}
          </div>
          {MODE === 'prototype' && payment !== 'cod' && (
            <p className="notice">
              <strong>Prototype · </strong>No payment gateway is connected yet, so you will not be redirected and no payment will be taken. Your order will be recorded as
              “payment not processed”.
            </p>
          )}
        </fieldset>

        {fatal && <p className="field-error">{fatal}</p>}
        <button className="btn btn--block checkout__place" type="submit" disabled={busy}>
          {busy ? 'Placing your order…' : `Place order · ${money(total)}`}
        </button>
        <p className="tiny muted center">
          By placing your order you agree to our <Link to="/info/terms" className="link-inline">Terms</Link> and{' '}
          <Link to="/info/privacy" className="link-inline">Privacy Policy</Link>.
        </p>
      </form>

      <aside className="summary checkout__summary">
        <h2 className="h3">Order summary</h2>
        <ul className="mini-lines">
          {cart.lines.map((l) => (
            <li key={l.key}>
              <span className="mini-lines__thumb">
                <LineThumb line={l} />
                <b>{l.qty}</b>
              </span>
              <span>
                <strong>{l.name}</strong>
                <LineDetails line={l} />
              </span>
              <span>{money(lineUnitPrice(l) * l.qty)}</span>
            </li>
          ))}
        </ul>
        <DiscountForm />
        <Totals zone={f.zone} shippingLabel={`Shipping · ${zone.label}`} />
        <Link to="/cart" className="link">
          Edit bag
        </Link>
      </aside>
    </section>
  );
}

function F({ id, label, error, full, children }) {
  return (
    <div className={cls('field', full && 'full')}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
