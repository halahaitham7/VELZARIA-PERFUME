import { Link } from 'react-router-dom';
import { products, CAMPAIGN } from '../data/products.js';
import { ProductPhoto, Photo, Frame, Reveal } from '../components/ui.jsx';
import { IconArrow } from '../components/Icons.jsx';

export default function Story() {
  return (
    <>
      <section className="story-hero container">
        <p className="eyebrow eyebrow--gold">Our Story</p>
        <h1 className="display">
          The Power of <em>Femininity.</em>
        </h1>
        <p className="lead">
          VÉLZARIA is a perfume house founded on one belief: there is no single way to be a woman — and there should be no single way to smell like one.
        </p>
      </section>

      <section className="section--tight">
        <div className="container chapter">
          <Reveal img className="chapter__visual">
            <Frame tone="mat" className="frame--tall" caption="N° 01 — The Sovereign"><ProductPhoto product={products[0]} kind="tight" /></Frame>
          </Reveal>
          <Reveal className="chapter__copy">
            <span className="numeral">Chapter I</span>
            <h2 className="h2">It began with a question.</h2>
            <p>
              Why were the fragrances made for women always describing the same woman? Soft, sweet, pretty — rarely ambitious, rarely bold, rarely strange in the beautiful
              way that real women are.
            </p>
            <p>
              VÉLZARIA was born from that question. Instead of starting with an ingredient or a trend, we started with personalities: the leader, the romantic, the voyager,
              the dreamer and the charmer. Then we asked a perfumer to compose for each of them.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container chapter chapter--flip">
          <Reveal img className="chapter__visual">
            <Frame tone="bare" caption="The five silhouettes of the house"><Photo image={CAMPAIGN.hero} alt="The five VÉLZARIA bottles side by side on marble pedestals" /></Frame>
          </Reveal>
          <Reveal className="chapter__copy">
            <span className="numeral">Chapter II</span>
            <h2 className="h2">Five bottles, five silhouettes.</h2>
            <p>
              Every essence has its own sculpted flacon: the crystal architecture of The Sovereign, the blush teardrop of The Romantic, the violet gem of The Conqueror, the
              river-stone curve of The Artist and the coral sphere of The Spark.
            </p>
            <p>
              They share one language — thick, light-catching glass, fine gold collars, caps that are small sculptures in their own right — so that together they read as a
              family of distinct women.
            </p>
            <Link to="/shop" className="link">
              Discover the five <IconArrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section bg-charcoal">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--gold">What we stand for</p>
            <h2 className="h2" style={{ margin: '12px 0 48px', maxWidth: '16em' }}>
              Quiet luxury, with <em>something to say.</em>
            </h2>
          </Reveal>
          <div className="values">
            {[
              ['Individuality', 'We celebrate every expression of femininity — never a single definition of beauty.'],
              ['Craft', 'Compositions developed with professional perfumers, bottled in heavy glass designed to be kept and refilled.'],
              ['Honesty', 'Clear ingredients, clear prices, and no promises a digital quiz cannot keep.'],
              ['Responsibility', 'Refills for every 100 ml bottle, recyclable packaging and fewer, better products.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 100}>
                <span className="numeral">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--gold">The journey so far</p>
            <h2 className="h2" style={{ margin: '12px 0 44px' }}>
              A young house, growing slowly
            </h2>
          </Reveal>
          <div className="timeline">
            {[
              ['2025', 'The Sovereign and The Romantic are introduced — the first two essences of the house.'],
              ['2025', 'The Conqueror joins the collection for the woman who keeps moving forward.'],
              ['2026', 'The Artist and The Spark complete the five, alongside the Discovery Set.'],
              ['2026', 'The Bespoke Atelier and the first Creator’s Award open to every woman.'],
            ].map(([y, d], i) => (
              <Reveal key={i} delay={i * 100}>
                <strong>{y}</strong>
                <p className="muted">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight bg-champagne">
        <div className="container center">
          <p className="serif-lead" style={{ maxWidth: '26em', margin: '0 auto 28px' }}>
            “VÉLZARIA — Every Woman, Her Own Essence.”
          </p>
          <div className="hero__ctas" style={{ justifyContent: 'center' }}>
            <Link to="/create" className="btn">
              Find your essence
            </Link>
            <Link to="/creators-award" className="btn btn--ghost">
              The Creator’s Award
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
