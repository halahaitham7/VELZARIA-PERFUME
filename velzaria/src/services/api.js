/**
 * VÉLZARIA API layer — the single integration point for the backend.
 *
 * PROTOTYPE MODE (default): no backend is configured, so every call is served
 * by a small in-browser store (localStorage). It is clearly labelled in the UI
 * and never processes payments.
 *
 * LIVE MODE: set VITE_API_URL (e.g. https://api.velzaria.com) in `.env`.
 * Every function below then calls the REST endpoint documented next to it.
 * The expected request/response shapes are listed in README.md.
 */
import { uid } from '../lib/format.js';

export const API_URL = import.meta.env.VITE_API_URL || '';
export const MODE = API_URL ? 'live' : 'prototype';

/* ------------------------------------------------------------------ */
/* Live transport                                                      */
/* ------------------------------------------------------------------ */
async function http(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

/* ------------------------------------------------------------------ */
/* Prototype store                                                     */
/* ------------------------------------------------------------------ */
const DB_KEY = 'vz_db_v1';
const SESSION_KEY = 'vz_session_v1';
const DEVICE_KEY = 'vz_device_v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
const emptyDb = () => ({ users: [], orders: [], creations: [], submissions: [], subscribers: [], orderSeq: 24017 });
const db = () => ({ ...emptyDb(), ...read(DB_KEY, {}) });
const saveDb = (d) => {
  if (!write(DB_KEY, d)) throw new Error('Your browser storage is full. Please remove some saved creations or images and try again.');
};
const wait = (ms = 280) => new Promise((r) => setTimeout(r, ms));

export function deviceOwner() {
  let id = read(DEVICE_KEY, null);
  if (!id) {
    id = `guest-${uid()}`;
    write(DEVICE_KEY, id);
  }
  return id;
}

async function hash(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`vz::${text}`));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(`vz::${text}`)));
}

const publicUser = (u) => u && { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', city: u.city || '', address: u.address || '', newsletter: !!u.newsletter, createdAt: u.createdAt };

const normEmail = (e) => String(e || '').trim().toLowerCase();

/* ------------------------------------------------------------------ */
/* Auth  — POST /auth/register, POST /auth/login, POST /auth/logout,   */
/*         GET /auth/me, PATCH /users/me, POST /users/me/password       */
/* ------------------------------------------------------------------ */
export const auth = {
  async me() {
    if (MODE === 'live') return http('GET', '/auth/me').then((r) => r.user).catch(() => null);
    const s = read(SESSION_KEY, null);
    if (!s) return null;
    return publicUser(db().users.find((u) => u.id === s.userId)) || null;
  },
  async register({ firstName, lastName, email, password, newsletter }) {
    if (MODE === 'live') return http('POST', '/auth/register', { firstName, lastName, email, password, newsletter }).then((r) => r.user);
    await wait();
    const d = db();
    const e = normEmail(email);
    if (d.users.some((u) => u.email === e)) throw new Error('An account with this email already exists. Please sign in instead.');
    const user = { id: `u-${uid()}`, firstName: firstName.trim(), lastName: lastName.trim(), email: e, password: await hash(password), newsletter: !!newsletter, createdAt: new Date().toISOString() };
    d.users.push(user);
    claimGuestData(d, user);
    saveDb(d);
    write(SESSION_KEY, { userId: user.id });
    return publicUser(user);
  },
  async login({ email, password }) {
    if (MODE === 'live') return http('POST', '/auth/login', { email, password }).then((r) => r.user);
    await wait();
    const d = db();
    const user = d.users.find((u) => u.email === normEmail(email));
    if (!user || user.password !== (await hash(password))) throw new Error('The email or password you entered is incorrect.');
    claimGuestData(d, user);
    saveDb(d);
    write(SESSION_KEY, { userId: user.id });
    return publicUser(user);
  },
  async logout() {
    if (MODE === 'live') return http('POST', '/auth/logout');
    localStorage.removeItem(SESSION_KEY);
  },
  async updateProfile(userId, patch) {
    if (MODE === 'live') return http('PATCH', '/users/me', patch).then((r) => r.user);
    await wait();
    const d = db();
    const user = d.users.find((u) => u.id === userId);
    if (!user) throw new Error('Please sign in again.');
    if (patch.email && normEmail(patch.email) !== user.email && d.users.some((u) => u.email === normEmail(patch.email))) {
      throw new Error('That email is already used by another account.');
    }
    Object.assign(user, { ...patch, email: patch.email ? normEmail(patch.email) : user.email });
    saveDb(d);
    return publicUser(user);
  },
  async changePassword(userId, current, next) {
    if (MODE === 'live') return http('POST', '/users/me/password', { current, next });
    await wait();
    const d = db();
    const user = d.users.find((u) => u.id === userId);
    if (!user || user.password !== (await hash(current))) throw new Error('Your current password is incorrect.');
    user.password = await hash(next);
    saveDb(d);
  },
};

/** Moves creations saved as a guest on this device into the account. */
function claimGuestData(d, user) {
  const guest = deviceOwner();
  d.creations.forEach((c) => {
    if (c.ownerId === guest) c.ownerId = user.id;
  });
  d.orders.forEach((o) => {
    if (!o.userId && o.email === user.email) o.userId = user.id;
  });
}

/* ------------------------------------------------------------------ */
/* Discounts — POST /discounts/validate                                */
/* ------------------------------------------------------------------ */
const PROTOTYPE_CODES = {
  ESSENCE10: { type: 'percent', value: 10, label: '10% welcome offer' },
  DISCOVERY: { type: 'fixed', value: 1250, label: 'Discovery Set credit', min: 4000 },
};
export const discounts = {
  async validate(code, subtotal) {
    if (MODE === 'live') return http('POST', '/discounts/validate', { code, subtotal });
    await wait(200);
    const c = PROTOTYPE_CODES[String(code || '').trim().toUpperCase()];
    if (!c) throw new Error('This code is not valid.');
    if (c.min && subtotal < c.min) throw new Error(`This code applies to orders over EGP ${c.min.toLocaleString('en-US')}.`);
    const amount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
    return { code: String(code).trim().toUpperCase(), label: c.label, amount, percent: c.type === 'percent' ? c.value : undefined, min: c.min };
  },
};

/* ------------------------------------------------------------------ */
/* Orders — POST /orders, GET /orders (mine), GET /orders/track        */
/* ------------------------------------------------------------------ */
export const ORDER_STAGES = [
  { id: 'received', label: 'Order received' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'preparing', label: 'Prepared in our atelier' },
  { id: 'shipped', label: 'With our courier' },
  { id: 'delivered', label: 'Delivered' },
];

export const orders = {
  async create(payload) {
    if (MODE === 'live') return http('POST', '/orders', payload).then((r) => r.order);
    await wait(500);
    const d = db();
    d.orderSeq += 1;
    const order = {
      ...payload,
      id: `o-${uid()}`,
      number: `VZ-${d.orderSeq}`,
      email: normEmail(payload.email),
      createdAt: new Date().toISOString(),
      status: 'received',
      history: [{ status: 'received', at: new Date().toISOString() }],
    };
    d.orders.unshift(order);
    saveDb(d);
    return order;
  },
  async get(id) {
    if (MODE === 'live') return http('GET', `/orders/${encodeURIComponent(id)}`).then((r) => r.order);
    return db().orders.find((o) => o.id === id) || null;
  },
  async mine(user) {
    if (MODE === 'live') return http('GET', '/orders').then((r) => r.orders);
    await wait(150);
    return db().orders.filter((o) => o.userId === user.id || o.email === user.email);
  },
  async track(number, email) {
    if (MODE === 'live') return http('POST', '/orders/track', { number, email }).then((r) => r.order);
    await wait();
    const o = db().orders.find((x) => x.number.toUpperCase() === String(number).trim().toUpperCase() && x.email === normEmail(email));
    if (!o) throw new Error('We could not find an order with that number and email address.');
    return o;
  },
};

/* ------------------------------------------------------------------ */
/* Creations — GET/POST/DELETE /creations                              */
/* ------------------------------------------------------------------ */
export const creations = {
  async list(ownerId) {
    if (MODE === 'live') return http('GET', '/creations').then((r) => r.creations);
    return db().creations.filter((c) => c.ownerId === ownerId);
  },
  async get(id) {
    if (MODE === 'live') return http('GET', `/creations/${id}`).then((r) => r.creation);
    return db().creations.find((c) => c.id === id) || null;
  },
  async save(ownerId, creation) {
    if (MODE === 'live') return http('POST', '/creations', creation).then((r) => r.creation);
    await wait();
    const d = db();
    const existing = creation.id && d.creations.find((c) => c.id === creation.id);
    if (existing) {
      Object.assign(existing, creation, { updatedAt: new Date().toISOString() });
      saveDb(d);
      return existing;
    }
    const saved = { ...creation, id: `c-${uid()}`, ownerId, createdAt: new Date().toISOString() };
    d.creations.unshift(saved);
    saveDb(d);
    return saved;
  },
  async remove(id) {
    if (MODE === 'live') return http('DELETE', `/creations/${id}`);
    const d = db();
    d.creations = d.creations.filter((c) => c.id !== id);
    saveDb(d);
  },
};

/* ------------------------------------------------------------------ */
/* Creator's Award — POST /award/submissions                           */
/* ------------------------------------------------------------------ */
export const award = {
  async submit(ownerId, submission) {
    if (MODE === 'live') return http('POST', '/award/submissions', submission).then((r) => r.submission);
    await wait(600);
    const d = db();
    const saved = { ...submission, id: `s-${uid()}`, reference: `VCA-${uid().slice(-6)}`, ownerId, status: 'Received', createdAt: new Date().toISOString() };
    d.submissions.unshift(saved);
    saveDb(d);
    return saved;
  },
  async mine(ownerIds) {
    if (MODE === 'live') return http('GET', '/award/submissions').then((r) => r.submissions);
    return db().submissions.filter((s) => ownerIds.includes(s.ownerId));
  },
};

/* ------------------------------------------------------------------ */
/* Newsletter — POST /newsletter                                       */
/* ------------------------------------------------------------------ */
export const newsletter = {
  async subscribe(email) {
    if (MODE === 'live') return http('POST', '/newsletter', { email });
    await wait();
    const d = db();
    const e = normEmail(email);
    const already = d.subscribers.includes(e);
    if (!already) d.subscribers.push(e);
    saveDb(d);
    return { already };
  },
};

/** Clears every prototype record on this device (Account → Settings). */
export function resetPrototypeData() {
  [DB_KEY, SESSION_KEY, 'vz_cart_v1', 'vz_wishlist_v1', 'vz_quiz_draft_v1'].forEach((k) => localStorage.removeItem(k));
}
