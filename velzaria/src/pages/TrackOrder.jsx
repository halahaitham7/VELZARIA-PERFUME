import { useState } from 'react';
import { orders, ORDER_STAGES } from '../services/api.js';
import { getProduct, products } from '../data/products.js';
import { DiscoveryCase, PageHeader, ProductPhoto, BespokePhoto } from '../components/ui.jsx';
import { money, dateLong, cls } from '../lib/format.js';

export function OrderTimeline({ order }) {
  const current = ORDER_STAGES.findIndex((s) => s.id === order.status);
  return (
    <ol className="timeline-v">
      {ORDER_STAGES.map((s, i) => {
        const at = order.history?.find((h) => h.status === s.id)?.at;
        return (
          <li key={s.id} className={cls(i <= current && 'is-done', i === current && 'is-current')}>
            <span className="timeline-v__dot" />
            <span>
              <strong>{s.label}</strong>
              <small>{at ? dateLong(at) : i === current + 1 ? 'Next' : ''}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItems({ order }) {
  return (
    <ul className="mini-lines">
      {order.items.map((it, i) => {
        const p = it.type === 'product' ? getProduct(it.productId) : null;
        return (
          <li key={i}>
            <span className="mini-lines__thumb">
              <span className={it.type === 'discovery' ? 'thumb thumb--discovery' : 'thumb thumb--photo'}>
                {it.type === 'discovery' ? (
                  <DiscoveryCase />
                ) : it.type === 'bespoke' ? (
                  <BespokePhoto creation={it.creation} />
                ) : (
                  <ProductPhoto product={p} />
                )}
              </span>
              <b>{it.qty}</b>
            </span>
            <span>
              <strong>{it.name}</strong>
              <ul className="line__opts">
                <li>{it.sizeLabel}</li>
                {it.creation && <li>“{it.creation.perfumeName}”</li>}
                {it.options?.engraving && <li>Engraving: “{it.options.engraving}”</li>}
                {it.options?.giftWrap && <li>Gift wrapped</li>}
              </ul>
            </span>
            <span>{money(it.unitPrice * it.qty)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function TrackOrder() {
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  async function submit(e) {
    e.preventDefault();
    if (!number.trim() || !email.trim()) {
      setState({ status: 'error', message: 'Please enter your order number and email address.' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const order = await orders.track(number, email);
      setState({ status: 'done', order });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Order Tracking" title="Where is my essence?" intro="Enter the order number from your confirmation (for example VZ-24018) and the email you used at checkout." />
      <section className="container track" style={{ paddingBottom: 'clamp(72px, 9vw, 130px)' }}>
        <form className="track__form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="t-num">Order number</label>
            <input id="t-num" className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="VZ-24018" />
          </div>
          <div className="field">
            <label htmlFor="t-email">Email</label>
            <input id="t-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <button className="btn" disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Finding…' : 'Track order'}
          </button>
          {state.status === 'error' && <p className="field-error">{state.message}</p>}
        </form>
        {state.status === 'done' && (
          <div className="track__result">
            <div>
              <p className="eyebrow eyebrow--gold">Order {state.order.number}</p>
              <h2 className="h2" style={{ margin: '10px 0 24px' }}>
                {ORDER_STAGES.find((s) => s.id === state.order.status)?.label}
              </h2>
              <OrderTimeline order={state.order} />
            </div>
            <div className="summary">
              <OrderItems order={state.order} />
              <dl className="totals">
                <div className="totals__grand">
                  <dt>Total</dt>
                  <dd>{money(state.order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
