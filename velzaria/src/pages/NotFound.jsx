import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container notfound">
      <p className="eyebrow eyebrow--gold">404</p>
      <h1 className="display">Lost in the notes.</h1>
      <p className="lead">The page you were looking for has evaporated. Let us guide you back.</p>
      <div className="hero__ctas" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn">
          Return home
        </Link>
        <Link to="/shop" className="btn btn--ghost">
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
