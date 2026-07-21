const { Pool } = require('pg');
const { getDatabaseConfig } = require('./config');

const pool = new Pool({
  connectionString: getDatabaseConfig().databaseUrl,
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. contacts
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        industry VARCHAR(100),
        region VARCHAR(100),
        lifecycle_stage VARCHAR(50) DEFAULT 'visitor',
        source VARCHAR(100),
        interest TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: contacts');

    // 2. companies
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        size VARCHAR(50),
        region VARCHAR(100),
        website VARCHAR(500),
        relationship_owner VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: companies');

    // 3. candidates
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        industry VARCHAR(100),
        experience_years INTEGER,
        region VARCHAR(100),
        role_level VARCHAR(50),
        compensation_min DECIMAL(12,2),
        compensation_max DECIMAL(12,2),
        skills TEXT,
        resume_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        availability VARCHAR(50) DEFAULT 'passive',
        status VARCHAR(50) DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: candidates');

    // 4. partners
    await client.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        type VARCHAR(50),
        region VARCHAR(100),
        industry VARCHAR(100),
        status VARCHAR(50) DEFAULT 'inquiry',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: partners');

    // 5. service_packages
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        domain VARCHAR(50),
        description TEXT,
        price DECIMAL(10,2),
        price_type VARCHAR(50) DEFAULT 'one-time',
        stripe_price_id VARCHAR(255),
        stripe_product_id VARCHAR(255),
        delivery_workflow TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: service_packages');

    // 6. deals
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        opportunity_type VARCHAR(50),
        service_line VARCHAR(100),
        value DECIMAL(12,2),
        stage VARCHAR(50) DEFAULT 'discovery',
        close_date DATE,
        region VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: deals');

    // 7. payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'USD',
        service VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_id VARCHAR(255),
        stripe_invoice_id VARCHAR(255),
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: payments');

    // 8. orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        service_package_id INTEGER REFERENCES service_packages(id) ON DELETE SET NULL,
        payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
        delivery_stage VARCHAR(50) DEFAULT 'kickoff',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: orders');

    // 9. consultations
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        service_interest VARCHAR(255),
        message TEXT,
        preferred_date DATE,
        preferred_time VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_id VARCHAR(255),
        calendly_event_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: consultations');

    // 10. insights
    await client.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        category VARCHAR(50),
        domain VARCHAR(50),
        summary TEXT,
        content TEXT,
        author VARCHAR(255),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: insights');

    // 11. opportunities
    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255),
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        opportunity_type VARCHAR(100),
        description TEXT,
        region VARCHAR(100),
        budget_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: opportunities');

    // 12. meetings
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'consultation',
        date DATE,
        time VARCHAR(50),
        duration_minutes INTEGER DEFAULT 60,
        location VARCHAR(255),
        attendees TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        calendly_event_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: meetings');

    // 13. onboarding_workflows
    await client.query(`
      CREATE TABLE IF NOT EXISTS onboarding_workflows (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
        service VARCHAR(255),
        status VARCHAR(50) DEFAULT 'initiated',
        payment_received BOOLEAN DEFAULT false,
        welcome_email_sent BOOLEAN DEFAULT false,
        kickoff_scheduled BOOLEAN DEFAULT false,
        kickoff_date DATE,
        internal_project_created BOOLEAN DEFAULT false,
        project_notes TEXT,
        milestone_1 VARCHAR(255),
        milestone_1_done BOOLEAN DEFAULT false,
        milestone_2 VARCHAR(255),
        milestone_2_done BOOLEAN DEFAULT false,
        milestone_3 VARCHAR(255),
        milestone_3_done BOOLEAN DEFAULT false,
        milestone_4 VARCHAR(255),
        milestone_4_done BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: onboarding_workflows');

    // 14. case_studies
    await client.query(`
      CREATE TABLE IF NOT EXISTS case_studies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        industry VARCHAR(100),
        challenge TEXT,
        approach TEXT,
        result TEXT,
        impact TEXT,
        metrics JSONB,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: case_studies');

    // 15. industries
    await client.query(`
      CREATE TABLE IF NOT EXISTS industries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        challenges TEXT,
        approach TEXT,
        solutions TEXT,
        related_services JSONB,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table created: industries');

    await client.query('COMMIT');
    console.log('\nAll 15 tables created successfully.\n');

    if (process.env.SEED_CONSULTING_DEMO !== 'true') {
      console.log('Consulting demo data was not requested; schema-only migration complete.');
      return;
    }

    // -------------------------------------------------------
    // SEED DATA
    // -------------------------------------------------------

    await client.query('BEGIN');

    // --- Service Packages ---
    const pkgResult = await client.query(`
      INSERT INTO service_packages (name, slug, domain, price, price_type, description, delivery_workflow)
      VALUES
        (
          'Strategy Diagnostic Package',
          'strategy-diagnostic',
          'strategy',
          5000.00,
          'one-time',
          'Comprehensive strategy assessment including market positioning analysis, competitive landscape review, growth opportunity identification, and actionable roadmap development.',
          'Discovery session → Data collection → Analysis → Report delivery → Strategy presentation'
        ),
        (
          'Market Entry Package',
          'market-entry',
          'expansion',
          15000.00,
          'one-time',
          'End-to-end market entry strategy covering market research, regulatory analysis, partner identification, go-to-market planning, and execution support for new geographic markets.',
          'Market assessment → Regulatory review → Partner mapping → GTM strategy → Launch support'
        ),
        (
          'Executive Search Package',
          'executive-search',
          'talent',
          25000.00,
          'one-time',
          'Full-cycle executive search including role definition, candidate sourcing, screening, interview coordination, offer negotiation, and onboarding support.',
          'Intake → Role definition → Search → Screening → Interviews → Offer → Placement → Follow-up'
        ),
        (
          'AI Readiness Assessment',
          'ai-readiness',
          'ai',
          8500.00,
          'one-time',
          'Holistic AI transformation assessment covering current capabilities, opportunity identification, implementation roadmap, vendor evaluation, and change management planning.',
          'Current state audit → Opportunity mapping → Tool evaluation → Roadmap development → Implementation plan'
        )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `);
    console.log(`Seeded ${pkgResult.rowCount} service packages`);

    // --- Insights ---
    const insightResult = await client.query(`
      INSERT INTO insights (title, slug, category, domain, author, published, published_at, summary, content)
      VALUES
        (
          'The Five Pillars of Successful Global Expansion',
          'five-pillars-global-expansion',
          'guide',
          'expansion',
          'Multiverse Consulting',
          true,
          NOW(),
          'A comprehensive guide to navigating international markets, from regulatory compliance to cultural adaptation.',
          E'Global expansion remains one of the most powerful growth levers available to ambitious organizations, yet the failure rate for international market entries continues to hover around 50%. Through our work advising firms across the Middle East, Southeast Asia, and Europe, we have identified five pillars that consistently separate successful expansions from costly retreats: regulatory preparedness, cultural intelligence, operational localization, talent strategy, and partnership architecture.\n\nRegulatory preparedness goes far beyond simple legal compliance. It requires a deep understanding of how local regulatory environments evolve and how policy shifts can create or destroy market opportunities overnight. Companies that treat regulatory analysis as a one-time checkbox exercise frequently find themselves blindsided by licensing requirements, data residency laws, or sector-specific restrictions that derail their timelines and budgets.\n\nCultural intelligence is equally critical and often underestimated by organizations with strong domestic track records. What works in one market rarely translates directly to another. Pricing psychology, decision-making hierarchies, negotiation cadences, and even the role of personal relationships in business development vary dramatically across regions. Firms that invest in genuine cultural understanding — not superficial localization — build trust faster and achieve product-market fit more efficiently.\n\nFinally, partnership architecture ties all the pillars together. The right local partners can accelerate regulatory navigation, provide cultural context, share operational infrastructure, and open doors to talent pools. However, partnerships must be structured with clear governance, aligned incentives, and realistic expectations. The most successful global expansions we have seen treat partner selection with the same rigor as executive hiring — because in many markets, your partners are your brand.'
        ),
        (
          'AI Transformation: Beyond the Hype',
          'ai-transformation-beyond-hype',
          'insight',
          'ai',
          'Multiverse Consulting',
          true,
          NOW(),
          'How forward-thinking organizations are implementing AI for measurable business value, not just innovation theater.',
          E'The gap between AI ambition and AI impact continues to widen across industries. While boardrooms are filled with enthusiasm about artificial intelligence, the reality on the ground is often far more sobering. Our research across over 100 mid-market and enterprise organizations reveals that fewer than 20% have moved beyond pilot programs to achieve measurable business value from their AI investments. The difference between leaders and laggards is not budget or technology — it is strategic clarity.\n\nOrganizations that successfully deploy AI start not with the technology, but with the business problem. They identify specific operational bottlenecks, revenue opportunities, or customer experience gaps where AI can deliver quantifiable improvements. This problem-first approach naturally narrows the solution space and prevents the common trap of deploying sophisticated models against problems that could be solved with simpler automation or process redesign.\n\nChange management is the invisible infrastructure of successful AI transformation. Even the most technically elegant AI solution will fail if the people who need to use it do not trust it, understand it, or have incentives to adopt it. Leading organizations invest as much in training, communication, and workflow redesign as they do in data engineering and model development. They create feedback loops where frontline users can flag issues and suggest improvements, turning potential resistance into a source of competitive advantage.\n\nPerhaps most importantly, AI leaders think in portfolios rather than projects. They balance quick wins — such as automating document processing or enhancing customer segmentation — with longer-term bets on capabilities like predictive analytics or generative AI for product development. This portfolio approach generates early returns that fund more ambitious initiatives and builds organizational confidence in AI as a strategic tool rather than a science experiment.'
        ),
        (
          'Executive Talent in Emerging Markets: Trends for 2026',
          'executive-talent-emerging-markets-2026',
          'report',
          'talent',
          'Multiverse Consulting',
          true,
          NOW(),
          'Key trends shaping the executive talent landscape across emerging markets.',
          E'The executive talent landscape in emerging markets is undergoing a fundamental transformation driven by three converging forces: the maturation of local talent pools, the rise of remote-first leadership models, and shifting compensation expectations shaped by global transparency. Organizations seeking leadership talent in regions like the Gulf Cooperation Council states, Southeast Asia, and Sub-Saharan Africa must adapt their recruitment strategies accordingly or risk losing top candidates to more agile competitors.\n\nLocal talent pools have deepened considerably over the past decade. A generation of executives who gained experience at multinational corporations has returned to their home markets, bringing global best practices and extensive networks. These leaders are increasingly preferred over expatriate hires because they combine international sophistication with deep local knowledge. For executive search firms, this means expanding sourcing methodologies beyond traditional expat networks and building genuine relationships within local business communities.\n\nCompensation structures are evolving rapidly as salary transparency increases globally. Candidates in emerging markets are benchmarking their expectations not only against local peers but against global standards, particularly for roles that can be performed remotely. Organizations that cling to legacy compensation frameworks based on cost-of-living adjustments will struggle to attract and retain top-tier executives. Instead, forward-thinking firms are adopting value-based compensation models that reflect the strategic impact of the role rather than the geographic location of the office.\n\nThe most significant trend we observe is the growing importance of purpose and impact in executive decision-making. Senior leaders in emerging markets are increasingly drawn to organizations with clear social impact narratives — whether in sustainability, financial inclusion, healthcare access, or education. Companies that can articulate a compelling vision beyond shareholder returns have a measurable advantage in attracting executives who have the luxury of choice.'
        ),
        (
          'Investment Advisory: Structuring Cross-Border Deals',
          'structuring-cross-border-deals',
          'article',
          'investment',
          'Multiverse Consulting',
          true,
          NOW(),
          'Best practices for structuring investment deals across multiple jurisdictions.',
          E'Cross-border deal structuring is as much an art as it is a science. While the fundamental principles of valuation, due diligence, and risk allocation remain consistent, the complexity multiplies with each jurisdiction involved. Tax treaties, foreign ownership restrictions, currency controls, and varying corporate governance standards create a web of considerations that can make or break an investment thesis. The firms that consistently close successful cross-border deals are those that integrate legal, tax, and regulatory expertise from the earliest stages of deal origination.\n\nHolding company structures remain the backbone of most cross-border investments, but the optimal jurisdiction and entity type depend heavily on the specific deal parameters. Factors such as the investor''s home jurisdiction, the target''s operating markets, anticipated exit timeline, and dividend repatriation requirements all influence whether a Singapore holding company, a Dutch BV, a UAE free zone entity, or a more traditional structure is appropriate. Cookie-cutter approaches invariably leave value on the table or create unnecessary risk.\n\nDue diligence in cross-border contexts must go beyond financial and legal review to encompass political risk, regulatory trajectory, and cultural factors that affect post-acquisition integration. We have seen deals that looked excellent on paper fall apart during integration because the acquirer underestimated the complexity of aligning management practices, reporting cadences, and decision-making cultures across borders. The most sophisticated investors budget for integration advisory from the outset and view it as a core component of deal value, not an afterthought.\n\nCurrency risk management deserves particular attention in the current environment. With central banks across developed and emerging markets pursuing divergent monetary policies, exchange rate volatility can erode returns on otherwise sound investments. Effective hedging strategies should be incorporated into deal models from the term sheet stage, and investors should stress-test their return assumptions against multiple currency scenarios rather than relying on spot rate projections.'
        ),
        (
          'Building a Resilient Growth Strategy in Uncertain Times',
          'resilient-growth-strategy',
          'insight',
          'strategy',
          'Multiverse Consulting',
          true,
          NOW(),
          'How boutique firms can build adaptive growth strategies that withstand market volatility.',
          E'Market uncertainty has become the default operating condition rather than the exception. Geopolitical tensions, supply chain fragility, regulatory shifts, and technological disruption create an environment where traditional three-to-five-year strategic plans are obsolete before the ink dries. For boutique and mid-market firms that lack the buffers of large corporations, resilient growth strategy is not a luxury — it is a survival imperative. The firms that thrive in uncertainty share a common trait: they plan for adaptability rather than prediction.\n\nResilient growth strategies are built on three foundations: diversified revenue architecture, modular operating models, and real-time intelligence systems. Revenue diversification does not mean chasing every opportunity — it means deliberately constructing a portfolio of revenue streams with different risk profiles, customer segments, and geographic exposures. A consulting firm that derives 80% of its revenue from a single client or sector is not growing — it is gambling. Intentional diversification creates natural hedges that allow firms to absorb shocks in any single market without existential consequences.\n\nModular operating models allow firms to scale resources up or down without the friction and cost of traditional fixed-cost structures. This means investing in a core team of exceptional generalists supplemented by a curated network of specialist partners who can be activated for specific engagements. Technology platforms that support flexible team configuration, project management, and client delivery are essential enablers. The goal is an organization that can pivot from a large-scale implementation engagement to a focused advisory sprint without restructuring.\n\nReal-time intelligence systems close the loop between strategy and execution. Firms that rely on quarterly reviews and annual planning cycles are always operating on stale information. Resilient organizations build dashboards and feedback mechanisms that surface leading indicators — pipeline velocity, client satisfaction trends, competitive moves, and macroeconomic signals — and empower team members at every level to respond. The best growth strategies we have helped build are living documents that evolve weekly, not dusty slide decks that gather cobwebs between board meetings.'
        )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `);
    console.log(`Seeded ${insightResult.rowCount} insights`);

    // --- Contacts ---
    const contactResult = await client.query(`
      INSERT INTO contacts (name, email, phone, company, industry, region, lifecycle_stage, source, interest)
      VALUES
        (
          'Fatima Al-Rashid',
          'fatima.alrashid@gulfventures.ae',
          '+971-50-123-4567',
          'Gulf Ventures Capital',
          'Financial Services',
          'Middle East',
          'qualified',
          'Website inquiry',
          'Market entry strategy for Southeast Asian expansion'
        ),
        (
          'Tan Wei Ming',
          'weiming.tan@asiabridge.sg',
          '+65-9123-4567',
          'AsiaBridge Holdings',
          'Technology',
          'Southeast Asia',
          'client',
          'Referral',
          'Executive search for regional CTO and VP Engineering roles'
        ),
        (
          'Lars Henriksen',
          'lars.henriksen@nordicgrowth.eu',
          '+47-912-34-567',
          'Nordic Growth Partners',
          'Private Equity',
          'Europe',
          'lead',
          'LinkedIn',
          'AI readiness assessment for portfolio companies'
        )
      RETURNING id;
    `);
    const contactIds = contactResult.rows.map(r => r.id);
    console.log(`Seeded ${contactResult.rowCount} contacts`);

    // --- Companies ---
    const companyResult = await client.query(`
      INSERT INTO companies (name, industry, size, region, website, relationship_owner, notes)
      VALUES
        (
          'Gulf Ventures Capital',
          'Financial Services',
          '50-200',
          'Middle East',
          'https://gulfventurescapital.ae',
          'Managing Partner',
          'Abu Dhabi-based investment firm focused on technology and fintech. Active in GCC and exploring Southeast Asia.'
        ),
        (
          'AsiaBridge Holdings',
          'Technology',
          '200-500',
          'Southeast Asia',
          'https://asiabridgeholdings.sg',
          'CEO',
          'Singapore-headquartered technology conglomerate with operations across ASEAN. Growing rapidly through M&A.'
        )
      RETURNING id;
    `);
    const companyIds = companyResult.rows.map(r => r.id);
    console.log(`Seeded ${companyResult.rowCount} companies`);

    // --- Deals ---
    const dealResult = await client.query(`
      INSERT INTO deals (contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes)
      VALUES
        (
          ${contactIds[0]},
          ${companyIds[0]},
          'consulting',
          'Market Expansion',
          75000.00,
          'proposal',
          '2026-05-15',
          'Middle East',
          'Gulf Ventures exploring Southeast Asian market entry. Scope includes market research, regulatory analysis, and partner identification across Singapore, Indonesia, and Vietnam.'
        ),
        (
          ${contactIds[1]},
          ${companyIds[1]},
          'search',
          'Executive Search',
          150000.00,
          'negotiation',
          '2026-04-30',
          'Southeast Asia',
          'Retained search for regional CTO and two VP Engineering roles. AsiaBridge expanding engineering leadership for AI product division.'
        )
      RETURNING id;
    `);
    console.log(`Seeded ${dealResult.rowCount} deals`);

    await client.query('COMMIT');

    console.log('\n--- Migration Summary ---');
    console.log('Tables created: 15 (contacts, companies, candidates, partners, service_packages, deals, payments, orders, consultations, insights, opportunities, meetings, onboarding_workflows, case_studies, industries)');
    console.log('Service packages seeded: 4');
    console.log('Insights seeded: 5');
    console.log('Contacts seeded: 3');
    console.log('Companies seeded: 2');
    console.log('Deals seeded: 2');
    console.log('\nConsulting migration completed successfully.');

  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch((error) => {
    console.error(`Consulting migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { migrate };
