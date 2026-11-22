import { Link } from 'react-router-dom';
import { products, discoverySet, CAMPAIGN, EDITORIAL } from '../data/products.js';
import { featuredReviews } from '../data/reviews.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';
import { Reveal, ProductPhoto, Photo, Frame, Stars } from '../components/ui.jsx';
import { IconArrow } from '../components/Icons.jsx';
import { money, cls } from '../lib/format.js';

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <Essences />
      <BestSellers />
      <CreateTeaser />
      <Discovery />
      <BrandStory />
      <Reviews />
      <Newsletter />
    </>
  );
}

/* ---------------- 1. Hero ---------------- */
function Hero() {
  return (
    <section className="hero">
      <div className="hero__photo">
        <div className="hero__frame">
          <img
            src={CAMPAIGN.hero.src}
            width={CAMPAIGN.hero.w}
            height={CAMPAIGN.hero.h}
            alt="The five VÉLZARIA perfumes — The Sovereign, The Romantic, The Conqueror, The Artist and The Spark — on marble pedestals among roses and violets"
            fetchpriority="high"
          />
          <div className="hero__hotspots" aria-hidden="true">
            {products.map((p) => (
              <Link key={p.id} to={`/perfume/${p.slug}`} className={cls('hero__hotspot', `hero__hotspot--${p.id}`)} tabIndex={-1}>
                <span className="hero__tag">
                  <span className="numeral">{p.number}</span> {p.short}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--gold hero__eyebrow">
            <span className="rule--gold" /> Five Essences. Infinite Personalities.
          </p>
          <h1 className="display hero__title">
            <span className="hero__line" style={{ '--i': 0 }}>Your Scent.</span>
            <span className="hero__line italic" style={{ '--i': 1 }}>Your Story.</span>
            <span className="hero__line" style={{ '--i': 2 }}>Your Power.</span>
          </h1>
        </div>
        <div className="hero__side">
          <p className="lead hero__lead">
            Discover the fragrance that reflects your personality. Five unique essences, each inspired by a different expression of femininity.
          </p>
          <div className="hero__ctas">
            <Link to="/shop" className="btn">
              Discover Our Collection
            </Link>
            <Link to="/create" className="btn btn--ghost">
              Create Your Signature Scent
            </Link>
          </div>
        </div>
      </div>
      <div className="container hero__index">
        {products.map((p) => (
          <Link key={p.id} to={`/perfume/${p.slug}`} className="hero__index-item">
            <span className="numeral">{p.number}</span>
            <span>{p.name}</span>
            <small>{p.archetype}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 2. Philosophy ---------------- */
function Philosophy() {
  return (
    <section className="section philo">
      <div className="container philo__grid">
        <Reveal className="philo__label">
          <span className="eyebrow">Our Philosophy</span>
          <span className="philo__vertical" aria-hidden="true">
            Every woman, her own essence
          </span>
        </Reveal>
        <div className="philo__text">
          <Reveal as="h2" className="h1 philo__title">
            Every Woman Has <em>Her Own</em> Essence.
          </Reveal>
          <Reveal delay={150}>
            <p className="serif-lead philo__lead">
              <span className="dropcap">B</span>eauty is not one definition. Strength is not one form. Every woman carries a different story, personality, and presence.
            </p>
            <p className="lead">At VÉLZARIA, we celebrate every expression of femininity through fragrance.</p>
          </Reveal>
          <Reveal delay={250} className="philo__words">
            {['Feminine', 'Confident', 'Independent', 'Artistic', 'Timeless'].map((w) => (
              <span key={w}>{w}</span>
            ))}
          </Reveal>
        </div>
        <Reveal img className="philo__image">
          <Frame tone="bare" caption="N° 04 The Artist and N° 05 The Spark — two women, two expressions of one house">
            <Photo image={EDITORIAL['duo-artist-spark']} alt="The Artist in olive glass and The Spark in coral glass, side by side on marble pedestals" />
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- 3. The five essences ---------------- */
function Essences() {
  return (
    <section className="section essences bg-champagne" id="essences">
      <div className="container">
        <div className="essences__head">
          <Reveal>
            <p className="eyebrow eyebrow--gold">Discover the Five Essences</p>
            <h2 className="h2">
              Five women. <em>Five signatures.</em>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead">Each VÉLZARIA essence begins with a personality — and is composed, bottled and sculpted to tell her story.</p>
          </Reveal>
        </div>

        <div className="essences__rail" role="list">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 90} className="essence" role="listitem">
              <Link to={`/perfume/${p.slug}`} className="essence__media" aria-label={`${p.name} — view details`}>
                <ProductPhoto product={p} kind="tight" />
                <span className="essence__num">{p.number}</span>
              </Link>
              <div className="essence__body">
                <p className="eyebrow">{p.direction}</p>
                <h3 className="essence__name">{p.name}</h3>
                <p className="essence__persona">{p.personality}</p>
                <p className="essence__summary">{p.summary}</p>
                <dl className="essence__notes">
                  <div>
                    <dt>Top</dt>
                    <dd>{p.notes.top.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt>Heart</dt>
                    <dd>{p.notes.heart.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt>Base</dt>
                    <dd>{p.notes.base.join(' · ')}</dd>
                  </div>
                </dl>
                <Link to={`/perfume/${p.slug}`} className="link">
                  View Details <IconArrow />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. Best sellers ---------------- */
function BestSellers() {
  const best = [...products].sort((a, b) => a.salesRank - b.salesRank).slice(0, 3);
  return (
    <section className="section best">
      <div className="container">
        <div className="best__head">
          <Reveal>
            <p className="eyebrow eyebrow--gold">Best Sellers</p>
            <h2 className="h2">The most loved essences</h2>
          </Reveal>
          <Reveal delay={100}>
            <Link to="/shop?sort=best" className="link">
              Shop all <IconArrow />
            </Link>
          </Reveal>
        </div>
        <div className="best__grid">
          {best.map((p, i) => (
            <Reveal key={p.id} delay={i * 120} className="best__item">
              <span className="best__badge">N° {i + 1} Best Seller</span>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 5. Create your own ---------------- */
function CreateTeaser() {
  const steps = ['Your personality', 'Your lifestyle', 'Your favourite notes', 'Your intensity', 'Your result', 'Your bottle', 'Your creation'];
  return (
    <section className="create-teaser">
      <div className="create-teaser__visual">
        <div className="formula" aria-label="An example of a bespoke composition">
          <p className="formula__label">Atelier card · example composition</p>
          <p className="formula__name">“Golden Hour”</p>
          <p className="formula__by">Composed by Laila · inspired by The Sovereign &amp; The Spark</p>
          <dl className="formula__tiers">
            <div>
              <dt>Top</dt>
              <dd>Blood orange · Saffron · Bergamot</dd>
            </div>
            <div>
              <dt>Heart</dt>
              <dd>Bulgarian rose · Jasmine</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>Amber · Sandalwood · Vanilla</dd>
            </div>
          </dl>
          <p className="formula__foot">Floral Amber · Eau de Parfum · approx. 18%</p>
        </div>
      </div>
      <div className="create-teaser__copy">
        <Reveal>
          <p className="eyebrow eyebrow--gold">The Bespoke Atelier</p>
          <h2 className="h1">
            Your Personality. <em>Your Signature Scent.</em>
          </h2>
          <p className="lead">Discover your essence and create a fragrance that is uniquely yours.</p>
        </Reveal>
        <Reveal delay={120}>
          <ol className="create-teaser__steps">
            {steps.map((s, i) => (
              <li key={s}>
                <span className="numeral">{String(i + 1).padStart(2, '0')}</span> {s}
              </li>
            ))}
          </ol>
          <Link to="/create" className="btn">
            Create My Perfume
          </Link>
          <p className="tiny muted create-teaser__note">Your result is a fragrance concept, reviewed and developed by our perfumer before anything is produced.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- 6. Discovery set ---------------- */
function Discovery() {
  const { addToCart } = useStore();
  return (
    <section className="section discovery">
      <div className="container discovery__grid">
        <Reveal img className="discovery__visual">
          <Frame tone="bare" caption="The Conqueror, The Artist and The Spark — three of the five essences in the set">
            <Photo image={EDITORIAL['trio-conqueror-artist-spark']} alt="The Conqueror, The Artist and The Spark perfume bottles together" />
          </Frame>
        </Reveal>
        <Reveal className="discovery__copy" delay={120}>
          <p className="eyebrow eyebrow--gold">The Discovery Set</p>
          <h2 className="h2">Meet all five before you choose one.</h2>
          <p className="lead">{discoverySet.summary}</p>
          <ul className="discovery__list">
            {products.map((p) => (
              <li key={p.id}>
                <span className="dot" style={{ background: p.palette.liquid }} />
                {p.name}
                <small>{p.direction}</small>
              </li>
            ))}
          </ul>
          <div className="discovery__buy">
            <span className="discovery__price">{money(discoverySet.price)}</span>
            <button
              className="btn"
              onClick={() =>
                addToCart({ type: 'discovery', productId: discoverySet.id, name: discoverySet.name, size: '5x2', sizeLabel: '5 × 2 ml vials', basePrice: discoverySet.price, options: {} })
              }
            >
              Add to bag
            </button>
            <Link to="/shop/discovery-set" className="link">
              Learn more
            </Link>
          </div>
          <p className="tiny muted">The full value of the set is credited toward your first full-size bottle with code DISCOVERY.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- 7. Brand story ---------------- */
function BrandStory() {
  return (
    <section className="section story-band bg-charcoal">
      <div className="container story-band__grid">
        <Reveal className="story-band__quote">
          <p className="eyebrow eyebrow--gold">The House of VÉLZARIA</p>
          <blockquote>
            “We did not want to tell women who to be. We wanted to give each of them a fragrance that already knew.”
          </blockquote>
          <span className="small">— The founder, VÉLZARIA</span>
        </Reveal>
        <Reveal delay={150} className="story-band__cols">
          <p>
            VÉLZARIA began with a simple observation: the women we admire are never only one thing. The leader is also a romantic; the artist is also an
            adventurer. Yet perfume has too often been sold as a single idea of what a woman should smell like.
          </p>
          <p>
            So we started with personalities instead of trends. Five essences — The Sovereign, The Romantic, The Conqueror, The Artist and The Spark — each
            composed around a woman, each with a bottle sculpted in her image. And for the woman who is all of them, or none of them, our atelier helps her
            compose her own.
          </p>
          <Link to="/story" className="link">
            Read our story <IconArrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- 8. Reviews ---------------- */
function Reviews() {
  return (
    <section className="section reviews">
      <div className="container">
        <Reveal className="reviews__head">
          <p className="eyebrow eyebrow--gold">In Their Words</p>
          <h2 className="h2">Worn by women with stories of their own</h2>
        </Reveal>
        <div className="reviews__grid">
          {featuredReviews.map((r, i) => {
            const p = products.find((x) => x.id === r.product);
            return (
              <Reveal key={r.id} delay={i * 90} className={cls('review', `review--${i}`)}>
                <span className="review__mark" aria-hidden="true">
                  “
                </span>
                <Stars value={r.rating} />
                <h3 className="review__title">{r.title}</h3>
                <p>{r.body}</p>
                <footer>
                  <strong>{r.name}</strong> · {r.city}
                  <Link to={`/perfume/${p.slug}`} className="review__product">
                    {p.name}
                  </Link>
                </footer>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 9. Newsletter ---------------- */
function Newsletter() {
  return (
    <section className="section--tight newsletter bg-champagne">
      <div className="container newsletter__inner">
        <Reveal>
          <p className="eyebrow eyebrow--gold">The VÉLZARIA Letter</p>
          <h2 className="h2">
            Be the first to <em>discover</em>.
          </h2>
          <p className="lead">New collection announcements, exclusive releases and stories from our atelier — a few times a season, never more.</p>
        </Reveal>
        <Reveal delay={120} className="newsletter__form">
          <NewsletterForm />
          <p className="tiny muted">By subscribing you agree to our <Link to="/info/privacy" className="link-inline">Privacy Policy</Link>. Unsubscribe at any time.</p>
        </Reveal>
      </div>
    </section>
  );
}
