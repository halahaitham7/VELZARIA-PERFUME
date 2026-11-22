import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { products, EDITORIAL } from '../data/products.js';
import { ALL_NOTES } from '../data/quiz.js';
import { useStore } from '../context/StoreContext.jsx';
import { award, creations as creationsApi } from '../services/api.js';
import { Reveal, Photo, BespokePhoto } from '../components/ui.jsx';
import { cls, dateLong } from '../lib/format.js';

/** Edit these dates for each edition of the award. */
export const AWARD = {
  edition: 'First Edition · 2026–2027',
  opens: '2026-11-01',
  closes: '2027-01-31',
  shortlist: '2027-02-21',
  winner: '2027-03-08',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Award() {
  return (
    <>
      <section className="container award-hero">
        <div>
          <p className="eyebrow eyebrow--gold">The VÉLZARIA Creator’s Award · {AWARD.edition}</p>
          <h1 className="display">
            Your Creativity Could Become <em>Our Next Signature Scent.</em>
          </h1>
          <p className="lead">
            At VÉLZARIA, we believe every woman has a unique essence. Share your personalised fragrance concept and get the chance to see your creation become part of our
            story.
          </p>
          <div className="hero__ctas">
            <a href="#submit" className="btn">
              Submit your concept
            </a>
            <Link to="/create" className="btn btn--ghost">
              Create a concept first
            </Link>
          </div>
          <p className="tiny muted" style={{ marginTop: 20 }}>
            Submissions open {dateLong(AWARD.opens)} and close {dateLong(AWARD.closes)}. Winner announced {dateLong(AWARD.winner)} — International Women’s Day.
          </p>
        </div>
        <div className="award-hero__visual award-hero__visual--photo">
          <Photo image={EDITORIAL['duo-conqueror-artist']} alt="The Conqueror and The Artist perfume bottles on marble pedestals" eager />
        </div>
      </section>

      <section className="section--tight bg-champagne">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--gold">How the competition works</p>
            <h2 className="h2" style={{ margin: '12px 0 44px' }}>
              From a feeling to a flacon
            </h2>
          </Reveal>
          <div className="steps-row">
            {[
              ['Compose', 'Use our Create Your Perfume atelier — or your own imagination — to shape a fragrance concept and the personality behind it.'],
              ['Submit', 'Send your concept name, inspiration, preferred notes and a short story before the deadline. Images are optional.'],
              ['Shortlist', 'Our perfumer and creative team review every entry and invite up to ten finalists to a consultation.'],
              ['Celebrate', 'One concept is selected to be developed professionally into a VÉLZARIA limited edition.'],
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
        <div className="container award-cols">
          <Reveal className="award-card">
            <h3>Submission requirements</h3>
            <ul>
              <li>Open to individuals aged 18 or over.</li>
              <li>One original concept per person per edition.</li>
              <li>A concept name, a personality inspiration and at least three preferred notes.</li>
              <li>A short description of 80–600 characters telling the story of the woman behind the scent.</li>
              <li>Up to three optional inspiration images (JPG or PNG) that you own or have rights to use.</li>
            </ul>
          </Reveal>
          <Reveal className="award-card" delay={100}>
            <h3>Judging criteria</h3>
            <div className="criteria">
              {[
                ['Originality of the concept', 30],
                ['Emotional storytelling', 25],
                ['Coherence of the fragrance direction', 25],
                ['Fit with the VÉLZARIA philosophy', 20],
              ].map(([label, w]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{w}%</strong>
                  <i>
                    <b style={{ width: `${w * 3}%` }} />
                  </i>
                </div>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 16 }}>
              Entries are judged by a panel including our perfumer and creative director. Feasibility is assessed by the perfumer; no technical knowledge is required.
            </p>
          </Reveal>
          <Reveal className="award-card" delay={200}>
            <h3>The winning opportunity</h3>
            <p className="small">The selected creation may be professionally developed into a limited-edition perfume. The creator may receive:</p>
            <ul>
              <li>Their name featured on the perfume.</li>
              <li>Recognition as a VÉLZARIA Creator.</li>
              <li>A special reward, including a personal atelier experience.</li>
              <li>An agreed financial reward or royalty if the perfume becomes a commercial product, set out in a written agreement.</li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section bg-champagne" id="submit">
        <div className="container award-form-wrap">
          <div>
            <p className="eyebrow eyebrow--gold">Submission form</p>
            <h2 className="h2" style={{ margin: '12px 0 20px' }}>
              Share your essence
            </h2>
            <p className="muted">
              Concepts created in our atelier are filled in for you. Every submission receives a reference number and a confirmation by email once the live service is
              connected.
            </p>
            <div className="award-timeline">
              {[
                ['Submissions open', AWARD.opens],
                ['Submissions close', AWARD.closes],
                ['Finalists contacted', AWARD.shortlist],
                ['Winner announced', AWARD.winner],
              ].map(([l, d]) => (
                <div key={l}>
                  <span className="label">{l}</span>
                  <strong>{dateLong(d)}</strong>
                </div>
              ))}
            </div>
          </div>
          <SubmissionForm />
        </div>
      </section>

      <section className="section" id="terms">
        <div className="container">
          <p className="eyebrow eyebrow--gold">Competition rules & terms</p>
          <h2 className="h2" style={{ margin: '12px 0 40px' }}>
            Clear terms, fairly shared
          </h2>
          <div className="terms-block">
            <section>
              <h3>1. Eligibility</h3>
              <p>Open to individuals aged 18 or over. VÉLZARIA employees, contractors and their immediate families may not enter. One entry per person per edition; duplicate entries are disqualified.</p>
            </section>
            <section>
              <h3>2. Originality</h3>
              <p>Your concept, description and images must be your own original work and must not infringe the rights of anyone else, including existing perfumes, trademarks or artworks.</p>
            </section>
            <section>
              <h3>3. Intellectual property</h3>
              <p>
                You keep ownership of your submission. By entering, you grant VÉLZARIA a non-exclusive, royalty-free licence to review your entry and, if you are shortlisted,
                to display your concept name, first name and description in connection with the award. Development of a perfume from a winning concept takes place only under a
                separate written agreement that sets out ownership of the final formula, credit and any financial reward or royalty.
              </p>
            </section>
            <section>
              <h3>4. Selection</h3>
              <p>
                Entries are scored against the published judging criteria. The panel may decide not to select a winner if no entry can be developed to our quality and safety
                standards. The panel’s decision is final.
              </p>
            </section>
            <section>
              <h3>5. Development</h3>
              <p>
                A digital concept is not a perfume formula. Any winning concept is interpreted and developed by a professional perfumer and tested for safety and compliance
                before production. The final fragrance may differ from the submitted concept.
              </p>
            </section>
            <section>
              <h3>6. Rewards</h3>
              <p>
                Rewards are non-transferable and cannot be exchanged for cash, except for the financial reward or royalty agreed in writing if the perfume becomes a commercial
                product. Applicable taxes are the winner’s responsibility.
              </p>
            </section>
            <section>
              <h3>7. Consent & data</h3>
              <p>
                We use your details only to manage the award and contact you about your entry, as described in our <Link to="/info/privacy" className="link-inline">Privacy Policy</Link>. You can withdraw your
                entry at any time before judging by contacting customer care.
              </p>
            </section>
            <section>
              <h3>8. Winner announcement</h3>
              <p>
                Finalists are contacted privately by {dateLong(AWARD.shortlist)}. The winner is announced on {dateLong(AWARD.winner)} on our website and social channels, with their
                prior written consent.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}

function SubmissionForm() {
  const [params] = useSearchParams();
  const { ownerId, user } = useStore();
  const creationId = params.get('creation');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    conceptName: '',
    inspiration: '',
    notes: [],
    otherNotes: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [consent, setConsent] = useState({ original: false, terms: false, contact: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const [linked, setLinked] = useState(null);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, fullName: f.fullName || `${user.firstName} ${user.lastName}`, email: f.email || user.email }));
  }, [user]);

  useEffect(() => {
    if (!creationId) return;
    creationsApi.get(creationId).then((c) => {
      if (!c) return;
      setLinked(c);
      setForm((f) => ({
        ...f,
        fullName: f.fullName || c.creatorName,
        conceptName: c.perfumeName,
        inspiration: c.result.primary,
        notes: ALL_NOTES.filter((n) => c.result.notes.includes(n.label)).map((n) => n.id),
        description: (c.message ? `${c.message} ` : '') + c.result.description.slice(0, 2).join(' ').slice(0, 520),
      }));
    });
  }, [creationId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleNote = (id) => set('notes', form.notes.includes(id) ? form.notes.filter((x) => x !== id) : [...form.notes, id]);

  async function addImages(fileList) {
    const files = Array.from(fileList).slice(0, 3 - images.length);
    const out = [];
    for (const file of files) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        setErrors((e) => ({ ...e, images: 'Please upload JPG, PNG or WebP images.' }));
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrors((e) => ({ ...e, images: 'Each image must be under 8 MB.' }));
        continue;
      }
      out.push({ name: file.name, src: await downscale(file, 640) });
    }
    setImages((imgs) => [...imgs, ...out].slice(0, 3));
  }

  function validate() {
    const e = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
    if (!EMAIL_RE.test(form.email)) e.email = 'Please enter a valid email address.';
    if (form.conceptName.trim().length < 2) e.conceptName = 'Please name your concept.';
    if (!form.inspiration) e.inspiration = 'Please choose a personality inspiration.';
    const noteCount = form.notes.length + form.otherNotes.split(',').filter((s) => s.trim()).length;
    if (noteCount < 3) e.notes = 'Please choose at least three preferred notes.';
    const len = form.description.trim().length;
    if (len < 80 || len > 600) e.description = 'Your description should be between 80 and 600 characters.';
    if (!consent.original) e.original = 'Please confirm your entry is original and that you are 18 or over.';
    if (!consent.terms) e.terms = 'Please accept the competition terms.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) {
      setTimeout(() => document.querySelector('.award-form .field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
      return;
    }
    setStatus({ state: 'loading' });
    try {
      const saved = await award.submit(ownerId, {
        ...form,
        notes: form.notes.map((id) => ALL_NOTES.find((n) => n.id === id)?.label),
        images,
        creationId: linked?.id || null,
        consent: { ...consent, at: new Date().toISOString() },
      });
      setStatus({ state: 'done', saved });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  if (status.state === 'done') {
    return (
      <div className="award-form success-panel">
        <p className="eyebrow eyebrow--gold">Submission received</p>
        <h3 className="h2">Thank you, {form.fullName.split(' ')[0]}. Your essence is with us.</h3>
        <p className="muted">
          Your reference is <strong>{status.saved.reference}</strong>. Finalists are contacted by {dateLong(AWARD.shortlist)}.
        </p>
        <div className="hero__ctas" style={{ justifyContent: 'center' }}>
          <Link to="/account?tab=creations" className="btn btn--ghost">
            View in my account
          </Link>
          <Link to="/shop" className="btn">
            Explore the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="award-form" onSubmit={submit} noValidate>
      {linked && (
        <div className="linked">
          <span className="linked__bottle">
            <BespokePhoto creation={linked} />
          </span>
          <span>
            <span className="label">Linked creation</span>
            <strong>{linked.perfumeName}</strong>
          </span>
        </div>
      )}
      <div className="form-grid">
        <Field id="aw-name" label="Full name *" error={errors.fullName}>
          <input id="aw-name" className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" />
        </Field>
        <Field id="aw-email" label="Email *" error={errors.email}>
          <input id="aw-email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
        </Field>
        <Field id="aw-phone" label="Phone (optional)">
          <input id="aw-phone" type="tel" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
        </Field>
        <Field id="aw-city" label="City & country">
          <input id="aw-city" className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field id="aw-concept" label="Perfume concept name *" error={errors.conceptName}>
          <input id="aw-concept" className="input" maxLength={40} value={form.conceptName} onChange={(e) => set('conceptName', e.target.value)} />
        </Field>
        <Field id="aw-insp" label="Personality inspiration *" error={errors.inspiration}>
          <select id="aw-insp" className="select" value={form.inspiration} onChange={(e) => set('inspiration', e.target.value)}>
            <option value="">Choose…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.archetype}
              </option>
            ))}
            <option value="own">My own personality</option>
          </select>
        </Field>
        <div className="field full">
          <span className="label">Preferred fragrance notes * (choose at least three)</span>
          <div className="search__chips" style={{ marginTop: 4 }}>
            {ALL_NOTES.map((n) => (
              <button type="button" key={n.id} className="chip" aria-pressed={form.notes.includes(n.id)} onClick={() => toggleNote(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
          <input className="input" style={{ marginTop: 10 }} placeholder="Other notes, separated by commas (optional)" value={form.otherNotes} onChange={(e) => set('otherNotes', e.target.value)} aria-label="Other notes" />
          {errors.notes && <span className="field-error">{errors.notes}</span>}
        </div>
        <Field id="aw-desc" label="Short description *" error={errors.description} full>
          <textarea id="aw-desc" className="textarea" rows={5} maxLength={600} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Who is the woman behind your scent? When does she wear it? How should it make her feel?" />
          <span className="tiny muted">{form.description.trim().length}/600 · minimum 80</span>
        </Field>
        <div className="field full">
          <span className="label">Inspiration images (optional, up to 3)</span>
          {images.length < 3 && (
            <label className="upload">
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => addImages(e.target.files)} />
              Drop images here or <span className="link-inline">browse</span>
            </label>
          )}
          {errors.images && <span className="field-error">{errors.images}</span>}
          {images.length > 0 && (
            <div className="upload-previews">
              {images.map((img, i) => (
                <figure key={i}>
                  <img src={img.src} alt={`Inspiration ${i + 1}`} />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label={`Remove ${img.name}`}>
                    ×
                  </button>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="consents">
        <label className="check">
          <input type="checkbox" checked={consent.original} onChange={(e) => setConsent({ ...consent, original: e.target.checked })} />
          <span>I confirm that I am 18 or over and that this concept, description and any images are my own original work. *</span>
        </label>
        {errors.original && <span className="field-error">{errors.original}</span>}
        <label className="check">
          <input type="checkbox" checked={consent.terms} onChange={(e) => setConsent({ ...consent, terms: e.target.checked })} />
          <span>
            I have read and accept the <a href="#terms" className="link-inline">competition rules, intellectual property terms</a> and the{' '}
            <Link to="/info/privacy" className="link-inline">Privacy Policy</Link>. *
          </span>
        </label>
        {errors.terms && <span className="field-error">{errors.terms}</span>}
        <label className="check">
          <input type="checkbox" checked={consent.contact} onChange={(e) => setConsent({ ...consent, contact: e.target.checked })} />
          <span>I would also like to receive news about future editions and releases (optional).</span>
        </label>
      </div>
      {status.state === 'error' && <p className="field-error">{status.message}</p>}
      <button type="submit" className={cls('btn btn--block')} disabled={status.state === 'loading'}>
        {status.state === 'loading' ? 'Submitting…' : 'Submit my concept'}
      </button>
    </form>
  );
}

function Field({ id, label, error, full, children }) {
  return (
    <div className={cls('field', full && 'full')}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function downscale(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = reject;
    img.src = url;
  });
}
