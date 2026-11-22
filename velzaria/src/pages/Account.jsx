import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { auth, orders as ordersApi, creations as creationsApi, award, deviceOwner, resetPrototypeData, ORDER_STAGES, MODE } from '../services/api.js';
import { getProduct, BESPOKE } from '../data/products.js';
import { BespokePhoto } from '../components/ui.jsx';
import { WishlistGrid } from './Wishlist.jsx';
import { OrderTimeline, OrderItems } from './TrackOrder.jsx';
import { PAYMENT_STATUS } from './OrderConfirmation.jsx';
import { money, dateLong, cls } from '../lib/format.js';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'orders', label: 'My Orders' },
  { id: 'wishlist', label: 'My Wishlist' },
  { id: 'creations', label: 'My Creations' },
  { id: 'settings', label: 'Account Settings' },
];

export default function Account() {
  const { user, authReady } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'profile';

  if (!authReady) return <div className="container" style={{ minHeight: '50vh' }} />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(`/account?tab=${tab}`)}`} replace />;

  return (
    <section className="container account">
      <header className="account__head">
        <p className="eyebrow eyebrow--gold">My Account</p>
        <h1 className="h1">
          Hello, <em>{user.firstName}.</em>
        </h1>
      </header>
      <div className="account__layout">
        <nav className="account__nav" aria-label="Account sections">
          {TABS.map((t) => (
            <button key={t.id} className={cls(tab === t.id && 'is-active')} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setParams({ tab: t.id })}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="account__body" key={tab}>
          {tab === 'profile' && <Profile />}
          {tab === 'orders' && <Orders />}
          {tab === 'wishlist' && <WishlistGrid />}
          {tab === 'creations' && <Creations />}
          {tab === 'settings' && <Settings />}
        </div>
      </div>
    </section>
  );
}

function Profile() {
  const { user, wishlist } = useStore();
  const [counts, setCounts] = useState({ orders: 0, creations: 0 });
  useEffect(() => {
    Promise.all([ordersApi.mine(user), creationsApi.list(user.id)]).then(([o, c]) => setCounts({ orders: o.length, creations: c.length }));
  }, [user]);
  return (
    <div className="stack" style={{ '--stack': '32px' }}>
      <div className="acc-stats">
        <Link to="/account?tab=orders">
          <strong>{counts.orders}</strong>
          <span>Orders</span>
        </Link>
        <Link to="/account?tab=creations">
          <strong>{counts.creations}</strong>
          <span>Creations</span>
        </Link>
        <Link to="/account?tab=wishlist">
          <strong>{wishlist.length}</strong>
          <span>Wishlist</span>
        </Link>
      </div>
      <div className="acc-card">
        <h2 className="h3">Profile information</h2>
        <dl className="acc-dl">
          <div>
            <dt>Name</dt>
            <dd>
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{user.phone || '—'}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{[user.address, user.city].filter(Boolean).join(', ') || '—'}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{dateLong(user.createdAt)}</dd>
          </div>
        </dl>
        <Link to="/account?tab=settings" className="link">
          Edit details
        </Link>
      </div>
    </div>
  );
}

function Orders() {
  const { user } = useStore();
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    ordersApi.mine(user).then(setList);
  }, [user]);
  if (!list) return <p className="muted">Loading your orders…</p>;
  if (list.length === 0)
    return (
      <div className="shop-empty">
        <p className="serif-lead">You have not placed an order yet.</p>
        <Link to="/shop" className="btn">
          Discover the collection
        </Link>
      </div>
    );
  return (
    <div className="orders">
      {list.map((o) => (
        <article key={o.id} className="order-row">
          <button className="order-row__head" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
            <span>
              <strong>{o.number}</strong>
              <small>{dateLong(o.createdAt)}</small>
            </span>
            <span className="order-row__status">{ORDER_STAGES.find((s) => s.id === o.status)?.label}</span>
            <span>{o.items.reduce((a, i) => a + i.qty, 0)} items</span>
            <span className="order-row__total">{money(o.total)}</span>
            <span aria-hidden="true">{open === o.id ? '–' : '+'}</span>
          </button>
          {open === o.id && (
            <div className="order-row__body">
              <div>
                <span className="label">Order tracking</span>
                <OrderTimeline order={o} />
                <p className="small muted">Payment: {PAYMENT_STATUS[o.payment.status] || o.payment.status} · {o.payment.method}</p>
              </div>
              <OrderItems order={o} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function Creations() {
  const { user, addToCart, toast } = useStore();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [subs, setSubs] = useState([]);
  const [view, setView] = useState('designs');

  function load() {
    creationsApi.list(user.id).then(setList);
    award.mine([user.id, deviceOwner()]).then(setSubs);
  }
  useEffect(load, [user]);

  async function remove(c) {
    if (!window.confirm(`Delete “${c.perfumeName}”? This cannot be undone.`)) return;
    await creationsApi.remove(c.id);
    toast('Creation deleted');
    load();
  }

  if (!list) return <p className="muted">Loading…</p>;
  if (list.length === 0 && subs.length === 0)
    return (
      <div className="shop-empty">
        <p className="serif-lead">You have not composed a perfume yet.</p>
        <Link to="/create" className="btn">
          Create my perfume
        </Link>
      </div>
    );

  return (
    <div className="stack" style={{ '--stack': '36px' }}>
      <div className="acc-subtabs" role="tablist">
        <button role="tab" aria-selected={view === 'designs'} className={cls('tab', view === 'designs' && 'is-active')} onClick={() => setView('designs')}>
          Saved perfume designs ({list.length})
        </button>
        <button role="tab" aria-selected={view === 'bottles'} className={cls('tab', view === 'bottles' && 'is-active')} onClick={() => setView('bottles')}>
          Personalised bottles
        </button>
        <button role="tab" aria-selected={view === 'award'} className={cls('tab', view === 'award' && 'is-active')} onClick={() => setView('award')}>
          Award submissions ({subs.length})
        </button>
      </div>

      {view === 'designs' && (
        <div className="creations">
          {list.map((c) => {
            const p = getProduct(c.result.primary);
            return (
              <article key={c.id} className="creation">
                <div className="creation__bottle creation__bottle--photo">
                  <BespokePhoto creation={c} />
                </div>
                <div className="creation__body">
                  <span className="tiny muted">{dateLong(c.createdAt)}</span>
                  <h3 className="h3">{c.perfumeName}</h3>
                  <p className="small muted">
                    {c.result.family} · inspired by {p.name}
                  </p>
                  <dl className="notes-mini">
                    {['top', 'heart', 'base'].map((k) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{c.result.composition[k].join(', ')}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="creation__actions">
                    <button
                      className="btn btn--sm"
                      onClick={() =>
                        addToCart({ type: 'bespoke', productId: 'bespoke', name: BESPOKE.name, size: '50', sizeLabel: '50 ml · Eau de Parfum', basePrice: BESPOKE.price, options: {}, creation: c })
                      }
                    >
                      Commission · {money(BESPOKE.price)}
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/creators-award?creation=${c.id}#submit`)}>
                      Submit to Award
                    </button>
                    <button className="line__remove" onClick={() => remove(c)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          <Link to="/create" className="link">
            Compose another
          </Link>
        </div>
      )}

      {view === 'bottles' && (
        <div className="bottle-gallery">
          {list.map((c) => (
            <figure key={c.id}>
              <div className="bottle-gallery__stage bottle-gallery__stage--photo">
                <BespokePhoto creation={c} />
                {c.engraving && <span className="stage__engraving">{c.engraving}</span>}
              </div>
              <figcaption>
                <strong>{c.perfumeName}</strong>
                <small>
                  {c.tint} glass · {c.cap} cap{c.engraving ? ` · “${c.engraving}”` : ''}
                </small>
                {c.message && <em>“{c.message}”</em>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {view === 'award' && (
        <div className="orders">
          {subs.length === 0 && <p className="muted">No submissions yet. <Link to="/creators-award" className="link-inline">Discover the Creator’s Award</Link>.</p>}
          {subs.map((s) => (
            <div key={s.id} className="order-row">
              <div className="order-row__head" style={{ cursor: 'default' }}>
                <span>
                  <strong>{s.conceptName}</strong>
                  <small>{dateLong(s.createdAt)}</small>
                </span>
                <span>Ref. {s.reference}</span>
                <span className="order-row__status">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Settings() {
  const { user, setUser, toast } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, city: user.city, address: user.address, newsletter: user.newsletter });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState({});

  async function save(e) {
    e.preventDefault();
    try {
      const u = await auth.updateProfile(user.id, f);
      setUser(u);
      setMsg({ profile: 'Your details have been saved.' });
    } catch (err) {
      setMsg({ profileError: err.message });
    }
  }
  async function changePw(e) {
    e.preventDefault();
    if (pw.next.length < 8) return setMsg({ pwError: 'Your new password must be at least 8 characters.' });
    try {
      await auth.changePassword(user.id, pw.current, pw.next);
      setPw({ current: '', next: '' });
      setMsg({ pw: 'Your password has been changed.' });
    } catch (err) {
      setMsg({ pwError: err.message });
    }
  }
  async function signOut() {
    await auth.logout();
    setUser(null);
    toast('You have been signed out.');
    navigate('/');
  }

  return (
    <div className="stack" style={{ '--stack': '24px' }}>
      <form className="acc-card" onSubmit={save}>
        <h2 className="h3">Personal details</h2>
        <div className="form-grid">
          {[
            ['firstName', 'First name'],
            ['lastName', 'Last name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['city', 'City'],
            ['address', 'Address'],
          ].map(([k, l]) => (
            <div className="field" key={k}>
              <label htmlFor={`st-${k}`}>{l}</label>
              <input id={`st-${k}`} className="input" value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </div>
          ))}
          <label className="check full">
            <input type="checkbox" checked={!!f.newsletter} onChange={(e) => setF({ ...f, newsletter: e.target.checked })} />
            <span>Receive the VÉLZARIA Letter — new collections and exclusive releases.</span>
          </label>
        </div>
        {msg.profile && <p className="news-form__ok">{msg.profile}</p>}
        {msg.profileError && <p className="field-error">{msg.profileError}</p>}
        <button className="btn" style={{ marginTop: 18 }}>
          Save details
        </button>
      </form>

      <form className="acc-card" onSubmit={changePw}>
        <h2 className="h3">Change password</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="pw-c">Current password</label>
            <input id="pw-c" type="password" className="input" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </div>
          <div className="field">
            <label htmlFor="pw-n">New password</label>
            <input id="pw-n" type="password" className="input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </div>
        </div>
        {msg.pw && <p className="news-form__ok">{msg.pw}</p>}
        {msg.pwError && <p className="field-error">{msg.pwError}</p>}
        <button className="btn btn--ghost" style={{ marginTop: 18 }}>
          Update password
        </button>
      </form>

      <div className="acc-card">
        <h2 className="h3">Session</h2>
        <div className="hero__ctas" style={{ marginTop: 12 }}>
          <button className="btn btn--ghost" onClick={signOut}>
            Sign out
          </button>
          {MODE === 'prototype' && (
            <button
              className="line__remove"
              onClick={() => {
                if (window.confirm('Remove all prototype accounts, orders, creations, bag and wishlist stored in this browser? This cannot be undone.')) {
                  resetPrototypeData();
                  window.location.assign('/');
                }
              }}
            >
              Clear prototype data on this device
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
