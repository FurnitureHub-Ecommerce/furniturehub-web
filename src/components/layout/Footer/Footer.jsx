import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      {/* Top Newsletter Section */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div className="footer__newsletter-content">
            <span className="footer__newsletter-tag">LUMORA Atelier Journal</span>
            <h3 className="footer__newsletter-title">Subscribe to Private Previews & Design Notes</h3>
            <p className="footer__newsletter-desc">
              Receive seasonal lookbooks, trade invitations, and exclusive early access to limited edition artisan pieces.
            </p>
          </div>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="footer__input-wrap">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                aria-label="Email address for journal subscription"
              />
              <button type="submit" aria-label="Subscribe to journal">
                <span>Subscribe</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <span className="footer__disclaimer">
              By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
            </span>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer__main">
        <div className="container footer__main-grid">
          {/* Brand Info */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-name">LUMORA</span>
              <span className="footer__logo-sub">STUDIO</span>
            </Link>
            <p className="footer__brand-desc">
              Modern luxury furniture crafted with architectural intent, organic wood textures, and refined minimalism. Engineered for quiet permanence.
            </p>
            <div className="footer__socials">
              <a href="#instagram" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#pinterest" aria-label="Pinterest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.14 2.5 7.69 6.06 9.21-.08-.78-.16-1.98.03-2.83.18-.77 1.16-4.92 1.16-4.92s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.34 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.07.31-.24 .98-.27 1.12-.05.21-.17.26-.39.16-1.45-.67-2.36-2.77-2.36-4.46 0-3.63 2.64-6.97 7.61-6.97 3.99 0 7.1 2.85 7.1 6.66 0 3.97-2.51 7.16-5.99 7.16-1.17 0-2.27-.61-2.65-1.33l-.72 2.74c-.26.99-.96 2.23-1.43 2.99C9.77 21.84 10.86 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path>
                </svg>
              </a>
              <a href="#facebook" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Collections */}
          <div className="footer__col">
            <h4 className="footer__heading">Collections</h4>
            <ul className="footer__list">
              <li><Link to="/category/living-room">Wabi-Sabi Living</Link></li>
              <li><Link to="/category/dining-room">Solace Dining</Link></li>
              <li><Link to="/category/bedroom">Nordic Sanctuary</Link></li>
              <li><Link to="/category/studio-office">Architectural Studio</Link></li>
              <li><Link to="/category/lighting-decor">Luminaires & Decor</Link></li>
            </ul>
          </div>

          {/* Column 2: Client Care */}
          <div className="footer__col">
            <h4 className="footer__heading">Client Care</h4>
            <ul className="footer__list">
              <li><a href="#concierge">White-Glove Concierge</a></li>
              <li><a href="#custom">Custom Fabric Swatches</a></li>
              <li><a href="#warranty">10-Year Warranty Details</a></li>
              <li><a href="#shipping">Shipping & Carbon Offsets</a></li>
              <li><a href="#trade">Trade Program Application</a></li>
            </ul>
          </div>

          {/* Column 3: Showrooms */}
          <div className="footer__col">
            <h4 className="footer__heading">Atelier Flagships</h4>
            <div className="footer__address">
              <p><strong>Kyoto Studio:</strong> Gion District, Higashiyama, Kyoto 605-0074</p>
              <p><strong>New York Flagship:</strong> 452 Broome St, SoHo, NY 10013</p>
              <p><strong>Copenhagen:</strong> Store Kongensgade 48, 1264 København</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} LUMORA Studio Inc. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Craft</a>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
