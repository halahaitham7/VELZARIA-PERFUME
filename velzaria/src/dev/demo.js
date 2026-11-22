/**
 * DEV ONLY — fills the browser with sample data so every screen can be
 * reviewed without clicking through the flows. Active only under `npm run dev`
 * when the URL contains ?demo=<step>, e.g.
 *   /create?demo=quiz5      quiz result      /create?demo=quiz6   personalise
 *   /create?demo=quiz7      final step       /cart?demo=cart      bag with items
 *   /account?demo=account   signed-in account with an order and a creation
 * Never runs in a production build.
 */
const answers = { personality: ['confident', 'independent'], lifestyle: ['travel', 'leadership'], notes: ['rose', 'saffron', 'amber', 'vetiver'], intensity: 'deep' };
const design = { creatorName: 'Nour Hassan', perfumeName: 'Midnight Resolve', silhouette: 'conqueror', tint: 'violet', cap: 'antique', engraving: 'Nour', engravingStyle: 'italic', message: 'For every door I open myself.' };

export function applyDemo() {
  const demo = new URLSearchParams(location.search).get('demo');
  if (!demo) return;
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  if (demo.startsWith('quiz')) {
    const step = Number(demo.replace('quiz', '')) || 5;
    set('vz_quiz_draft_v1', { step, answers, design: step >= 6 ? design : null, savedId: null });
  }
  if (demo === 'cart' || demo === 'account') {
    set('vz_cart_v1', {
      discount: null,
      lines: [
        { key: 'p1', type: 'product', productId: 'sovereign', name: 'The Sovereign', size: 50, sizeLabel: '50 ml', basePrice: 4900, options: { engraving: 'N.H.', giftWrap: true, giftMessage: 'Happy birthday' }, qty: 1 },
        { key: 'p2', type: 'discovery', productId: 'discovery-set', name: 'The Discovery Set', size: '5x2', sizeLabel: '5 × 2 ml vials', basePrice: 1250, options: {}, qty: 1 },
        { key: 'p3', type: 'bespoke', productId: 'bespoke', name: 'Bespoke Creation · 50 ml', size: '50', sizeLabel: '50 ml · Eau de Parfum', basePrice: 9800, options: {}, qty: 1, creation: { id: 'c-demo', ...design, glass: '#5E3F78', liquid: '#4A2C63' } },
      ],
    });
  }
  if (demo === 'account') {
    const user = { id: 'u-demo', firstName: 'Nour', lastName: 'Hassan', email: 'nour.demo@example.com', password: 'x', phone: '010 1234 5678', city: 'Cairo', address: '12 Road 9, Maadi', newsletter: true, createdAt: '2026-10-02T10:00:00Z' };
    const creation = {
      id: 'c-demo', ownerId: 'u-demo', createdAt: '2026-11-20T10:00:00Z', ...design, glass: '#5E3F78', liquid: '#4A2C63', answers,
      result: { primary: 'conqueror', matches: [], family: 'Oriental Floral', notes: ['Rose', 'Saffron', 'Amber', 'Vetiver'], composition: { top: ['Saffron', 'Black Pepper', 'Bergamot'], heart: ['Rose', 'Iris', 'Cedarwood'], base: ['Amber', 'Vetiver', 'Patchouli'] }, concentration: 'Extrait de Parfum', description: [] },
    };
    const order = {
      id: 'o-demo', number: 'VZ-24018', userId: 'u-demo', email: user.email, phone: user.phone, createdAt: '2026-11-21T09:00:00Z', status: 'received', history: [{ status: 'received', at: '2026-11-21T09:00:00Z' }],
      customer: { firstName: 'Nour', lastName: 'Hassan' }, shippingAddress: { address: user.address, apartment: '', city: 'Cairo', zone: 'Cairo & Giza' },
      items: [{ name: 'The Spark', type: 'product', productId: 'spark', size: 50, sizeLabel: '50 ml', qty: 1, unitPrice: 4200, options: {} }],
      subtotal: 4200, discount: null, shipping: 85, total: 4285, payment: { method: 'cod', provider: null, status: 'pay_on_delivery' },
    };
    set('vz_db_v1', { users: [user], orders: [order], creations: [creation], submissions: [], subscribers: [], orderSeq: 24018 });
    set('vz_session_v1', { userId: 'u-demo' });
    set('vz_wishlist_v1', ['romantic', 'artist']);
  }
  history.replaceState(null, '', location.pathname + location.hash);
}
