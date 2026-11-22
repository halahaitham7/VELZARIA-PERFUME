import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PERSONALITY, LIFESTYLE, NOTE_GROUPS, INTENSITY, TINTS, CAPS, ENGRAVING_STYLES } from '../data/quiz.js';
import { products, BESPOKE, EDITORIAL, getProduct } from '../data/products.js';
import { recommend } from '../lib/recommend.js';
import { useStore } from '../context/StoreContext.jsx';
import { creations as creationsApi } from '../services/api.js';
import { BOTTLE_DEFAULTS } from '../components/Bottle.jsx';
import { NoteSwatch, ProductPhoto, Photo } from '../components/ui.jsx';
import { IconArrow, IconCheck } from '../components/Icons.jsx';
import { cls, money, listJoin } from '../lib/format.js';

const DRAFT_KEY = 'vz_quiz_draft_v1';
const STEPS = ['Personality', 'Lifestyle', 'Favourite scents', 'Intensity', 'Your result', 'Your bottle', 'Save & submit'];
const LIMITS = { personality: 3, lifestyle: 3, notes: 6 };

const emptyAnswers = { personality: [], lifestyle: [], notes: [], intensity: '' };

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function Create() {
  const draft = loadDraft();
  const [step, setStep] = useState(draft?.step || 0);
  const [dir, setDir] = useState('fwd');
  const [answers, setAnswers] = useState(draft?.answers || emptyAnswers);
  const [design, setDesign] = useState(draft?.design || null);
  const [savedId, setSavedId] = useState(draft?.savedId || null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, answers, design, savedId }));
    } catch {
      /* ignore */
    }
  }, [step, answers, design, savedId]);

  const result = useMemo(() => (answers.intensity && answers.personality.length ? recommend(answers) : null), [answers]);

  // Initialise bottle design from the result the first time we reach step 6.
  useEffect(() => {
    if (step === 6 && result && !design) {
      const pid = result.primary.id;
      const tint = TINTS.find((t) => t.glass === BOTTLE_DEFAULTS[pid].glass) || TINTS[0];
      setDesign({
        creatorName: '',
        perfumeName: '',
        silhouette: pid,
        tint: tint.id,
        cap: BOTTLE_DEFAULTS[pid].cap === 'stone' ? 'antique' : BOTTLE_DEFAULTS[pid].cap,
        engraving: '',
        engravingStyle: 'serif',
        message: '',
      });
    }
  }, [step, result, design]);

  function go(n) {
    setDir(n > step ? 'fwd' : 'back');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggle(key, id) {
    setAnswers((a) => {
      const has = a[key].includes(id);
      if (!has && a[key].length >= LIMITS[key]) return a;
      return { ...a, [key]: has ? a[key].filter((x) => x !== id) : [...a[key], id] };
    });
    setSavedId(null);
  }

  function restart() {
    setAnswers(emptyAnswers);
    setDesign(null);
    setSavedId(null);
    go(0);
  }

  const canNext = {
    1: answers.personality.length > 0,
    2: answers.lifestyle.length > 0,
    3: answers.notes.length > 0,
    4: !!answers.intensity,
    5: !!result,
    6: !!(design && design.creatorName.trim() && design.perfumeName.trim()),
  };

  if (step === 0) return <Intro onStart={() => go(1)} hasDraft={!!draft && (draft.answers?.personality?.length > 0)} onResume={() => go(draft.step || 1)} onRestart={restart} />;

  return (
    <section className="quiz">
      <div className="quiz__top">
        <div className="container">
          <div className="quiz__progress" role="progressbar" aria-valuemin={1} aria-valuemax={7} aria-valuenow={step} aria-label={`Step ${step} of 7`}>
            <i style={{ width: `${(step / 7) * 100}%` }} />
          </div>
          <ol className="quiz__steps">
            {STEPS.map((s, i) => (
              <li key={s} className={cls(i + 1 === step && 'is-current', i + 1 < step && 'is-done')}>
                <button type="button" onClick={() => i + 1 < step && go(i + 1)} disabled={i + 1 >= step}>
                  <span className="numeral">{String(i + 1).padStart(2, '0')}</span>
                  <span className="quiz__step-label">{s}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="container quiz__body">
        <div key={step} className={cls('quiz-step', `quiz-step--${dir}`)}>
          {step === 1 && (
            <Question n="01" eyebrow="Discover your personality" title="How would you describe yourself?" hint={`Choose up to ${LIMITS.personality}.`}>
              <div className="opt-grid">
                {PERSONALITY.map((o, i) => (
                  <Option key={o.id} index={i} selected={answers.personality.includes(o.id)} onClick={() => toggle('personality', o.id)} title={o.label} desc={o.hint} />
                ))}
              </div>
            </Question>
          )}

          {step === 2 && (
            <Question n="02" eyebrow="Your lifestyle" title="What do you enjoy most?" hint={`Choose up to ${LIMITS.lifestyle}.`}>
              <div className="opt-grid">
                {LIFESTYLE.map((o, i) => (
                  <Option key={o.id} index={i} selected={answers.lifestyle.includes(o.id)} onClick={() => toggle('lifestyle', o.id)} title={o.label} />
                ))}
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question n="03" eyebrow="Your favourite scents" title="Which notes draw you in?" hint={`Choose up to ${LIMITS.notes} notes · ${answers.notes.length} selected.`}>
              <div className="note-groups">
                {NOTE_GROUPS.map((g) => (
                  <div key={g.family} className="note-group">
                    <h3 className="note-group__title">
                      <span className="eyebrow">{g.family}</span>
                    </h3>
                    <div className="note-group__grid">
                      {g.notes.map((n) => {
                        const sel = answers.notes.includes(n.id);
                        const full = !sel && answers.notes.length >= LIMITS.notes;
                        return (
                          <button key={n.id} type="button" className={cls('note-card', sel && 'is-selected')} aria-pressed={sel} disabled={full} onClick={() => toggle('notes', n.id)}>
                            <NoteSwatch color={n.color} family={g.family} image={n.image} />
                            <span className="note-card__name">{n.label}</span>
                            <span className="note-card__pos">{n.position} note</span>
                            {sel && (
                              <span className="note-card__check">
                                <IconCheck width="14" height="14" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Question>
          )}

          {step === 4 && (
            <Question n="04" eyebrow="Your fragrance intensity" title="How would you like your perfume to feel?" hint="Choose one.">
              <div className="intensity">
                {INTENSITY.map((o, i) => (
                  <button
                    key={o.id}
                    type="button"
                    className={cls('intensity__opt', answers.intensity === o.id && 'is-selected')}
                    aria-pressed={answers.intensity === o.id}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, intensity: o.id }));
                      setSavedId(null);
                    }}
                  >
                    <span className="intensity__wave" style={{ '--lvl': i }} aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((b) => (
                        <i key={b} />
                      ))}
                    </span>
                    <strong>{o.label}</strong>
                    <small>{o.desc}</small>
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 5 && result && <Result result={result} />}

          {step === 6 && design && result && <Personalise design={design} setDesign={(d) => { setDesign(d); setSavedId(null); }} result={result} />}

          {step === 7 && design && result && <Finish design={design} result={result} answers={answers} savedId={savedId} setSavedId={setSavedId} onRestart={restart} />}
        </div>

        {step < 7 && (
          <div className="quiz__nav">
            <button type="button" className="btn btn--ghost" onClick={() => go(step - 1)}>
              Back
            </button>
            <span className="tiny muted quiz__nav-hint">{!canNext[step] && step === 6 ? 'Add your name and a name for your perfume to continue.' : ''}</span>
            <button type="button" className="btn" disabled={!canNext[step]} onClick={() => go(step + 1)}>
              {step === 4 ? 'Reveal my essence' : step === 5 ? 'Personalise my bottle' : 'Continue'} <IconArrow />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
function Intro({ onStart, hasDraft, onResume, onRestart }) {
  return (
    <section className="quiz-intro">
      <div className="container quiz-intro__grid">
        <div>
          <p className="eyebrow eyebrow--gold">The Bespoke Atelier</p>
          <h1 className="display" style={{ margin: '18px 0 26px' }}>
            Create <em>your</em> perfume.
          </h1>
          <p className="lead">
            Seven quiet steps. Tell us who you are, how you live and which notes move you — we’ll reveal your essence, compose a fragrance concept around it, and let you
            design the bottle that carries your name.
          </p>
          <div className="hero__ctas">
            {hasDraft ? (
              <>
                <button className="btn" onClick={onResume}>
                  Continue where I left off
                </button>
                <button className="btn btn--ghost" onClick={onRestart}>
                  Start again
                </button>
              </>
            ) : (
              <button className="btn" onClick={onStart}>
                Begin <IconArrow />
              </button>
            )}
          </div>
          <p className="notice" style={{ marginTop: 32, maxWidth: 560 }}>
            <strong>Please note · </strong>Your result is a conceptual fragrance recommendation. It is not a chemically tested or manufactured formula — every creation is
            reviewed and developed by a professional perfumer before anything is produced.
          </p>
        </div>
        <div className="quiz-intro__visual quiz-intro__visual--photo">
          <Photo image={EDITORIAL['trio-romantic-conqueror-artist']} alt="The Romantic, The Conqueror and The Artist perfume bottles together" className="quiz-intro__photo" eager />
          <ol className="quiz-intro__list">
            {STEPS.map((s, i) => (
              <li key={s}>
                <span className="numeral">{String(i + 1).padStart(2, '0')}</span> {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Question({ n, eyebrow, title, hint, children }) {
  return (
    <div className="question">
      <header className="question__head">
        <span className="question__n numeral">{n}</span>
        <div>
          <p className="eyebrow eyebrow--gold">{eyebrow}</p>
          <h1 className="h1">{title}</h1>
          <p className="muted small">{hint}</p>
        </div>
      </header>
      {children}
    </div>
  );
}

function Option({ index, selected, onClick, title, desc }) {
  return (
    <button type="button" className={cls('opt', selected && 'is-selected')} aria-pressed={selected} onClick={onClick} style={{ '--i': index }}>
      <span className="opt__letter">{String.fromCharCode(65 + index)}</span>
      <span className="opt__text">
        <strong>{title}</strong>
        {desc && <small>{desc}</small>}
      </span>
      <span className="opt__tick">{selected && <IconCheck width="14" height="14" />}</span>
    </button>
  );
}

/* ------------------------------------------------------------ */
function Result({ result }) {
  const p = result.primary.product;
  const others = result.matches.slice(1);
  return (
    <div className="result">
      <div className="result__hero" style={{ '--stage': p.palette.stage, '--stage-deep': p.palette.stageDeep }}>
        <div className="result__bottle result__bottle--photo">
          <ProductPhoto product={p} eager />
        </div>
        <div className="result__intro">
          <p className="eyebrow eyebrow--gold">Your strongest personality match</p>
          <h1 className="display">{p.name}</h1>
          <p className="serif-lead">{p.personality}</p>
          <div className="result__share">
            <strong>{result.primary.share}%</strong>
            <span>of your essence profile</span>
          </div>
        </div>
      </div>

      <div className="result__grid">
        <div className="result__card">
          <h2 className="eyebrow">Your essence profile</h2>
          <ul className="profile">
            {result.ranked.map((r) => (
              <li key={r.id}>
                <span>{r.product.name}</span>
                <span className="profile__bar">
                  <i style={{ width: `${r.share}%`, background: r.product.palette.liquid }} />
                </span>
                <span className="profile__pct">{r.share}%</span>
              </li>
            ))}
          </ul>
          {others.length > 0 && (
            <p className="small" style={{ marginTop: 18 }}>
              You also carry a strong thread of <strong>{listJoin(others.map((o) => o.product.name))}</strong>.
            </p>
          )}
        </div>

        <div className="result__card">
          <h2 className="eyebrow">Recommended fragrance family</h2>
          <p className="result__family">{result.family}</p>
          <h2 className="eyebrow" style={{ marginTop: 22 }}>
            Your favourite notes
          </h2>
          <div className="result__notes">
            {result.notes.map((n) => (
              <span key={n.id} className="chip">
                <span className="dot" style={{ background: n.color }} /> {n.label}
              </span>
            ))}
          </div>
          <h2 className="eyebrow" style={{ marginTop: 22 }}>
            Suggested concentration
          </h2>
          <p className="small">{result.concentration}</p>
        </div>

        <div className="result__card result__card--wide">
          <h2 className="eyebrow">Your suggested composition</h2>
          <div className="result__pyramid">
            {['top', 'heart', 'base'].map((k) => (
              <div key={k}>
                <span className="label">{k} notes</span>
                <p>{result.composition[k].join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="result__card result__card--wide result__why">
          <h2 className="eyebrow">Why this fragrance is you</h2>
          {result.description.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
      </div>

      {others.length > 0 && (
        <div className="result__also">
          <h2 className="h3">Also strongly you</h2>
          <div className="result__also-grid">
            {others.map((o) => (
              <Link key={o.id} to={`/perfume/${o.product.slug}`} className="also" style={{ '--stage': o.product.palette.stage }} target="_blank" rel="noreferrer">
                <span className="also__bottle also__bottle--photo">
                  <ProductPhoto product={o.product} />
                </span>
                <span>
                  <strong>{o.product.name}</strong>
                  <small>
                    {o.share}% · {o.product.direction}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="notice result__disclaimer">
        <strong>A concept, not a formula · </strong>This composition is a starting point for our perfumer. Final notes, concentration and availability are confirmed only after
        professional development and testing.
      </p>
      <p className="small" style={{ marginTop: 16 }}>
        Prefer a finished essence today? <Link className="link-inline" to={`/perfume/${p.slug}`}>Shop {p.name}</Link>.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ */
/** How the engraving reads in the chosen style. */
function engravingText(text, style) {
  const t = text.trim();
  if (style === 'initials') return t.split(/\s+/).map((w) => w[0].toUpperCase()).join('.') + '.';
  return style === 'serif' ? t.toUpperCase() : t;
}

function Personalise({ design, setDesign, result }) {
  const tint = TINTS.find((t) => t.id === design.tint) || TINTS[0];
  const cap = CAPS.find((c) => c.id === design.cap) || CAPS[0];
  const set = (k, v) => setDesign({ ...design, [k]: v });
  const suggestion = design.creatorName.trim() ? `${design.creatorName.trim().split(' ')[0]}’s ${result.primary.product.archetype.replace('The ', '')}` : '';

  return (
    <div className="personalise">
      <div className="personalise__form">
        <header className="question__head">
          <span className="question__n numeral">06</span>
          <div>
            <p className="eyebrow eyebrow--gold">Personalise your bottle</p>
            <h1 className="h1">Make it unmistakably yours.</h1>
          </div>
        </header>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="p-name">Your name *</label>
            <input id="p-name" className="input" maxLength={40} value={design.creatorName} onChange={(e) => set('creatorName', e.target.value)} autoComplete="given-name" />
          </div>
          <div className="field">
            <label htmlFor="p-perfume">Name your perfume *</label>
            <input id="p-perfume" className="input" maxLength={28} value={design.perfumeName} onChange={(e) => set('perfumeName', e.target.value)} placeholder={suggestion || 'e.g. Golden Hour'} />
            {suggestion && !design.perfumeName && (
              <button type="button" className="tiny link-inline" style={{ alignSelf: 'flex-start' }} onClick={() => set('perfumeName', suggestion)}>
                Use “{suggestion}”
              </button>
            )}
          </div>
        </div>

        <fieldset className="pfield">
          <legend className="label">Silhouette</legend>
          <div className="sil-grid">
            {products.map((p) => (
              <button type="button" key={p.id} className={cls('sil', design.silhouette === p.id && 'is-selected')} aria-pressed={design.silhouette === p.id} onClick={() => set('silhouette', p.id)}>
                <ProductPhoto product={p} />
                <small>{p.short}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pfield">
          <legend className="label">Glass</legend>
          <div className="swatch-row">
            {TINTS.map((t) => (
              <button type="button" key={t.id} className={cls('tint', design.tint === t.id && 'is-selected')} aria-pressed={design.tint === t.id} onClick={() => set('tint', t.id)}>
                <span style={{ background: `linear-gradient(135deg, ${t.glass}, ${t.liquid})` }} />
                <small>{t.label}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pfield">
          <legend className="label">Cap finish</legend>
          <div className="swatch-row">
            {CAPS.map((c) => (
              <button type="button" key={c.id} className={cls('tint', design.cap === c.id && 'is-selected')} aria-pressed={design.cap === c.id} onClick={() => set('cap', c.id)}>
                <span style={{ background: `linear-gradient(90deg, ${c.colors[0]}, ${c.colors[1]} 45%, ${c.colors[2]})` }} />
                <small>{c.label}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="p-engr">Engraving on the glass</label>
            <input id="p-engr" className="input" maxLength={16} value={design.engraving} onChange={(e) => set('engraving', e.target.value)} placeholder="Name or initials" />
          </div>
          <div className="field">
            <label htmlFor="p-style">Engraving style</label>
            <select id="p-style" className="select" value={design.engravingStyle} onChange={(e) => set('engravingStyle', e.target.value)}>
              {ENGRAVING_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="p-msg">Personal message (printed on the card in your box)</label>
            <textarea id="p-msg" className="textarea" maxLength={160} rows={3} value={design.message} onChange={(e) => set('message', e.target.value)} placeholder="A few words for yourself — or for her." />
            <span className="tiny muted">{design.message.length}/160</span>
          </div>
        </div>
      </div>

      <aside className="preview" aria-label="Preview of your bottle">
        <div className="preview__photo" key={design.silhouette}>
          <ProductPhoto product={getProduct(design.silhouette)} kind="bottle" />
          {design.engraving.trim() && (
            <span className={cls('stage__engraving', `stage__engraving--${design.engravingStyle}`)}>{engravingText(design.engraving, design.engravingStyle)}</span>
          )}
        </div>
        <ul className="preview__spec">
          <li>
            <span className="dot" style={{ background: `linear-gradient(135deg, ${tint.glass}, ${tint.liquid})` }} /> {tint.label} glass
          </li>
          <li>
            <span className="dot" style={{ background: `linear-gradient(90deg, ${cap.colors[0]}, ${cap.colors[1]} 45%, ${cap.colors[2]})` }} /> {cap.label} cap
          </li>
          <li>{getProduct(design.silhouette).short} silhouette</li>
        </ul>
        <p className="tiny muted preview__note">Photographed in its signature glass. Your glass tint and cap finish are applied by hand in our atelier.</p>
        <div className="preview__card">
          <span className="preview__logo">VÉLZARIA</span>
          <p className="preview__name">{design.perfumeName || 'Your perfume'}</p>
          <p className="tiny muted">Composed by {design.creatorName || '—'} · inspired by {result.primary.product.name}</p>
          {design.message && <p className="preview__msg">“{design.message}”</p>}
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------ */
function buildCreation(design, result, answers) {
  const tint = TINTS.find((t) => t.id === design.tint) || TINTS[0];
  return {
    perfumeName: design.perfumeName.trim(),
    creatorName: design.creatorName.trim(),
    silhouette: design.silhouette,
    tint: tint.id,
    glass: tint.glass,
    liquid: tint.liquid,
    cap: design.cap,
    engraving: design.engraving.trim(),
    engravingStyle: design.engravingStyle,
    message: design.message.trim(),
    answers,
    result: {
      primary: result.primary.id,
      matches: result.ranked.map((r) => ({ id: r.id, share: r.share })),
      family: result.family,
      notes: result.notes.map((n) => n.label),
      composition: result.composition,
      concentration: result.concentration,
      description: result.description,
    },
  };
}

function Finish({ design, result, answers, savedId, setSavedId, onRestart }) {
  const { ownerId, user, addToCart, toast } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const creation = buildCreation(design, result, answers);
  const tint = TINTS.find((t) => t.id === design.tint) || TINTS[0];

  async function ensureSaved() {
    if (savedId) return savedId;
    const saved = await creationsApi.save(ownerId, creation);
    setSavedId(saved.id);
    return saved.id;
  }

  async function run(kind) {
    setBusy(kind);
    setError('');
    try {
      const id = await ensureSaved();
      if (kind === 'save') toast('Saved to My Creations', { link: '/account?tab=creations', linkLabel: 'View' });
      if (kind === 'cart') {
        addToCart({
          type: 'bespoke',
          productId: 'bespoke',
          name: BESPOKE.name,
          size: '50',
          sizeLabel: '50 ml · Eau de Parfum',
          basePrice: BESPOKE.price,
          options: {},
          creation: { id, ...creation },
        });
      }
      if (kind === 'award') navigate(`/creators-award?creation=${id}#submit`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="finish">
      <div className="finish__visual finish__visual--photo">
        <ProductPhoto product={getProduct(design.silhouette)} kind="collection" eager />
        <ul className="finish__spec">
          <li>
            <span className="dot" style={{ background: `linear-gradient(135deg, ${tint.glass}, ${tint.liquid})` }} /> {tint.label} glass
          </li>
          <li>{CAPS.find((c) => c.id === design.cap)?.label} cap</li>
          {design.engraving && <li>Engraved “{design.engraving}”</li>}
        </ul>
      </div>
      <div className="finish__copy">
        <p className="eyebrow eyebrow--gold">Step 07 · Your creation</p>
        <h1 className="h1">{creation.perfumeName}</h1>
        <p className="serif-lead">
          {/^[aeiou]/i.test(result.family) ? 'An' : 'A'} {result.family.toLowerCase()} concept by {creation.creatorName}, inspired by {result.primary.product.name}.
        </p>
        <dl className="notes-mini">
          <div>
            <dt>Top</dt>
            <dd>{creation.result.composition.top.join(', ')}</dd>
          </div>
          <div>
            <dt>Heart</dt>
            <dd>{creation.result.composition.heart.join(', ')}</dd>
          </div>
          <div>
            <dt>Base</dt>
            <dd>{creation.result.composition.base.join(', ')}</dd>
          </div>
        </dl>

        <div className="finish__actions">
          <div className="finish__action">
            <div>
              <h2 className="h3">Save to My Creations</h2>
              <p className="small muted">{user ? 'Stored in your account.' : 'Saved on this device. Sign in to keep it in your account across devices.'}</p>
            </div>
            <button className="btn btn--ghost" onClick={() => run('save')} disabled={busy !== '' || !!savedId}>
              {savedId ? (
                <>
                  <IconCheck width="14" height="14" /> Saved
                </>
              ) : busy === 'save' ? 'Saving…' : 'Save creation'}
            </button>
          </div>
          <div className="finish__action">
            <div>
              <h2 className="h3">Commission your bottle · {money(BESPOKE.price)}</h2>
              <p className="small muted">{BESPOKE.note}</p>
            </div>
            <button className="btn" onClick={() => run('cart')} disabled={busy !== ''}>
              {busy === 'cart' ? 'Adding…' : 'Add to bag'}
            </button>
          </div>
          <div className="finish__action">
            <div>
              <h2 className="h3">Enter the Creator’s Award</h2>
              <p className="small muted">Submit your concept for the chance to see it developed into a VÉLZARIA limited edition.</p>
            </div>
            <button className="btn btn--ghost" onClick={() => run('award')} disabled={busy !== ''}>
              {busy === 'award' ? 'Preparing…' : 'Submit to the Award'}
            </button>
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        {savedId && (
          <p className="small">
            <Link to="/account?tab=creations" className="link-inline">
              View My Creations
            </Link>
          </p>
        )}
        <div className="finish__foot">
          <button className="link" onClick={onRestart}>
            Start a new creation
          </button>
        </div>
      </div>
    </div>
  );
}
