import { Link } from 'react-router-dom';
import { Logo } from './ui.jsx';
import NewsletterForm from './NewsletterForm.jsx';
import { IconFacebook, IconInstagram, IconPinterest, IconTiktok } from './Icons.jsx';
import { MODE } from '../services/api.js';

// Replace with the brand's real social profiles before launch.
const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: IconInstagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/', Icon: IconTiktok },
  { label: 'Pinterest', href: 'https://www.pinterest.com/', Icon: IconPinterest },
  { label: 'Facebook', href: 'https://www.facebook.com/', Icon: IconFacebook },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Logo />
          <p className="footer__statement">Every Woman, Her Own Essence.</p>
          <p className="small muted">
            VÉLZARIA is a perfume house celebrating the many expressions of femininity — five signature essences and a bespoke atelier where every woman can
            compose her own.
          </p>
          <div className="footer__social">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`VÉLZARIA on ${label}`} className="icon-btn">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="footer__cols">
          <div>
            <h4 className="eyebrow">The House</h4>
            <ul>
              <li><Link to="/shop">Shop all essences</Link></li>
              <li><Link to="/shop/discovery-set">Discovery Set</Link></li>
              <li><Link to="/create">Create Your Perfume</Link></li>
              <li><Link to="/creators-award">Creator’s Award</Link></li>
              <li><Link to="/story">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">Services</h4>
            <ul>
              <li><Link to="/gifting">Luxury Gifting</Link></li>
              <li><Link to="/refill">Refill Programme</Link></li>
              <li><Link to="/track">Track your order</Link></li>
              <li><Link to="/account">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">Customer Care</h4>
            <ul>
              <li><Link to="/info/support">Customer Support</Link></li>
              <li><Link to="/info/shipping-returns">Shipping & Returns</Link></li>
              <li><Link to="/info/privacy">Privacy Policy</Link></li>
              <li><Link to="/info/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__news">
          <h4 className="eyebrow">The VÉLZARIA Letter</h4>
          <p className="small muted">New collections, exclusive releases and stories from the atelier.</p>
          <NewsletterForm compact />
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} VÉLZARIA. All rights reserved.</span>
        <span>Cairo · Made with care for every essence</span>
        {MODE === 'prototype' && <span className="footer__proto">Prototype build — no live payments or orders</span>}
      </div>
    </footer>
  );
}
