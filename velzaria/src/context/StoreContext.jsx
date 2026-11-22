import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { auth, deviceOwner } from '../services/api.js';
import { ENGRAVING_PRICE, GIFT_WRAP_PRICE } from '../data/products.js';

const StoreContext = createContext(null);

const CART_KEY = 'vz_cart_v1';
const WISH_KEY = 'vz_wishlist_v1';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function lineUnitPrice(line) {
  let p = line.basePrice;
  if (line.options?.engraving) p += ENGRAVING_PRICE;
  if (line.options?.giftWrap) p += GIFT_WRAP_PRICE;
  return p;
}

function lineKey(line) {
  return [line.type, line.productId, line.size, JSON.stringify(line.options || {}), line.creation?.id || ''].join('|');
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load(CART_KEY, { lines: [], discount: null }));
  const [wishlist, setWishlist] = useState(() => load(WISH_KEY, []));
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable — cart still works for this visit */
    }
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  useEffect(() => {
    auth.me().then((u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  // Keep the cart in sync across tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY && e.newValue) setCart(JSON.parse(e.newValue));
      if (e.key === WISH_KEY && e.newValue) setWishlist(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toast = useCallback((message, opts = {}) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 3800);
  }, []);

  const addToCart = useCallback((line, { open = true } = {}) => {
    const key = lineKey(line);
    setCart((c) => {
      const existing = c.lines.find((l) => l.key === key);
      const lines = existing
        ? c.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + (line.qty || 1)) } : l))
        : [...c.lines, { ...line, key, qty: line.qty || 1, addedAt: Date.now() }];
      return { ...c, lines };
    });
    if (open) setCartOpen(true);
  }, []);

  const updateQty = useCallback((key, qty) => {
    setCart((c) => ({ ...c, lines: c.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)) }));
  }, []);

  const removeLine = useCallback((key) => {
    setCart((c) => {
      const lines = c.lines.filter((l) => l.key !== key);
      return { lines, discount: lines.length ? c.discount : null };
    });
  }, []);

  const clearCart = useCallback(() => setCart({ lines: [], discount: null }), []);
  const setDiscount = useCallback((discount) => setCart((c) => ({ ...c, discount })), []);

  const toggleWishlist = useCallback(
    (id) => {
      setWishlist((w) => {
        const has = w.includes(id);
        toast(has ? 'Removed from your wishlist' : 'Saved to your wishlist', has ? {} : { link: '/wishlist', linkLabel: 'View wishlist' });
        return has ? w.filter((x) => x !== id) : [...w, id];
      });
    },
    [toast]
  );

  const subtotal = cart.lines.reduce((a, l) => a + lineUnitPrice(l) * l.qty, 0);
  const count = cart.lines.reduce((a, l) => a + l.qty, 0);
  // Recalculate percentage codes when the cart changes.
  const discountAmount = cart.discount && !(cart.discount.min && subtotal < cart.discount.min)
    ? Math.min(subtotal, cart.discount.percent ? Math.round((subtotal * cart.discount.percent) / 100) : cart.discount.amount)
    : 0;

  const value = useMemo(
    () => ({
      cart,
      subtotal,
      count,
      discountAmount,
      addToCart,
      updateQty,
      removeLine,
      clearCart,
      setDiscount,
      wishlist,
      toggleWishlist,
      user,
      setUser,
      authReady,
      ownerId: user ? user.id : deviceOwner(),
      toasts,
      toast,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      quickView,
      setQuickView,
    }),
    [cart, subtotal, count, discountAmount, addToCart, updateQty, removeLine, clearCart, setDiscount, wishlist, toggleWishlist, user, authReady, toasts, toast, cartOpen, searchOpen, quickView]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
