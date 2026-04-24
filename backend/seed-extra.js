const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'erolakarsu',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'muhittin_platform'
});

async function seedExtra() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // -------------------------------------------------------
    // INSIGHTS (add 12 more to reach 17 total)
    // -------------------------------------------------------
    const insightResult = await client.query(`
      INSERT INTO insights (title, slug, category, domain, author, published, published_at, summary, content)
      VALUES
        ('Navigating Regulatory Landscapes in the GCC', 'navigating-regulatory-gcc', 'guide', 'expansion', 'Multiverse Consulting', true, NOW() - INTERVAL '30 days', 'An overview of regulatory frameworks across GCC nations and how firms can stay compliant while scaling.', 'Detailed content about GCC regulatory landscapes, free zone structures, licensing requirements, and compliance strategies for foreign businesses entering the Gulf market.'),
        ('The Rise of Fractional C-Suite Leadership', 'fractional-csuite-leadership', 'insight', 'talent', 'Multiverse Consulting', true, NOW() - INTERVAL '25 days', 'Why more companies are turning to fractional executives for strategic leadership without full-time overhead.', 'An exploration of the fractional executive model, its benefits for mid-market companies, compensation structures, and best practices for integrating part-time senior leaders.'),
        ('Digital Due Diligence: A Modern M&A Imperative', 'digital-due-diligence-ma', 'article', 'investment', 'Multiverse Consulting', true, NOW() - INTERVAL '22 days', 'How digital due diligence has become essential in evaluating acquisition targets in the technology era.', 'Content covering technology stack assessments, cybersecurity audits, data asset valuation, and digital capability scoring as part of modern M&A due diligence processes.'),
        ('Southeast Asia: The Next Frontier for SaaS', 'southeast-asia-saas-frontier', 'report', 'expansion', 'Multiverse Consulting', true, NOW() - INTERVAL '20 days', 'Market analysis of the rapidly growing SaaS ecosystem across Southeast Asian markets.', 'Comprehensive report on SaaS adoption rates, market sizing, competitive landscapes, and go-to-market strategies across Singapore, Indonesia, Vietnam, Thailand, and the Philippines.'),
        ('Building High-Performance Remote Teams Across Time Zones', 'remote-teams-time-zones', 'guide', 'talent', 'Multiverse Consulting', true, NOW() - INTERVAL '18 days', 'Practical frameworks for managing distributed teams across multiple geographies and time zones.', 'A guide covering async communication protocols, meeting cadence optimization, cultural sensitivity in remote settings, and tooling recommendations for global teams.'),
        ('Private Equity Value Creation in Emerging Markets', 'pe-value-creation-emerging', 'insight', 'investment', 'Multiverse Consulting', true, NOW() - INTERVAL '15 days', 'How PE firms are driving operational improvements and growth in emerging market portfolio companies.', 'Analysis of value creation levers specific to emerging markets including operational efficiency, revenue diversification, governance upgrades, and exit strategy optimization.'),
        ('AI-Powered Customer Segmentation for B2B', 'ai-customer-segmentation-b2b', 'article', 'ai', 'Multiverse Consulting', true, NOW() - INTERVAL '12 days', 'How B2B companies are using AI to create more precise customer segments and drive personalized engagement.', 'Technical and strategic overview of AI-driven segmentation approaches, data requirements, implementation roadmaps, and ROI measurement frameworks for B2B organizations.'),
        ('The Consulting Firm Growth Playbook', 'consulting-firm-growth-playbook', 'guide', 'strategy', 'Multiverse Consulting', true, NOW() - INTERVAL '10 days', 'A strategic guide for boutique consulting firms looking to scale from $1M to $10M in revenue.', 'Detailed playbook covering service productization, pricing strategy, talent leverage models, client acquisition funnels, and operational scaling for growing consulting practices.'),
        ('Sustainability as a Competitive Advantage in MENA', 'sustainability-competitive-mena', 'insight', 'strategy', 'Multiverse Consulting', true, NOW() - INTERVAL '8 days', 'How MENA companies are leveraging sustainability initiatives for competitive differentiation and investor appeal.', 'Content about ESG integration, sustainability reporting frameworks, green financing opportunities, and consumer sentiment shifts in the MENA region.'),
        ('Venture Capital Trends in Africa 2026', 'vc-trends-africa-2026', 'report', 'investment', 'Multiverse Consulting', true, NOW() - INTERVAL '5 days', 'A data-driven look at VC investment flows, sector focus, and emerging opportunities across the African continent.', 'Report covering fintech dominance, healthtech growth, agritech potential, and infrastructure gaps that represent investment opportunities across key African markets.'),
        ('Talent Retention Strategies for Hypergrowth Startups', 'talent-retention-hypergrowth', 'article', 'talent', 'Multiverse Consulting', true, NOW() - INTERVAL '3 days', 'Why traditional retention tactics fail at hypergrowth companies and what works instead.', 'Article examining equity compensation design, career pathing frameworks, culture scaling challenges, and leadership development programs tailored for fast-growing startups.'),
        ('Generative AI in Professional Services: Use Cases That Deliver', 'genai-professional-services', 'insight', 'ai', 'Multiverse Consulting', true, NOW() - INTERVAL '1 day', 'Practical generative AI applications that professional services firms are using to boost productivity and client outcomes.', 'Content covering document automation, proposal generation, research synthesis, client communication drafting, and knowledge management powered by generative AI in consulting and professional services firms.')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `);
    console.log(`Seeded ${insightResult.rowCount} new insights`);

    // -------------------------------------------------------
    // OPPORTUNITIES (add 16 new)
    // -------------------------------------------------------
    const oppResult = await client.query(`
      INSERT INTO opportunities (company_name, contact_name, email, phone, opportunity_type, description, region, budget_range, status)
      VALUES
        ('Meridian Holdings', 'Ahmed Al-Sayed', 'ahmed@meridianholdings.ae', '+971-50-987-6543', 'Market Expansion', 'Looking for support entering the European market with their fintech product suite.', 'Middle East', '$50K-$100K', 'new'),
        ('TechBridge Solutions', 'Sarah Chen', 'sarah.chen@techbridge.sg', '+65-8234-5678', 'AI Implementation', 'Needs AI readiness assessment and implementation roadmap for their logistics platform.', 'Southeast Asia', '$25K-$50K', 'qualified'),
        ('Nordic Capital Partners', 'Erik Johansson', 'erik@nordiccapital.eu', '+46-70-123-4567', 'Executive Search', 'Seeking a Managing Director for their new Istanbul office.', 'Europe', '$75K-$150K', 'proposal'),
        ('Sahara Ventures', 'Amina Diallo', 'amina@saharaventures.com', '+234-801-234-5678', 'Investment Advisory', 'Raising a $50M fund focused on West African fintech and needs placement support.', 'Africa', '$100K-$200K', 'new'),
        ('PacificRim Corp', 'Kenji Tanaka', 'kenji@pacificrim.jp', '+81-90-1234-5678', 'Strategy Consulting', 'Exploring market entry into Vietnam and Indonesia for their manufacturing operations.', 'Asia Pacific', '$50K-$100K', 'qualified'),
        ('Atlas Group', 'Maria Santos', 'maria@atlasgroup.br', '+55-11-9876-5432', 'Market Expansion', 'Brazilian conglomerate seeking expansion strategy for Middle East market entry.', 'Latin America', '$75K-$150K', 'new'),
        ('Zenith Technologies', 'Raj Patel', 'raj@zenithtech.in', '+91-98765-43210', 'AI Implementation', 'Enterprise AI transformation for their 500-person customer service operation.', 'South Asia', '$100K-$200K', 'proposal'),
        ('Crescent Capital', 'Omar Hassan', 'omar@crescentcap.sa', '+966-50-123-4567', 'Investment Advisory', 'Sovereign wealth fund looking for deal sourcing support in Southeast Asian tech sector.', 'Middle East', '$200K+', 'negotiation'),
        ('Baltic Digital', 'Inga Petersone', 'inga@balticdigital.lv', '+371-2345-6789', 'Strategy Consulting', 'Digital transformation strategy for their media and publishing division.', 'Europe', '$25K-$50K', 'new'),
        ('Horizon Africa Fund', 'Kwame Asante', 'kwame@horizonafrica.gh', '+233-24-123-4567', 'Executive Search', 'Building out C-suite for three portfolio companies across East Africa.', 'Africa', '$150K-$300K', 'qualified'),
        ('Silk Road Partners', 'Li Wei', 'liwei@silkroadpartners.cn', '+86-138-1234-5678', 'Market Expansion', 'Chinese manufacturer seeking MENA distribution channels for consumer electronics.', 'Asia Pacific', '$50K-$100K', 'new'),
        ('Emerald Bay Consulting', 'Fiona O''Brien', 'fiona@emeraldbay.ie', '+353-87-123-4567', 'AI Implementation', 'AI-powered analytics platform for their financial advisory practice.', 'Europe', '$25K-$50K', 'qualified'),
        ('Summit Health Group', 'Dr. Aisha Mahmoud', 'aisha@summithealth.ae', '+971-55-234-5678', 'Strategy Consulting', 'Healthcare expansion strategy across GCC countries.', 'Middle East', '$75K-$150K', 'proposal'),
        ('Vanguard Logistics', 'Carlos Rivera', 'carlos@vanguardlog.mx', '+52-55-1234-5678', 'AI Implementation', 'Supply chain optimization using AI and predictive analytics.', 'Latin America', '$50K-$100K', 'new'),
        ('Pinnacle Investments', 'James Crawford', 'james@pinnacleinv.uk', '+44-7700-900123', 'Investment Advisory', 'Looking for co-investment opportunities in African infrastructure projects.', 'Europe', '$200K+', 'qualified'),
        ('Nova Digital Agency', 'Priya Sharma', 'priya@novadigital.in', '+91-87654-32109', 'Executive Search', 'Hiring VP of Strategy and Head of AI for their growing consultancy.', 'South Asia', '$50K-$100K', 'new')
      RETURNING id;
    `);
    console.log(`Seeded ${oppResult.rowCount} opportunities`);

    // -------------------------------------------------------
    // SERVICE PACKAGES (add 12 more to reach 16 total)
    // -------------------------------------------------------
    const pkgResult = await client.query(`
      INSERT INTO service_packages (name, slug, domain, price, price_type, description, delivery_workflow, active)
      VALUES
        ('Growth Strategy Sprint', 'growth-strategy-sprint', 'strategy', 3500.00, 'one-time', 'Intensive two-week growth strategy engagement covering market analysis, competitive positioning, and actionable growth roadmap.', 'Kickoff → Research → Analysis → Workshop → Deliverable', true),
        ('Talent Mapping Package', 'talent-mapping', 'talent', 7500.00, 'one-time', 'Comprehensive talent landscape mapping for specific roles or functions, including competitor analysis and compensation benchmarking.', 'Brief → Research → Mapping → Report → Presentation', true),
        ('Market Intelligence Report', 'market-intelligence', 'expansion', 4500.00, 'one-time', 'Custom market intelligence report covering market sizing, competitor analysis, regulatory landscape, and entry recommendations for a specific market.', 'Brief → Data collection → Analysis → Report → Review call', true),
        ('AI Strategy Workshop', 'ai-strategy-workshop', 'ai', 2500.00, 'one-time', 'Half-day executive workshop on AI opportunities, risks, and implementation priorities tailored to your industry and organization.', 'Pre-work → Workshop → Summary → Follow-up', true),
        ('Fractional CFO Advisory', 'fractional-cfo', 'strategy', 5000.00, 'monthly', 'Part-time CFO services including financial planning, investor reporting, cash flow management, and fundraising support.', 'Onboarding → Monthly cadence → Quarterly reviews → Annual planning', true),
        ('Deal Origination Support', 'deal-origination', 'investment', 12000.00, 'monthly', 'Ongoing deal flow curation and origination support for investment firms, including sector screening and preliminary due diligence.', 'Thesis alignment → Screening → Outreach → Pipeline updates → Quarterly review', true),
        ('Leadership Assessment Program', 'leadership-assessment', 'talent', 10000.00, 'one-time', '360-degree leadership assessment for executive teams including psychometric testing, stakeholder interviews, and development planning.', 'Design → Assessment → Interviews → Analysis → Debrief', true),
        ('Regulatory Compliance Package', 'regulatory-compliance', 'expansion', 8000.00, 'one-time', 'End-to-end regulatory compliance analysis and licensing roadmap for market entry in regulated industries.', 'Scope → Research → Gap analysis → Roadmap → Filing support', true),
        ('AI Operations Optimization', 'ai-ops-optimization', 'ai', 15000.00, 'one-time', 'Process mining, automation opportunity identification, and AI implementation for operational efficiency gains.', 'Process audit → Opportunity scoring → Solution design → Implementation → Monitoring setup', true),
        ('Board Advisory Retainer', 'board-advisory', 'strategy', 7500.00, 'monthly', 'Monthly board-level strategic advisory including meeting preparation, governance guidance, and strategic initiative support.', 'Onboarding → Monthly prep → Board attendance → Follow-up → Quarterly strategy review', true),
        ('Cross-Border M&A Advisory', 'cross-border-ma', 'investment', 35000.00, 'one-time', 'Full-cycle cross-border M&A advisory from target identification through deal closure and post-merger integration planning.', 'Strategy → Screening → Due diligence → Negotiation → Closing → Integration planning', true),
        ('Employer Brand Package', 'employer-brand', 'talent', 6000.00, 'one-time', 'Employer brand strategy and EVP development to attract top talent in competitive markets.', 'Audit → Research → Strategy → Creative brief → Implementation guide', true)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `);
    console.log(`Seeded ${pkgResult.rowCount} service packages`);

    // -------------------------------------------------------
    // CONTACTS (add more for meetings/consultations references)
    // -------------------------------------------------------
    const contactResult = await client.query(`
      INSERT INTO contacts (name, email, phone, company, industry, region, lifecycle_stage, source, interest)
      VALUES
        ('Sophie Laurent', 'sophie@laurentconseil.fr', '+33-6-1234-5678', 'Laurent Conseil', 'Consulting', 'Europe', 'lead', 'Website', 'Strategy consulting partnership'),
        ('Mohammed Al-Farsi', 'mfarsi@omaninvest.om', '+968-9123-4567', 'Oman Investment Authority', 'Government', 'Middle East', 'qualified', 'Conference', 'Investment advisory services'),
        ('Yuki Nakamura', 'yuki@tokyoventures.jp', '+81-80-1234-5678', 'Tokyo Ventures', 'Venture Capital', 'Asia Pacific', 'lead', 'Referral', 'Market expansion to Southeast Asia'),
        ('David Okafor', 'david@lagostech.ng', '+234-802-345-6789', 'Lagos Tech Hub', 'Technology', 'Africa', 'client', 'LinkedIn', 'AI implementation for fintech'),
        ('Isabella Rossi', 'isabella@milanocap.it', '+39-333-123-4567', 'Milano Capital Partners', 'Private Equity', 'Europe', 'qualified', 'Website', 'Cross-border deal advisory'),
        ('Chen Xiaoming', 'xiaoming@shenzhenai.cn', '+86-139-8765-4321', 'Shenzhen AI Labs', 'Technology', 'Asia Pacific', 'lead', 'Conference', 'AI readiness assessment'),
        ('Nadia Petrova', 'nadia@moscowglobal.ru', '+7-916-123-4567', 'Moscow Global Partners', 'Financial Services', 'Europe', 'lead', 'Website', 'Executive search services'),
        ('James Oduya', 'james@nairobifund.ke', '+254-722-123-456', 'Nairobi Growth Fund', 'Investment', 'Africa', 'qualified', 'Referral', 'Portfolio company support'),
        ('Ana Garcia', 'ana@bogotadigital.co', '+57-310-123-4567', 'Bogota Digital', 'Technology', 'Latin America', 'lead', 'LinkedIn', 'Digital transformation strategy'),
        ('Tariq Al-Mansoori', 'tariq@dubaiholdings.ae', '+971-56-789-0123', 'Dubai Holdings Group', 'Conglomerate', 'Middle East', 'client', 'Referral', 'Ongoing strategy advisory'),
        ('Emma Thompson', 'emma@londonadvisors.uk', '+44-7911-123456', 'London Advisory Group', 'Consulting', 'Europe', 'qualified', 'Conference', 'Partnership opportunities'),
        ('Hiroshi Sato', 'hiroshi@osakaventures.jp', '+81-90-8765-4321', 'Osaka Ventures', 'Venture Capital', 'Asia Pacific', 'lead', 'Website', 'Japan market entry support')
      RETURNING id;
    `);
    const newContactIds = contactResult.rows.map(r => r.id);
    console.log(`Seeded ${contactResult.rowCount} new contacts`);

    // Get existing contact IDs for reference
    const existingContacts = await client.query('SELECT id FROM contacts ORDER BY id LIMIT 15');
    const allContactIds = existingContacts.rows.map(r => r.id);

    // Get existing company IDs
    const existingCompanies = await client.query('SELECT id FROM companies ORDER BY id LIMIT 5');
    const allCompanyIds = existingCompanies.rows.map(r => r.id);

    // Get existing deal IDs
    const existingDeals = await client.query('SELECT id FROM deals ORDER BY id LIMIT 5');
    const allDealIds = existingDeals.rows.map(r => r.id);

    // -------------------------------------------------------
    // MEETINGS (add 16 new)
    // -------------------------------------------------------
    const c = allContactIds;
    const co = allCompanyIds;
    const d = allDealIds;

    const meetingResult = await client.query(`
      INSERT INTO meetings (contact_id, company_id, deal_id, title, type, date, time, duration_minutes, location, attendees, notes, status)
      VALUES
        (${c[0] || 'NULL'}, ${co[0] || 'NULL'}, ${d[0] || 'NULL'}, 'Discovery Call - Gulf Ventures Expansion', 'discovery', '2026-04-02', '10:00', 60, 'Zoom', 'Fatima Al-Rashid, Partner team', 'Initial discovery for Southeast Asian expansion project', 'scheduled'),
        (${c[1] || 'NULL'}, ${co[1] || 'NULL'}, ${d[1] || 'NULL'}, 'Executive Search Progress Review', 'review', '2026-04-03', '14:00', 45, 'Google Meet', 'Tan Wei Ming, HR Director', 'Review shortlisted CTO candidates', 'scheduled'),
        (${c[2] || 'NULL'}, NULL, NULL, 'AI Readiness Assessment Kickoff', 'consultation', '2026-04-04', '09:00', 90, 'In-person - Oslo Office', 'Lars Henriksen, CTO, Data team leads', 'Kickoff meeting for AI readiness assessment across portfolio', 'scheduled'),
        (${c[3] || 'NULL'}, NULL, NULL, 'Strategy Workshop - Laurent Conseil', 'workshop', '2026-04-05', '11:00', 120, 'Paris Office', 'Sophie Laurent, Strategy team', 'Full-day strategy workshop for European expansion', 'scheduled'),
        (${c[4] || 'NULL'}, NULL, NULL, 'Investment Advisory Introduction', 'discovery', '2026-04-07', '15:00', 60, 'Zoom', 'Mohammed Al-Farsi, Investment Director', 'Introduction meeting to discuss advisory services', 'scheduled'),
        (${c[5] || 'NULL'}, NULL, NULL, 'Tokyo Ventures Market Briefing', 'briefing', '2026-04-08', '08:00', 60, 'Microsoft Teams', 'Yuki Nakamura, Portfolio Manager', 'Market briefing on Southeast Asian tech landscape', 'scheduled'),
        (${c[6] || 'NULL'}, NULL, NULL, 'Lagos Tech AI Implementation Scoping', 'consultation', '2026-04-09', '13:00', 90, 'Zoom', 'David Okafor, CTO, Engineering leads', 'Scope AI implementation for fintech platform', 'scheduled'),
        (${c[7] || 'NULL'}, NULL, NULL, 'Milano Capital Deal Review', 'review', '2026-04-10', '10:00', 60, 'In-person - Milan', 'Isabella Rossi, Deal team', 'Review potential cross-border acquisition targets', 'scheduled'),
        (${c[8] || 'NULL'}, NULL, NULL, 'Shenzhen AI Labs Assessment Follow-up', 'follow-up', '2026-04-11', '16:00', 45, 'Zoom', 'Chen Xiaoming, VP Engineering', 'Follow-up on AI readiness assessment findings', 'scheduled'),
        (${c[0] || 'NULL'}, ${co[0] || 'NULL'}, ${d[0] || 'NULL'}, 'Gulf Ventures Proposal Presentation', 'presentation', '2026-04-14', '11:00', 90, 'In-person - Abu Dhabi', 'Fatima Al-Rashid, Board members', 'Present market entry proposal and budget', 'scheduled'),
        (${c[9] || 'NULL'}, NULL, NULL, 'Nairobi Fund Portfolio Review', 'review', '2026-04-15', '14:00', 60, 'Google Meet', 'James Oduya, Managing Partner', 'Quarterly portfolio company performance review', 'scheduled'),
        (${c[10] || 'NULL'}, NULL, NULL, 'Bogota Digital Strategy Session', 'consultation', '2026-04-16', '09:00', 120, 'Zoom', 'Ana Garcia, CEO, COO', 'Digital transformation strategy development session', 'scheduled'),
        (${c[11] || 'NULL'}, NULL, NULL, 'Dubai Holdings Quarterly Advisory', 'review', '2026-04-17', '10:00', 60, 'In-person - Dubai', 'Tariq Al-Mansoori, Strategy team', 'Quarterly strategic advisory meeting', 'scheduled'),
        (${c[12] || 'NULL'}, NULL, NULL, 'London Advisory Partnership Discussion', 'discovery', '2026-04-18', '15:00', 60, 'Zoom', 'Emma Thompson, Managing Director', 'Explore partnership and referral opportunities', 'scheduled'),
        (${c[0] || 'NULL'}, ${co[0] || 'NULL'}, NULL, 'Gulf Ventures Contract Negotiation', 'negotiation', '2026-04-21', '10:00', 90, 'Zoom', 'Fatima Al-Rashid, Legal team', 'Contract terms and scope finalization', 'scheduled'),
        (${c[1] || 'NULL'}, ${co[1] || 'NULL'}, ${d[1] || 'NULL'}, 'AsiaBridge Final Candidate Presentations', 'presentation', '2026-04-22', '14:00', 120, 'In-person - Singapore', 'Tan Wei Ming, CEO, CHRO', 'Present final CTO shortlist for decision', 'scheduled')
      RETURNING id;
    `);
    console.log(`Seeded ${meetingResult.rowCount} meetings`);

    // -------------------------------------------------------
    // CONSULTATIONS (add 14 more to reach 16 total)
    // -------------------------------------------------------
    const consultResult = await client.query(`
      INSERT INTO consultations (contact_id, name, email, phone, company, service_interest, message, preferred_date, preferred_time, status)
      VALUES
        (${c[3] || 'NULL'}, 'Sophie Laurent', 'sophie@laurentconseil.fr', '+33-6-1234-5678', 'Laurent Conseil', 'Strategy Consulting', 'Interested in exploring strategic partnership and joint market entry services for African markets.', '2026-04-05', '10:00 AM', 'confirmed'),
        (${c[4] || 'NULL'}, 'Mohammed Al-Farsi', 'mfarsi@omaninvest.om', '+968-9123-4567', 'Oman Investment Authority', 'Investment Advisory', 'Need advisory support for sovereign fund technology investments in Southeast Asia.', '2026-04-07', '2:00 PM', 'confirmed'),
        (${c[5] || 'NULL'}, 'Yuki Nakamura', 'yuki@tokyoventures.jp', '+81-80-1234-5678', 'Tokyo Ventures', 'Market Expansion', 'Looking for market entry support to bring Japanese portfolio companies into ASEAN markets.', '2026-04-08', '9:00 AM', 'pending'),
        (${c[6] || 'NULL'}, 'David Okafor', 'david@lagostech.ng', '+234-802-345-6789', 'Lagos Tech Hub', 'AI Implementation', 'Want to discuss AI implementation for our lending platform and fraud detection systems.', '2026-04-09', '1:00 PM', 'confirmed'),
        (NULL, 'Roberto Mendez', 'roberto@latamgrowth.mx', '+52-55-9876-5432', 'LatAm Growth Partners', 'Strategy Consulting', 'Exploring growth strategy options for our fund management business expanding into Colombia and Chile.', '2026-04-10', '11:00 AM', 'pending'),
        (${c[7] || 'NULL'}, 'Isabella Rossi', 'isabella@milanocap.it', '+39-333-123-4567', 'Milano Capital Partners', 'Investment Advisory', 'Need support evaluating cross-border M&A targets in the healthcare sector.', '2026-04-11', '3:00 PM', 'confirmed'),
        (NULL, 'Grace Mwangi', 'grace@nairobihealth.ke', '+254-733-456-789', 'Nairobi Health Systems', 'AI Implementation', 'Interested in AI-powered patient management and diagnostic support systems.', '2026-04-14', '10:00 AM', 'pending'),
        (${c[8] || 'NULL'}, 'Chen Xiaoming', 'xiaoming@shenzhenai.cn', '+86-139-8765-4321', 'Shenzhen AI Labs', 'AI Implementation', 'Want comprehensive AI readiness assessment for our manufacturing operations.', '2026-04-15', '4:00 PM', 'confirmed'),
        (NULL, 'Aleksei Volkov', 'aleksei@moscowtech.ru', '+7-916-789-0123', 'Moscow Tech Ventures', 'Executive Search', 'Need to hire CTO and VP Product for our fintech subsidiary.', '2026-04-16', '11:00 AM', 'pending'),
        (${c[9] || 'NULL'}, 'James Oduya', 'james@nairobifund.ke', '+254-722-123-456', 'Nairobi Growth Fund', 'Strategy Consulting', 'Looking for operational improvement advisory for three portfolio companies.', '2026-04-17', '2:00 PM', 'confirmed'),
        (NULL, 'Fatimah Zahra', 'fatimah@riyadhventures.sa', '+966-55-234-5678', 'Riyadh Ventures', 'Market Expansion', 'Saudi company exploring European market entry for our edtech products.', '2026-04-18', '9:00 AM', 'pending'),
        (${c[10] || 'NULL'}, 'Ana Garcia', 'ana@bogotadigital.co', '+57-310-123-4567', 'Bogota Digital', 'AI Implementation', 'Need AI strategy workshop for our executive team before committing to transformation initiative.', '2026-04-21', '10:00 AM', 'pending'),
        (${c[11] || 'NULL'}, 'Tariq Al-Mansoori', 'tariq@dubaiholdings.ae', '+971-56-789-0123', 'Dubai Holdings Group', 'Strategy Consulting', 'Quarterly strategy review and board preparation support.', '2026-04-22', '11:00 AM', 'confirmed'),
        (NULL, 'Patrick Nkomo', 'patrick@jhbcapital.za', '+27-82-123-4567', 'Johannesburg Capital', 'Investment Advisory', 'Exploring co-investment opportunities in East African infrastructure with international partners.', '2026-04-23', '3:00 PM', 'pending')
      RETURNING id;
    `);
    console.log(`Seeded ${consultResult.rowCount} consultations`);

    await client.query('COMMIT');

    // Print summary
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM insights'),
      client.query('SELECT COUNT(*) FROM opportunities'),
      client.query('SELECT COUNT(*) FROM service_packages'),
      client.query('SELECT COUNT(*) FROM meetings'),
      client.query('SELECT COUNT(*) FROM consultations'),
    ]);

    console.log('\n--- Seed Summary ---');
    console.log(`Insights: ${counts[0].rows[0].count}`);
    console.log(`Opportunities: ${counts[1].rows[0].count}`);
    console.log(`Service Packages: ${counts[2].rows[0].count}`);
    console.log(`Meetings: ${counts[3].rows[0].count}`);
    console.log(`Consultations: ${counts[4].rows[0].count}`);
    console.log('\nExtra seed data added successfully.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedExtra();
