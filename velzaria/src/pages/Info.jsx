import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { SHIPPING, money, cls } from '../lib/format.js';
import { PageHeader } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

/** Replace with the brand's confirmed contact details before launch. */
export const CONTACT = {
  email: 'care@velzaria.com',
  hours: 'Sunday to Thursday, 10:00–18:00 (Cairo time)',
};

const PAGES = {
  support: { title: 'Customer Support', eyebrow: 'Customer Care', body: Support },
  'shipping-returns': { title: 'Shipping & Returns', eyebrow: 'Customer Care', body: Shipping },
  privacy: { title: 'Privacy Policy', eyebrow: 'Legal', body: Privacy },
  terms: { title: 'Terms & Conditions', eyebrow: 'Legal', body: Terms },
};

export default function Info() {
  const { page } = useParams();
  const def = PAGES[page];
  useEffect(() => {
    if (def) document.title = `${def.title} — VÉLZARIA`;
  }, [def]);
  if (!def) return <NotFound />;
  const Body = def.body;
  return (
    <>
      <PageHeader eyebrow={def.eyebrow} title={def.title} />
      <section className="container info" style={{ paddingBottom: 'clamp(72px, 9vw, 130px)' }}>
        <nav className="info__nav" aria-label="Customer care">
          {Object.entries(PAGES).map(([k, v]) => (
            <NavLink key={k} to={`/info/${k}`} className={({ isActive }) => cls(isActive && 'is-active')}>
              {v.title}
            </NavLink>
          ))}
          <Link to="/track">Track an order</Link>
        </nav>
        <article className="prose">
          <Body />
        </article>
      </section>
    </>
  );
}

function Support() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'Order', message: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email) || form.message.trim().length < 10) {
      setError('Please add your name, a valid email and a short message.');
      return;
    }
    // Integration point: POST /support/messages
    try {
      const list = JSON.parse(localStorage.getItem('vz_support_v1') || '[]');
      list.push({ ...form, at: new Date().toISOString() });
      localStorage.setItem('vz_support_v1', JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setState('done');
  }
  return (
    <>
      <h2>How can we help?</h2>
      <p>
        Our customer care team answers every message personally, {CONTACT.hours}. You can also write to us at{' '}
        <a href={`mailto:${CONTACT.email}`} className="link-inline">
          {CONTACT.email}
        </a>
        .
      </p>
      <ul>
        <li>
          Where is my order? — <Link to="/track" className="link-inline">Track it here</Link> with your order number and email.
        </li>
        <li>
          Which essence suits me? — <Link to="/create" className="link-inline">Take the personality journey</Link> or order the{' '}
          <Link to="/shop/discovery-set" className="link-inline">Discovery Set</Link>.
        </li>
        <li>
          Returns and exchanges — see <Link to="/info/shipping-returns" className="link-inline">Shipping & Returns</Link>.
        </li>
      </ul>
      <h2>Send us a message</h2>
      {state === 'done' ? (
        <p className="serif-lead">Thank you, {form.name.split(' ')[0]}. We will reply to {form.email} within one business day.</p>
      ) : (
        <form onSubmit={submit} className="form-grid" noValidate>
          <div className="field">
            <label htmlFor="s-name">Name</label>
            <input id="s-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="s-email">Email</label>
            <input id="s-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field full">
            <label htmlFor="s-topic">Topic</label>
            <select id="s-topic" className="select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
              {['Order', 'Product advice', 'Bespoke creation', 'Creator’s Award', 'Returns', 'Other'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="s-msg">Message</label>
            <textarea id="s-msg" className="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          {error && <p className="field-error full">{error}</p>}
          <div className="full">
            <button className="btn" type="submit">
              Send message
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function Shipping() {
  return (
    <>
      <h2>Shipping across Egypt</h2>
      <p>Complimentary shipping on every order over {money(SHIPPING.freeOver)}. Orders placed before 14:00 on a business day are prepared the same day.</p>
      <table>
        <thead>
          <tr>
            <th>Destination</th>
            <th>Delivery</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          {SHIPPING.zones.map((z) => (
            <tr key={z.id}>
              <td>{z.label}</td>
              <td>{z.eta}</td>
              <td>{money(z.fee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Engraved bottles are made to order and ship within 3–4 business days. Bespoke creations follow the timeline agreed with our perfumer.</p>
      <h2>Returns</h2>
      <ul>
        <li>Unopened, sealed products may be returned within 14 days of delivery for a full refund to the original payment method.</li>
        <li>For hygiene reasons, opened perfumes cannot be returned unless faulty.</li>
        <li>Engraved, personalised and bespoke pieces are made for you and cannot be returned unless faulty or damaged.</li>
        <li>If your order arrives damaged, contact us within 48 hours with a photo and we will replace it at no cost.</li>
      </ul>
      <p>
        To start a return, <Link to="/info/support" className="link-inline">contact customer care</Link> with your order number.
      </p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <p className="notice">
        <strong>Draft · </strong>This policy describes how this website is designed to handle data. Have it reviewed by a legal adviser in line with Egypt’s Personal Data
        Protection Law (No. 151 of 2020) before launch.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, phone number and delivery addresses.</li>
        <li>Orders: products purchased, gift messages and engraving text.</li>
        <li>Creations: your quiz answers, fragrance concepts and bottle designs, and any Creator’s Award submissions and images.</li>
        <li>Newsletter: your email address and subscription preferences.</li>
      </ul>
      <h2>What we do not collect</h2>
      <p>Card details are entered only on our payment provider’s secure page and are never stored by VÉLZARIA.</p>
      <h2>How we use it</h2>
      <p>To deliver your orders, keep your account and creations, run the Creator’s Award, and — only if you choose — send you news. We never sell your personal data.</p>
      <h2>Your choices</h2>
      <p>You can update your details, unsubscribe or ask us to delete your account at any time from your account settings or by contacting {CONTACT.email}.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <p className="notice">
        <strong>Draft · </strong>Have these terms reviewed by a legal adviser before launch.
      </p>
      <h2>Orders & pricing</h2>
      <p>All prices are in Egyptian pounds (EGP) and include VAT where applicable. An order is confirmed once payment is verified, or once it is accepted for cash on delivery.</p>
      <h2>Personalised products</h2>
      <p>Engraving text is reproduced exactly as entered. Please check spelling carefully — personalised items cannot be returned unless faulty.</p>
      <h2>Bespoke creations</h2>
      <p>
        The Create Your Perfume experience produces a conceptual recommendation, not a tested formula. A bespoke order includes a perfumer consultation and a trial sample for
        your approval before production. If you do not approve the sample, your payment is refunded less the cost of the sample.
      </p>
      <h2>Creator’s Award</h2>
      <p>
        Participation is governed by the <Link to="/creators-award#terms" className="link-inline">competition rules</Link>, which form part of these terms.
      </p>
      <h2>Liability</h2>
      <p>Perform a patch test before first use. Discontinue use if irritation occurs. Keep away from children, eyes and open flames.</p>
    </>
  );
}
