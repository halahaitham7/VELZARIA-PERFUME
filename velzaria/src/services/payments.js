/**
 * Payment integration point — prepared for Egyptian gateways.
 *
 * Recommended setup: Paymob (cards incl. Meeza, mobile wallets, ValU) with
 * Fawry Pay as an alternative cash-at-outlet option.
 *
 * Card details are NEVER collected by this frontend. In live mode the backend
 * creates a payment intention with the gateway (secret keys stay server-side)
 * and returns a hosted-checkout URL; the customer is redirected there and the
 * gateway's webhook (HMAC-verified on the server) marks the order as paid.
 *
 * In prototype mode no gateway exists, so no payment is ever marked as
 * successful — orders are recorded with payment status "not processed".
 */
import { MODE, API_URL } from './api.js';

export const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit or debit card',
    provider: 'Paymob',
    desc: 'Visa, Mastercard and Meeza on Paymob’s secure hosted page. Card details never touch our servers.',
  },
  {
    id: 'wallet',
    label: 'Mobile wallet',
    provider: 'Paymob',
    desc: 'Vodafone Cash, Etisalat Cash, Orange Cash and other Egyptian wallets.',
  },
  {
    id: 'fawry',
    label: 'Fawry',
    provider: 'Fawry',
    desc: 'Receive a reference number and pay at any Fawry outlet or app within 48 hours.',
  },
  {
    id: 'cod',
    label: 'Cash on delivery',
    provider: null,
    desc: 'Pay in cash when your order arrives. Available across Egypt.',
  },
];

/**
 * Starts payment for a created order.
 * Live:  POST {API_URL}/payments/intention { orderId, method } → { redirectUrl } | { fawryReference }
 */
export async function startPayment(order, method) {
  if (method === 'cod') return { status: 'pay_on_delivery' };

  if (MODE === 'live') {
    const res = await fetch(`${API_URL}/payments/intention`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, method }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'We could not start the payment. Please try again.');
    if (data.redirectUrl) {
      window.location.assign(data.redirectUrl);
      return { status: 'redirecting' };
    }
    return { status: 'awaiting_payment', reference: data.fawryReference };
  }

  return {
    status: 'not_processed',
    message: 'Prototype mode — no payment gateway is connected, so no payment was requested or taken.',
  };
}
