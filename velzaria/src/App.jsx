import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { CartDrawer, QuickView, SearchOverlay, Toasts } from './components/Overlays.jsx';
import { useStore } from './context/StoreContext.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import DiscoverySet from './pages/DiscoverySet.jsx';
import Create from './pages/Create.jsx';
import Story from './pages/Story.jsx';
import Award from './pages/Award.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Account from './pages/Account.jsx';
import Login from './pages/Login.jsx';
import Wishlist from './pages/Wishlist.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import Gifting from './pages/Gifting.jsx';
import Refill from './pages/Refill.jsx';
import Info from './pages/Info.jsx';
import NotFound from './pages/NotFound.jsx';

const TITLES = {
  '/': 'VÉLZARIA — Every Woman, Her Own Essence',
  '/shop': 'Shop the Five Essences — VÉLZARIA',
  '/create': 'Create Your Perfume — VÉLZARIA',
  '/story': 'Our Story — VÉLZARIA',
  '/creators-award': 'The Creator’s Award — VÉLZARIA',
  '/cart': 'Your Bag — VÉLZARIA',
  '/checkout': 'Checkout — VÉLZARIA',
  '/account': 'My Account — VÉLZARIA',
  '/login': 'Sign In — VÉLZARIA',
  '/wishlist': 'Wishlist — VÉLZARIA',
  '/track': 'Track Your Order — VÉLZARIA',
  '/gifting': 'Luxury Gifting — VÉLZARIA',
  '/refill': 'Refill Programme — VÉLZARIA',
};

function RouteEffects() {
  const { pathname, hash } = useLocation();
  const { setCartOpen, setSearchOpen, setQuickView } = useStore();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  useEffect(() => {
    setCartOpen(false);
    setSearchOpen(false);
    setQuickView(null);
    if (TITLES[pathname]) document.title = TITLES[pathname];
    else if (pathname.startsWith('/order/')) document.title = 'Order Confirmation — VÉLZARIA';
    else if (!pathname.startsWith('/perfume/') && !pathname.startsWith('/info/') && pathname !== '/shop/discovery-set') document.title = 'Page not found — VÉLZARIA';
    if (pathname === '/shop/discovery-set') document.title = 'The Discovery Set — VÉLZARIA';
  }, [pathname, setCartOpen, setSearchOpen, setQuickView]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <RouteEffects />
      <Navbar />
      <main id="main" key={location.pathname} className="page-enter">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/discovery-set" element={<DiscoverySet />} />
          <Route path="/perfume/:slug" element={<Product />} />
          <Route path="/create" element={<Create />} />
          <Route path="/story" element={<Story />} />
          <Route path="/creators-award" element={<Award />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/gifting" element={<Gifting />} />
          <Route path="/refill" element={<Refill />} />
          <Route path="/info/:page" element={<Info />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <QuickView />
      <SearchOverlay />
      <Toasts />
    </>
  );
}
