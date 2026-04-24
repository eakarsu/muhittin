import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const REGIONS = [
  {
    name: 'Middle East & North Africa',
    corridors: 'UAE, Saudi Arabia, Qatar, Egypt',
    desc: 'The MENA region is undergoing rapid economic diversification. We help companies enter and grow across the Gulf, leveraging deep relationships with government entities, sovereign wealth funds, family offices, and enterprise buyers. From Vision 2030 initiatives to free zone strategies, we know the terrain.',
  },
  {
    name: 'Southeast Asia',
    corridors: 'Singapore, Indonesia, Vietnam, Philippines',
    desc: 'Southeast Asia offers one of the world\'s fastest-growing consumer and enterprise markets. We provide market entry support, regulatory guidance, and local partnership development across ASEAN, with particular strength in Singapore as a regional headquarters and gateway.',
  },
  {
    name: 'Europe',
    corridors: 'UK, Germany, France, Nordics',
    desc: 'Europe remains a critical market for technology, financial services, and industrial companies. We help organizations navigate complex regulatory environments, identify acquisition targets, and build European leadership teams that understand local market dynamics.',
  },
  {
    name: 'Sub-Saharan Africa',
    corridors: 'Nigeria, Kenya, South Africa',
    desc: 'Africa is home to some of the world\'s most exciting growth stories. We help companies tap into rapidly digitizing economies, navigate diverse regulatory landscapes, and connect with local investors and partners across the continent\'s most dynamic markets.',
  },
  {
    name: 'Americas',
    corridors: 'US, Mexico, Brazil, Colombia',
    desc: 'From established US markets to high-growth Latin American economies, we support companies expanding across the Americas. Our network spans venture capital, private equity, corporate development, and government innovation programs throughout the region.',
  },
];

export default function GlobalMarkets() {
  useSEO('Global Markets', 'Operating across high-growth corridors — Middle East, Southeast Asia, Europe, Africa, and the Americas.');
  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Global Markets</h1>
          <p className="pub-hero-subtitle">
            We operate across high-growth corridors, connecting opportunities between established and emerging markets.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {REGIONS.map((region, idx) => (
            <div key={region.name} className={`pub-region-block ${idx % 2 === 1 ? 'pub-section-alt-inline' : ''}`}>
              <h2 className="pub-region-title">{region.name}</h2>
              <p className="pub-region-corridors">Key markets: {region.corridors}</p>
              <p className="pub-body-text">{region.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Corridor Concept */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">The Global Corridor Concept</h2>
          <p className="pub-body-text">
            Multiverse is built around the concept of global corridors &mdash; the trade, investment, and talent
            flows that connect markets to each other. Rather than thinking about individual countries in isolation,
            we help clients position themselves along the corridors where capital, talent, and opportunity move.
          </p>
          <p className="pub-body-text">
            For example, the Gulf-to-Southeast Asia corridor is one of the world&rsquo;s most active investment
            routes, while the US-to-Europe corridor remains critical for technology and financial services expansion.
            By understanding these flows, we help our clients enter markets with existing momentum rather than
            building from scratch.
          </p>
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Expanding Into a New Market?</h2>
          <p className="pub-cta-text">
            Let us show you how our global corridor approach can accelerate your expansion.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
