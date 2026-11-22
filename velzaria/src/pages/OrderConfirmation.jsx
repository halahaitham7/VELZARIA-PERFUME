import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { orders } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { OrderTimeline, OrderItems } from './TrackOrder.jsx';
import { money, dateLong } from '../lib/format.js';
import NotFound from './NotFound.jsx';

export const PAYMENT_STATUS = {
  pay_on_delivery: 'Cash on delivery — pay when your order arrives',
  not_processed: 'Payment not processed (prototype — no gateway connected)',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  pending: 'Pending',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useStore();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    orders.get(id).then(setOrder);
  }, [id]);

  if (order === undefined) return <div className="container" style={{ minHeight: '50vh' }} />;
  if (!order) return <NotFound />;
  const pay = state?.payment;

  return (
    <section className="container confirm">
      <div className="confirm__head">
        <p className="eyebrow eyebrow--gold">Order {order.number}</p>
        <h1 className="h1">
          Thank you, {order.customer.firstName}. <em>Your essence is on its way to you.</em>
        </h1>
        <p className="lead">
          We have received your order placed on {dateLong(order.createdAt)}. A confirmation will be sent to <strong>{order.email}</strong>.
        </p>
        {pay?.status === 'not_processed' && (
          <p className="notice">
            <strong>Prototype · </strong>
            {pay.message}
          </p>
        )}
      </div>
      <div className="confirm__grid">
        <div>
          <h2 className="h3">Order status</h2>
          <OrderTimeline order={order} />
          <div className="confirm__meta">
            <div>
              <span className="label">Delivering to</span>
              <p>
                {order.customer.firstName} {order.customer.lastName}
                <br />
                {order.shippingAddress.address}
                {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.zone}
                <br />
                {order.phone}
              </p>
            </div>
            <div>
              <span className="label">Payment</span>
              <p>
                {order.payment.provider ? `${order.payment.provider} · ` : ''}
                {PAYMENT_STATUS[pay?.status] || PAYMENT_STATUS[order.payment.status] || order.payment.status}
              </p>
            </div>
          </div>
        </div>
        <aside className="summary">
          <h2 className="h3">Your order</h2>
          <OrderItems order={order} />
          <dl className="totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {order.discount && (
              <div>
                <dt>Discount · {order.discount.code}</dt>
                <dd>− {money(order.discount.amount)}</dd>
              </div>
            )}
            <div>
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? 'Complimentary' : money(order.shipping)}</dd>
            </div>
            <div className="totals__grand">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
      <div className="hero__ctas">
        <Link to={user ? '/account?tab=orders' : '/track'} className="btn btn--ghost">
          {user ? 'View my orders' : 'Track this order'}
        </Link>
        <Link to="/shop" className="btn">
          Continue shopping
        </Link>
      </div>
      {!user && (
        <p className="small muted" style={{ marginTop: 18 }}>
          <Link to="/login?mode=register" className="link-inline">
            Create an account
          </Link>{' '}
          with {order.email} to see this order in your account.
        </p>
      )}
    </section>
  );
}
