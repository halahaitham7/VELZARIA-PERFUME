/**
 * Deterministic recommendation engine for the "Create Your Perfume" quiz.
 *
 * Score per essence =
 *   Σ personality weights (×1.4, the strongest signal)
 * + Σ lifestyle weights
 * + Σ note affinity (3 / number of essences that contain the note — rare notes count more)
 * + intensity weight
 *
 * Output is a ranked profile (percentage share of total score), the matching
 * fragrance family, the chosen notes and a suggested — conceptual — pyramid.
 */
import { products, getProduct } from '../data/products.js';
import { PERSONALITY, LIFESTYLE, ALL_NOTES, INTENSITY } from '../data/quiz.js';
import { listJoin } from './format.js';

const IDS = products.map((p) => p.id);

function add(scores, weights, factor = 1) {
  Object.entries(weights || {}).forEach(([k, v]) => {
    scores[k] += v * factor;
  });
}

export function scoreAnswers(answers) {
  const scores = Object.fromEntries(IDS.map((id) => [id, 0]));
  answers.personality.forEach((id) => add(scores, PERSONALITY.find((o) => o.id === id)?.w, 1.4));
  answers.lifestyle.forEach((id) => add(scores, LIFESTYLE.find((o) => o.id === id)?.w));
  answers.notes.forEach((id) => {
    const note = ALL_NOTES.find((n) => n.id === id);
    if (!note) return;
    const share = 3 / note.in.length;
    note.in.forEach((pid) => (scores[pid] += share));
  });
  add(scores, INTENSITY.find((o) => o.id === answers.intensity)?.w);
  return scores;
}

export function recommend(answers) {
  const scores = scoreAnswers(answers);
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const ranked = IDS.map((id) => ({ id, product: getProduct(id), score: scores[id], share: Math.round((scores[id] / total) * 100) }))
    .sort((a, b) => b.score - a.score);

  // Make the displayed shares add up to exactly 100.
  const diff = 100 - ranked.reduce((a, r) => a + r.share, 0);
  ranked[0].share += diff;

  const primary = ranked[0];
  // A second (or third) match is shown when it is genuinely close (≥ 72% of the leading score).
  const matches = ranked.filter((r, i) => i === 0 || (i < 3 && r.score >= primary.score * 0.72));

  const chosen = answers.notes.map((id) => ALL_NOTES.find((n) => n.id === id)).filter(Boolean);

  // Fragrance family: the families the customer chose most often,
  // falling back to the primary essence's direction.
  const famCount = {};
  chosen.forEach((n) => (famCount[n.family] = (famCount[n.family] || 0) + 1));
  const topFamilies = Object.entries(famCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([f]) => f);
  const family = topFamilies.length ? topFamilies.join(' ') : primary.product.direction;

  // Suggested pyramid: customer's notes first, completed by the primary essence.
  const pick = (position, fallback) => {
    const mine = chosen.filter((n) => n.position === position).map((n) => n.label);
    const fill = fallback.filter((f) => !mine.some((m) => f.toLowerCase().includes(m.toLowerCase())));
    return [...mine, ...fill].slice(0, 3);
  };
  const composition = {
    top: pick('top', primary.product.notes.top),
    heart: pick('heart', primary.product.notes.heart),
    base: pick('base', primary.product.notes.base),
  };

  const intensity = INTENSITY.find((o) => o.id === answers.intensity) || INTENSITY[1];
  const traitLabels = answers.personality
    .map((id) => PERSONALITY.find((o) => o.id === id)?.label.toLowerCase())
    .filter(Boolean);

  const second = matches[1];
  const description = [
    traitLabels.length
      ? `You describe yourself as ${traitLabels.join(', ')} — and your answers return, again and again, to the world of ${primary.product.name}.`
      : `Your answers return, again and again, to the world of ${primary.product.name}.`,
    `${primary.product.archetype}: ${primary.product.summary}`,
    second
      ? `There is a strong thread of ${second.product.name} in you too (${second.share}% of your profile), which is why your composition borrows from both.`
      : null,
    chosen.length
      ? `Your love of ${listJoin(chosen.map((n) => n.label.toLowerCase()))} points to ${/^[aeiou]/i.test(family) ? 'an' : 'a'} ${family.toLowerCase()} composition: ${listJoin(composition.top)} to open, ${listJoin(composition.heart)} at its heart, and ${listJoin(composition.base)} to stay with you.`
      : `We would build your composition around ${primary.product.direction.toLowerCase()} — ${listJoin(composition.top)}, ${listJoin(composition.heart)} and ${listJoin(composition.base)}.`,
    `Because you want it to feel ${intensity.label.toLowerCase()}, we would ask our perfumer to ${intensity.advice}.`,
  ].filter(Boolean);

  return {
    ranked,
    matches,
    primary,
    family,
    notes: chosen,
    composition,
    concentration: intensity.concentration,
    description,
  };
}
