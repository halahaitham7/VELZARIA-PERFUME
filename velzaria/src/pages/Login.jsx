import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, MODE } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { Photo } from '../components/ui.jsx';
import { EDITORIAL } from '../data/products.js';
import { cls } from '../lib/format.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const { user, setUser, toast } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '', newsletter: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(f.email)) return setError('Please enter a valid email address.');
    if (mode === 'register') {
      if (!f.firstName.trim() || !f.lastName.trim()) return setError('Please enter your first and last name.');
      if (f.password.length < 8) return setError('Your password must be at least 8 characters.');
    } else if (!f.password) return setError('Please enter your password.');
    setBusy(true);
    try {
      const u = mode === 'register' ? await auth.register(f) : await auth.login(f);
      setUser(u);
      toast(mode === 'register' ? `Welcome to VÉLZARIA, ${u.firstName}.` : `Welcome back, ${u.firstName}.`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__visual" aria-hidden="true">
        <Photo image={EDITORIAL['duo-artist-spark']} alt="The Artist and The Spark perfume bottles" className="auth__photo" eager />
        <p className="auth__quote">“Every woman, her own essence.”</p>
      </div>
      <div className="auth__panel">
        <div className="auth__tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} className={cls('tab', mode === 'login' && 'is-active')} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button role="tab" aria-selected={mode === 'register'} className={cls('tab', mode === 'register' && 'is-active')} onClick={() => setMode('register')}>
            Create account
          </button>
        </div>
        <h1 className="h2">{mode === 'login' ? 'Welcome back.' : 'Join the house.'}</h1>
        <p className="muted small">
          {mode === 'login'
            ? 'Sign in to see your orders, wishlist and saved creations.'
            : 'Keep your creations, track your orders and check out faster. Creations saved on this device are added to your new account.'}
        </p>
        <form onSubmit={submit} className="form-grid" noValidate>
          {mode === 'register' && (
            <>
              <div className="field">
                <label htmlFor="a-fn">First name</label>
                <input id="a-fn" className="input" value={f.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" />
              </div>
              <div className="field">
                <label htmlFor="a-ln">Last name</label>
                <input id="a-ln" className="input" value={f.lastName} onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" />
              </div>
            </>
          )}
          <div className="field full">
            <label htmlFor="a-email">Email</label>
            <input id="a-email" type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="field full">
            <label htmlFor="a-pw">Password</label>
            <input id="a-pw" type="password" className="input" value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'register' && <span className="tiny muted">At least 8 characters.</span>}
          </div>
          {mode === 'register' && (
            <label className="check full">
              <input type="checkbox" checked={f.newsletter} onChange={(e) => set('newsletter', e.target.checked)} />
              <span>Send me new collection announcements and exclusive releases.</span>
            </label>
          )}
          {error && <p className="field-error full">{error}</p>}
          <div className="full">
            <button className="btn btn--block" disabled={busy}>
              {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create my account'}
            </button>
          </div>
        </form>
        {MODE === 'prototype' && (
          <p className="notice tiny" style={{ marginTop: 24 }}>
            <strong>Prototype · </strong>Accounts are stored only in this browser until the authentication service is connected. Do not use a real password.
          </p>
        )}
        <p className="small" style={{ marginTop: 18 }}>
          <Link to="/track" className="link-inline">
            Track an order without an account
          </Link>
        </p>
      </div>
    </section>
  );
}
