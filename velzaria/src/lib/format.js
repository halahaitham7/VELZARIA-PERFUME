export function money(value) {
  return `EGP ${Math.round(value).toLocaleString('en-US')}`;
}

export function dateLong(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function uid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${Date.now().toString(36).toUpperCase().slice(-4)}${rand}`;
}

export function listJoin(items, conj = 'and') {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`;
}

export const SHIPPING = {
  freeOver: 5000,
  zones: [
    { id: 'cairo', label: 'Cairo & Giza', fee: 85, eta: '1–2 business days' },
    { id: 'alex', label: 'Alexandria', fee: 100, eta: '2–3 business days' },
    { id: 'delta', label: 'Delta & Canal cities', fee: 120, eta: '2–4 business days' },
    { id: 'upper', label: 'Upper Egypt & Red Sea', fee: 140, eta: '3–5 business days' },
  ],
};

export function shippingFor(zoneId, subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= SHIPPING.freeOver) return 0;
  const zone = SHIPPING.zones.find((z) => z.id === zoneId) || SHIPPING.zones[0];
  return zone.fee;
}
