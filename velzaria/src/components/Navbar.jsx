import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { Logo } from './ui.jsx';
import { IconBag, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from './Icons.jsx';
import { cls } from '../lib/format.js';

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/create', label: 'Create Your Perfume' },
  { to: '/story', label: 'Our Story' },
  { to: '/creators-award', label: 'Creator’s Award' },
];

export default function Navbar() {
  const { count, wishlist, setCartOpen, setSearchOpen, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  return (
    <>
      <div className="announce">
        <p>
          Complimentary shipping across Egypt on orders over EGP 5,000 <span className="announce__dot">·</span>{' '}
          <Link to="/shop/discovery-set">Explore the Discovery Set</Link>
        </p>
      </div>
      <header className={cls('nav', scrolled && 'is-scrolled')}>
        <div className="nav__top container">
          <div className="nav__left">
            <button className="icon-btn nav__burger" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
              <IconMenu />
            </button>
            <button className="nav__search" onClick={() => setSearchOpen(true)} aria-label="Search perfumes and notes">
              <IconSearch />
              <span>Search</span>
            </button>
          </div>
          <Logo className="nav__logo" />
          <div className="nav__right">
            <Link to={user ? '/account' : '/login'} className="nav__account" aria-label="My account">
              <IconUser />
              <span>{user ? user.firstName : 'My Account'}</span>
            </Link>
            <button className="icon-btn nav__search-mobile" onClick={() => setSearchOpen(true)} aria-label="Search">
              <IconSearch />
            </button>
            <Link to="/wishlist" className="icon-btn nav__wish" aria-label={`Wishlist, ${wishlist.length} items`}>
              <IconHeart />
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${count} items`}>
              <IconBag />
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          </div>
        </div>
        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cls('nav__link', isActive && 'is-active')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className={cls('menu', menuOpen && 'is-open')} aria-hidden={!menuOpen}>
        <div className="menu__backdrop" onClick={() => setMenuOpen(false)} />
        <aside className="menu__panel" aria-label="Menu">
          <div className="menu__head">
            <Logo />
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <IconClose />
            </button>
          </div>
          <nav className="menu__links">
            {NAV_LINKS.map((l, i) => (
              <NavLink key={l.to} to={l.to} end={l.end} style={{ '--i': i }}>
                <span className="numeral">0{i + 1}</span> {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="menu__foot">
            <Link to={user ? '/account' : '/login'}>My Account</Link>
            <Link to="/wishlist">Wishlist ({wishlist.length})</Link>
            <Link to="/track">Track an order</Link>
            <Link to="/shop/discovery-set">Discovery Set</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
