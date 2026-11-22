# VÉLZARIA — Luxury Perfume E‑commerce (Frontend Prototype)

*Five Essences. Infinite Personalities.*

A React + React Router storefront for VÉLZARIA: the five signature essences, a 7‑step
"Create Your Perfume" atelier, the Creator's Award, cart, checkout, accounts and tracking.

> **Status: clearly identified frontend prototype.** No backend is connected yet, so
> data is stored in the browser (localStorage) and **no payment is ever processed**.
> Every integration point is isolated in `src/services/` and switches to a real API
> when `VITE_API_URL` is set.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Prototype discount codes: `ESSENCE10` (10%), `DISCOVERY` (EGP 1,250 off orders over EGP 4,000).

## Structure

```
src/
  data/        products.js (catalogue, prices, sizes), quiz.js (questions + weights), reviews.js
  lib/         recommend.js (quiz scoring engine), format.js (money, shipping zones)
  services/    api.js (auth, orders, creations, award, newsletter, discounts), payments.js
  context/     StoreContext.jsx (cart, wishlist, session, toasts, overlays)
  components/  Navbar, Footer, ProductCard, Overlays (cart drawer, quick view, search, toasts),
               ui.jsx (Photo, ProductPhoto, Frame, Reveal, Stars, Quantity…), Bottle.jsx (SVG
               fallback only — used if a perfume has no photograph)
  pages/       Home, Shop, Product, DiscoverySet, Create, Award, Story, Cart, Checkout,
               OrderConfirmation, Account, Login, Wishlist, TrackOrder, Gifting, Refill, Info, NotFound
  styles/      global.css (tokens), components.css, pages.css, create.css, commerce.css,
               refine.css (palette, type scale, photo frames, spacing — loaded last)
  dev/         demo.js (sample data for reviewing screens; dev server only)
```

### Reviewing every screen quickly (dev only)

Add `?demo=` to a URL on the dev server to pre-fill sample data:
`/create?demo=quiz5` (result), `quiz6` (personalise), `quiz7` (final step), `/cart?demo=cart`,
`/account?demo=account` (signed in, with an order and a creation). This never runs in a production build.

## Design system

| Token | Colour | Use |
|---|---|---|
| Warm Ivory | `#F7F3ED` | Main background |
| Deep Espresso | `#302521` | Headings, buttons, footer, dark chapters |
| Rich Burgundy | `#6B2638` | Selected states, key accents, small labels, button hover |
| Champagne Gold | `#B69A72` | Fine rules, labels on dark backgrounds |
| Warm Taupe | `#8B7B70` | Borders and large secondary text |

Small secondary text uses `#6E6056` (taupe deepened to pass WCAG AA on ivory). Headings are
Cormorant Garamond, body text Manrope (minimum 11.5 px for labels, 14 px for small text).

## Photography

All product imagery comes from the collection image
`public/images/campaign/velzaria-collection-original.webp` (1536 × 1024).
`scripts/make-product-images.py` cuts it into crops that **always show complete bottles** (the
script refuses to write a crop that would cut a bottle, the baked-in logo or the name labels), and
writes their exact sizes to `src/data/images.js`. The site always displays images at their natural
ratio — nothing is cropped by CSS or stretched.

| File | Used for |
|---|---|
| `campaign/hero.webp` | Home hero · Story “five silhouettes” · Discovery Set · Sovereign “with her sisters” |
| `products/<id>-bottle.webp` (4:5 packshot) | Shop, best sellers, related, quick view, cart, checkout, quiz |
| `products/<id>-tight.webp` (natural, tall) | Home “Five essences” row · gallery “In its setting” · Story · Refill |
| `editorial/duo-romantic-conqueror.webp` | Gifting · Romantic gallery |
| `editorial/duo-conqueror-artist.webp` | Creator’s Award · Conqueror gallery |
| `editorial/duo-artist-spark.webp` | Home philosophy · Sign-in · Artist gallery |
| `editorial/trio-romantic-conqueror-artist.webp` | Create Your Perfume intro |
| `editorial/trio-conqueror-artist-spark.webp` | Home Discovery section · Spark gallery |

(all under `public/images/`; `<id>` is `sovereign`, `romantic`, `conqueror`, `artist` or `spark`)

No image file is repeated within a page. Product packshots repeat across pages by design (the same
product looks the same everywhere), as in any e-commerce site.

**To upgrade to studio photography:** save real photos over these files with the same names and
update their sizes in `src/data/images.js` (packshots ideally ≥ 1600 × 2000 px, 4:5). To regenerate the
crops from a higher-resolution version of the same campaign image: `python scripts/make-product-images.py`
(requires Python with Pillow and NumPy).

A customer's bespoke bottle is shown as the photograph of the silhouette it is based on, with the
engraving overlaid and the chosen glass and cap listed as swatches.

## Before launch — content to supply or confirm

| What | Where |
|---|---|
| **Higher‑resolution / studio photography** — the current crops come from a 1536 px image, so each bottle is only ~300 px wide in the source and looks soft on large or retina screens | See *Photography* above |
| Ingredient photography for quiz cards | Add `image: '/images/notes/rose.jpg'` to any note in `src/data/quiz.js` |
| **Customer reviews** — current ones are SAMPLE content | `src/data/reviews.js` → replace with verified reviews from the backend |
| Prices, sizes, refill prices | `src/data/products.js` |
| Shipping zones & fees, free‑shipping threshold | `src/lib/format.js` (`SHIPPING`) |
| Contact email & hours | `src/pages/Info.jsx` (`CONTACT`) |
| Social links | `src/components/Footer.jsx` (`SOCIAL`) |
| Award dates | `src/pages/Award.jsx` (`AWARD`) |
| Privacy Policy & Terms (drafts) | `src/pages/Info.jsx` — have them reviewed against Egypt's PDPL (Law 151/2020) |

## Backend integration (set `VITE_API_URL`)

All calls send cookies (`credentials: 'include'`) and expect JSON.

| Method & path | Used by | Returns |
|---|---|---|
| `GET /auth/me` · `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` | Login, Account | `{ user }` |
| `PATCH /users/me` · `POST /users/me/password` | Account settings, checkout "save details" | `{ user }` |
| `POST /orders` · `GET /orders` · `GET /orders/:id` · `POST /orders/track` `{number,email}` | Checkout, Account, Tracking | `{ order }` / `{ orders }` |
| `POST /discounts/validate` `{code, subtotal}` | Cart, Checkout | `{ code, label, amount, percent?, min? }` |
| `GET/POST /creations` · `GET/DELETE /creations/:id` | Create, Account, Award | `{ creation(s) }` |
| `POST /award/submissions` · `GET /award/submissions` | Creator's Award | `{ submission(s) }` (with `reference`) |
| `POST /newsletter` `{email}` | Home, Footer | `{ already }` |
| `POST /payments/intention` `{orderId, method}` | Checkout | `{ redirectUrl }` or `{ fawryReference }` |

Suggested data model: `users`, `products` (+ `sizes`), `orders` (+ `order_items`, status history),
`creations`, `award_submissions` (+ images in object storage), `subscribers`, `reviews` (moderated).
Review and support forms currently store locally and are marked `Integration point` in code.

### Payments (Egypt)

`src/services/payments.js` is prepared for **Paymob** (cards incl. Meeza, mobile wallets) and
**Fawry**, plus cash on delivery. The frontend never collects card data. The backend should:
create the order, create a Paymob payment intention with the secret key (server‑side only),
return the hosted checkout URL, and mark the order paid **only** from the HMAC‑verified webhook.
In prototype mode, non‑COD orders are recorded as "payment not processed".

## Notes

- The quiz recommendation is deterministic: every answer carries explicit weights
  (`src/data/quiz.js`), scored in `src/lib/recommend.js`. Results are labelled as concepts that a
  perfumer must develop — nothing claims to be a tested formula.
- Prototype accounts hash passwords in the browser but are **not secure** — real auth must be server‑side.
- Respects `prefers-reduced-motion`; tested for no horizontal scroll at 375 px.
