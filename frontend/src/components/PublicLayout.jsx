import { useState, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SearchModal from './SearchModal';

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <div className="pub-layout">
      <a href="#main-content" className="pub-skip-link">Skip to main content</a>
      <header className="pub-header">
        <div className="pub-header-inner">
          <Link to="/" className="pub-logo">
            <img src="/logo-icon.jpeg" alt="Multiverse" className="pub-logo-icon" />
            <h1>Multiverse<span>Consulting Group</span></h1>
          </Link>
          <nav className={`pub-nav ${menuOpen ? 'pub-nav-open' : ''}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink>
            <NavLink to="/industries" onClick={() => setMenuOpen(false)}>Industries</NavLink>
            <NavLink to="/insights" onClick={() => setMenuOpen(false)}>Insights</NavLink>
            <NavLink to="/partnerships" onClick={() => setMenuOpen(false)}>Partnerships</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </nav>
          <button className="pub-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <Link to="/book-consultation" className="pub-header-cta">Book a Consultation</Link>
          <button
            className={`pub-mobile-toggle ${menuOpen ? 'pub-mobile-toggle-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      {menuOpen && <div className="pub-mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <main id="main-content" className="pub-main">
        {children}
      </main>
      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="pub-footer-col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/leadership">Leadership</Link>
            <Link to="/value-delivery-system">Value Delivery System</Link>
          </div>
          <div className="pub-footer-col">
            <h4>Services</h4>
            <Link to="/services/strategy-growth">Strategy Advisory</Link>
            <Link to="/services/global-expansion">Global Expansion</Link>
            <Link to="/services/talent-executive-search">Executive Search</Link>
            <Link to="/services/ai-transformation">AI Transformation</Link>
            <Link to="/services/investment-advisory">Investment Advisory</Link>
          </div>
          <div className="pub-footer-col">
            <h4>Resources</h4>
            <Link to="/insights">Insights</Link>
            <Link to="/partnerships">Partnerships</Link>
            <Link to="/global-markets">Global Markets</Link>
            <Link to="/join-talent-network">Join Talent Network</Link>
            <Link to="/submit-opportunity">Submit Opportunity</Link>
          </div>
          <div className="pub-footer-col">
            <h4>Contact</h4>
            <Link to="/contact">Contact MCG</Link>
            <Link to="/book-consultation">Book a Consultation</Link>
          </div>
        </div>
        <div className="pub-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Multiverse Consulting Group. All rights reserved.</p>
        </div>
      </footer>
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
