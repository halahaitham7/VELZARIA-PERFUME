/**
 * SAMPLE REVIEWS — prototype content only.
 * Replace with verified customer reviews from the backend (`GET /reviews`)
 * before launch. Do not publish invented reviews on the live store.
 */
export const reviews = [
  { id: 'r1', product: 'sovereign', name: 'Nour H.', city: 'Cairo', rating: 5, title: 'It feels like a decision', body: 'The saffron opening is so polished, and by the afternoon it settles into the softest amber. I wear it to every important meeting now.' },
  { id: 'r2', product: 'sovereign', name: 'Farida M.', city: 'Alexandria', rating: 5, title: 'The bottle alone', body: 'The glass is heavy and clear, like a piece of sculpture on my dresser. The scent lasts the entire day on my skin.' },
  { id: 'r3', product: 'sovereign', name: 'Yasmin R.', city: 'Dubai', rating: 4, title: 'Regal but wearable', body: 'Rich without being heavy. I expected something louder — instead it is confident and quiet, which is exactly how I want to be.' },
  { id: 'r4', product: 'romantic', name: 'Salma A.', city: 'Giza', rating: 5, title: 'Soft and unforgettable', body: 'Pear and peony at first, then a musky softness that my husband keeps asking about. Romantic without being sugary.' },
  { id: 'r5', product: 'romantic', name: 'Hana E.', city: 'Cairo', rating: 5, title: 'My wedding scent', body: 'I chose The Romantic for my wedding day and engraved our initials on the bottle. Every time I open it, I am back there.' },
  { id: 'r6', product: 'romantic', name: 'Mariam S.', city: 'Mansoura', rating: 4, title: 'Delicate', body: 'A beautiful, gentle fragrance. It sits close to the skin, so I reapply in the evening, but I love that it never overwhelms.' },
  { id: 'r7', product: 'conqueror', name: 'Laila K.', city: 'London', rating: 5, title: 'For the long road', body: 'Black pepper, iris and patchouli — it is warm, spicy and steady. I travel constantly and this has become my anchor.' },
  { id: 'r8', product: 'conqueror', name: 'Dina T.', city: 'Cairo', rating: 5, title: 'Bold, finally', body: 'Most feminine perfumes are too sweet for me. This one is strong and elegant at the same time. The violet bottle is stunning.' },
  { id: 'r9', product: 'conqueror', name: 'Reem F.', city: 'Riyadh', rating: 5, title: 'Compliments everywhere', body: 'It lasts through a full day and a dinner after. People stop me to ask what I am wearing.' },
  { id: 'r10', product: 'artist', name: 'Amira G.', city: 'Cairo', rating: 5, title: 'Smells like my studio', body: 'Fig leaves, green tea and something woody underneath. It is calm and unusual — exactly what I was looking for.' },
  { id: 'r11', product: 'artist', name: 'Sara W.', city: 'El Gouna', rating: 5, title: 'Fresh, but with depth', body: 'Perfect for the heat. It is green and airy in the morning and becomes softly woody by sunset.' },
  { id: 'r12', product: 'artist', name: 'Jana B.', city: 'Beirut', rating: 4, title: 'A quiet favourite', body: 'Not a crowd-pleaser in the obvious way, which I love. It feels personal, like it belongs only to me.' },
  { id: 'r13', product: 'spark', name: 'Malak O.', city: 'Cairo', rating: 5, title: 'Pure joy in a bottle', body: 'Blood orange and raspberry with a vanilla glow. I wear it to every party and on every holiday.' },
  { id: 'r14', product: 'spark', name: 'Tala N.', city: 'Sahel', rating: 5, title: 'The coral bottle!', body: 'I bought it for the bottle and stayed for the scent. Playful, warm and surprisingly long-lasting.' },
  { id: 'r15', product: 'spark', name: 'Rana Z.', city: 'Alexandria', rating: 5, title: 'Everyone asks', body: 'My friends now call it my signature. It is fun without being childish — grown-up sweetness.' },
];

export function reviewsFor(productId) {
  return reviews.filter((r) => r.product === productId);
}

export const featuredReviews = ['r1', 'r4', 'r7', 'r10', 'r13'].map((id) => reviews.find((r) => r.id === id));
