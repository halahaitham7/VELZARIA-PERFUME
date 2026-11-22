import { useState } from 'react';
import { newsletter } from '../services/api.js';
import { cls } from '../lib/format.js';
import { IconArrow } from './Icons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterForm({ compact }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function submit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState({ status: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setState({ status: 'loading', message: '' });
    try {
      const r = await newsletter.subscribe(email);
      setState({
        status: 'done',
        message: r.already ? 'You are already on our list — thank you.' : 'Welcome to VÉLZARIA. Use ESSENCE10 for 10% off your first order.',
      });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <form className={cls('news-form', compact && 'news-form--compact')} onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor={compact ? 'nf-email-c' : 'nf-email'}>
        Email address
      </label>
      <div className="news-form__row">
        <input
          id={compact ? 'nf-email-c' : 'nf-email'}
          className="input input--line"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button type="submit" className="news-form__btn" disabled={state.status === 'loading'} aria-label="Subscribe">
          {compact ? <IconArrow /> : state.status === 'loading' ? 'Joining…' : 'Subscribe'}
        </button>
      </div>
      {state.message && (
        <p className={cls('small', state.status === 'error' ? 'field-error' : 'news-form__ok')} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
