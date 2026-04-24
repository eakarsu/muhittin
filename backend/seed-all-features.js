const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'erolakarsu',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'muhittin_platform'
});

async function seedAll() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get existing IDs for FK references
    const contacts = (await client.query('SELECT id FROM contacts ORDER BY id')).rows.map(r => r.id);
    const companies = (await client.query('SELECT id FROM companies ORDER BY id')).rows.map(r => r.id);
    const deals = (await client.query('SELECT id FROM deals ORDER BY id')).rows.map(r => r.id);
    const packages = (await client.query('SELECT id FROM service_packages ORDER BY id')).rows.map(r => r.id);
    const businesses = (await client.query('SELECT id FROM businesses ORDER BY id')).rows.map(r => r.id);

    // -------------------------------------------------------
    // CANDIDATES (currently 1, add 15 more)
    // -------------------------------------------------------
    await client.query(`
      INSERT INTO candidates (name, email, phone, industry, experience_years, region, role_level, compensation_min, compensation_max, skills, availability, status, notes)
      VALUES
        ('Ahmad Khalil', 'ahmad.khalil@email.com', '+971-55-111-2222', 'Financial Services', 18, 'Middle East', 'C-Suite', 250000, 350000, 'Strategy, M&A, Financial Modeling, Board Governance', 'active', 'shortlisted', 'Former CFO at regional bank, strong PE background'),
        ('Mei Lin Chen', 'meiling@email.com', '+65-9111-2222', 'Technology', 15, 'Southeast Asia', 'VP', 200000, 280000, 'Product Management, AI/ML, SaaS, Go-to-Market', 'active', 'interviewing', 'VP Product at leading SaaS company, built products for 3 markets'),
        ('Oluwaseun Adeyemi', 'seun.adeyemi@email.com', '+234-803-111-2222', 'Fintech', 12, 'Africa', 'Director', 150000, 200000, 'Payments, Mobile Banking, Regulatory Compliance, Team Leadership', 'active', 'new', 'Director of Payments at major African fintech'),
        ('Sofia Bergström', 'sofia.bergstrom@email.com', '+46-73-111-2222', 'Healthcare', 20, 'Europe', 'C-Suite', 300000, 400000, 'Healthcare Operations, Digital Health, P&L Management, M&A', 'passive', 'new', 'CEO of Nordic healthtech startup, previously at major hospital group'),
        ('Rajesh Venkataraman', 'rajesh.v@email.com', '+91-98111-22222', 'Manufacturing', 16, 'South Asia', 'VP', 180000, 250000, 'Supply Chain, Operations, Lean Manufacturing, Digital Transformation', 'active', 'qualified', 'VP Operations at Indian manufacturing conglomerate'),
        ('Amara Osei', 'amara.osei@email.com', '+233-20-111-2222', 'Education', 10, 'Africa', 'Director', 120000, 160000, 'EdTech, Curriculum Design, Growth Strategy, Partnerships', 'active', 'new', 'Leading edtech expansion across West Africa'),
        ('Hiroshi Yamamoto', 'hiroshi.y@email.com', '+81-90-1111-2222', 'Automotive', 22, 'Asia Pacific', 'C-Suite', 350000, 450000, 'Automotive Engineering, EV Strategy, Global Operations, Board Experience', 'passive', 'shortlisted', 'Former SVP at major Japanese automaker'),
        ('Fatima Hassan', 'fatima.h@email.com', '+966-55-111-2222', 'Energy', 14, 'Middle East', 'Director', 170000, 230000, 'Renewable Energy, Project Management, Sustainability, Government Relations', 'active', 'interviewing', 'Director at Saudi energy transition initiative'),
        ('Lucas Ferreira', 'lucas.f@email.com', '+55-11-91111-2222', 'Logistics', 11, 'Latin America', 'Director', 130000, 180000, 'Supply Chain, Last Mile Delivery, Technology Integration, Team Building', 'active', 'new', 'Building logistics tech startup in Brazil'),
        ('Elena Popescu', 'elena.p@email.com', '+40-722-111-222', 'Cybersecurity', 13, 'Europe', 'VP', 190000, 260000, 'Cybersecurity, Risk Management, Compliance, Cloud Security', 'active', 'qualified', 'VP Security at European fintech unicorn'),
        ('Kevin Ng', 'kevin.ng@email.com', '+852-9111-2222', 'Real Estate', 17, 'Asia Pacific', 'C-Suite', 280000, 380000, 'Real Estate Development, PropTech, Investment, Asset Management', 'passive', 'new', 'COO of major Hong Kong real estate developer'),
        ('Priya Nair', 'priya.nair@email.com', '+91-98222-33333', 'Consulting', 9, 'South Asia', 'Manager', 100000, 140000, 'Management Consulting, Data Analytics, Strategy, Client Management', 'active', 'new', 'Senior Manager at Big 4 consulting firm'),
        ('Omar Ben Ali', 'omar.benali@email.com', '+212-661-111-222', 'Agriculture', 15, 'Africa', 'VP', 160000, 220000, 'AgriTech, Supply Chain, Market Development, Investor Relations', 'active', 'qualified', 'Leading agritech platform in North Africa'),
        ('Anna Kowalski', 'anna.k@email.com', '+48-501-111-222', 'E-commerce', 8, 'Europe', 'Manager', 90000, 130000, 'E-commerce, Digital Marketing, Growth Hacking, Analytics', 'active', 'new', 'Head of Growth at Polish e-commerce platform'),
        ('Tariq Mahmoud', 'tariq.m@email.com', '+962-79-111-2222', 'Insurance', 19, 'Middle East', 'C-Suite', 270000, 360000, 'Insurance, Risk, Actuarial, Digital Transformation, Regulatory', 'passive', 'shortlisted', 'CEO of regional insurtech company')
    `);
    console.log('Seeded 15 candidates');

    // -------------------------------------------------------
    // COMPANIES (currently 12, add 5 more)
    // -------------------------------------------------------
    await client.query(`
      INSERT INTO companies (name, industry, size, region, website, relationship_owner, notes)
      VALUES
        ('Sahel Agritech', 'Agriculture', '50-200', 'Africa', 'https://sahelagritech.com', 'Partner', 'West African agritech platform connecting farmers to markets'),
        ('Baltic Innovation Hub', 'Technology', '10-50', 'Europe', 'https://baltichub.lv', 'Director', 'Latvian tech incubator and venture studio'),
        ('Crescendo Capital Partners', 'Private Equity', '50-200', 'Middle East', 'https://crescendocap.ae', 'Managing Partner', 'Dubai-based PE firm focused on healthcare and education'),
        ('Pacific Rim Logistics', 'Logistics', '500-1000', 'Asia Pacific', 'https://pacrimlog.sg', 'CEO', 'Regional logistics company with operations in 8 ASEAN countries'),
        ('Andean Digital Group', 'Technology', '200-500', 'Latin America', 'https://andeandigital.co', 'CTO', 'Colombian digital transformation consultancy expanding across LATAM')
    `);
    console.log('Seeded 5 companies');

    // -------------------------------------------------------
    // DEALS (currently 12, add 5 more)
    // -------------------------------------------------------
    const c = contacts;
    const co = companies;
    await client.query(`
      INSERT INTO deals (contact_id, company_id, opportunity_type, service_line, value, stage, close_date, region, notes)
      VALUES
        (${c[4] || c[0]}, ${co[0]}, 'consulting', 'AI Implementation', 45000, 'discovery', '2026-06-15', 'Middle East', 'AI readiness assessment for investment portfolio companies'),
        (${c[5] || c[0]}, ${co[1] || co[0]}, 'consulting', 'Market Expansion', 60000, 'proposal', '2026-05-30', 'Asia Pacific', 'ASEAN market entry strategy for Japanese portfolio companies'),
        (${c[6] || c[0]}, NULL, 'search', 'Executive Search', 85000, 'qualified', '2026-07-01', 'Africa', 'C-suite search for 2 fintech portfolio companies in East Africa'),
        (${c[7] || c[0]}, ${co[2] || co[0]}, 'consulting', 'Strategy', 35000, 'negotiation', '2026-04-20', 'Europe', 'Digital transformation strategy for media division'),
        (${c[8] || c[0]}, NULL, 'advisory', 'Investment Advisory', 120000, 'proposal', '2026-06-30', 'Middle East', 'Deal sourcing and advisory for MENA tech acquisitions')
    `);
    console.log('Seeded 5 deals');

    // Refresh deals list
    const allDeals = (await client.query('SELECT id FROM deals ORDER BY id')).rows.map(r => r.id);
    const allContacts = (await client.query('SELECT id FROM contacts ORDER BY id')).rows.map(r => r.id);
    const allCompanies = (await client.query('SELECT id FROM companies ORDER BY id')).rows.map(r => r.id);
    const allPackages = (await client.query('SELECT id FROM service_packages ORDER BY id')).rows.map(r => r.id);

    // -------------------------------------------------------
    // PARTNERS (currently 0, add 16)
    // -------------------------------------------------------
    await client.query(`
      INSERT INTO partners (company_name, contact_name, email, phone, type, region, industry, status, notes)
      VALUES
        ('Al Masah Advisory', 'Khalid Al-Suwaidi', 'khalid@almasah.ae', '+971-4-555-1234', 'referral', 'Middle East', 'Financial Services', 'active', 'Dubai-based advisory firm, strong GCC network for deal referrals'),
        ('Singapore Ventures Network', 'Rachel Tan', 'rachel@svnetwork.sg', '+65-6555-1234', 'co-delivery', 'Southeast Asia', 'Venture Capital', 'active', 'VC network for co-investment and portfolio support opportunities'),
        ('Berlin Strategy Group', 'Markus Weber', 'markus@berlinstrategy.de', '+49-30-555-1234', 'referral', 'Europe', 'Consulting', 'active', 'German strategy consultancy, refers clients needing emerging market expertise'),
        ('Lagos Angels Network', 'Chidinma Eze', 'chidinma@lagosangels.ng', '+234-1-555-1234', 'referral', 'Africa', 'Investment', 'active', 'Angel investor network covering West Africa, strong deal flow'),
        ('Tokyo Business Partners', 'Kenji Matsuda', 'kenji@tokyobp.jp', '+81-3-5555-1234', 'co-delivery', 'Asia Pacific', 'Consulting', 'active', 'Japanese consulting firm for market entry support'),
        ('Riyadh Innovation Hub', 'Nora Al-Otaibi', 'nora@riyadhhub.sa', '+966-11-555-1234', 'technology', 'Middle East', 'Technology', 'active', 'Saudi tech incubator, refers AI and digital transformation clients'),
        ('Cape Town Talent Co', 'Johan van der Berg', 'johan@cttc.za', '+27-21-555-1234', 'co-delivery', 'Africa', 'Recruitment', 'active', 'Executive search partner for Southern Africa placements'),
        ('Mumbai Advisory Group', 'Ananya Desai', 'ananya@mumbaiag.in', '+91-22-5555-1234', 'referral', 'South Asia', 'Consulting', 'inquiry', 'Indian advisory firm exploring partnership for cross-border deals'),
        ('Nordic Legal Partners', 'Astrid Lindberg', 'astrid@nordiclegal.se', '+46-8-555-1234', 'legal', 'Europe', 'Legal', 'active', 'Scandinavian law firm for cross-border deal structuring'),
        ('Sao Paulo Ventures', 'Ricardo Costa', 'ricardo@spventures.br', '+55-11-5555-1234', 'referral', 'Latin America', 'Investment', 'inquiry', 'Brazilian VC firm interested in co-investment partnership'),
        ('Istanbul Growth Partners', 'Elif Yilmaz', 'elif@istanbulgrowth.tr', '+90-212-555-1234', 'co-delivery', 'Europe', 'Consulting', 'active', 'Turkish growth consultancy for MENA-Europe bridge advisory'),
        ('Nairobi Digital Labs', 'James Mwangi', 'james@nairobidl.ke', '+254-20-555-1234', 'technology', 'Africa', 'Technology', 'active', 'East African tech studio, refers AI implementation clients'),
        ('Kuala Lumpur Capital', 'Amir Shah', 'amir@klcapital.my', '+60-3-5555-1234', 'referral', 'Southeast Asia', 'Financial Services', 'active', 'Malaysian investment firm for ASEAN deal referrals'),
        ('Amsterdam Fintech Hub', 'Pieter de Jong', 'pieter@amsfintechhub.nl', '+31-20-555-1234', 'technology', 'Europe', 'Fintech', 'inquiry', 'Dutch fintech accelerator exploring consulting partnership'),
        ('Cairo Advisory Services', 'Mona Elbaz', 'mona@cairoadvisory.eg', '+20-2-555-1234', 'co-delivery', 'Africa', 'Consulting', 'active', 'Egyptian consulting firm for North Africa market entry support'),
        ('Hanoi Tech Collective', 'Tran Minh', 'minh@hanoitech.vn', '+84-24-555-1234', 'referral', 'Southeast Asia', 'Technology', 'inquiry', 'Vietnamese tech network for market entry client referrals')
    `);
    console.log('Seeded 16 partners');

    // -------------------------------------------------------
    // PAYMENTS (currently 0, add 16)
    // -------------------------------------------------------
    const payResult = await client.query(`
      INSERT INTO payments (deal_id, contact_id, amount, currency, service, status, stripe_payment_id, created_at)
      VALUES
        (${allDeals[0] || 'NULL'}, ${allContacts[0]}, 5000.00, 'USD', 'Strategy Diagnostic Package', 'completed', 'pi_demo_001', NOW() - INTERVAL '60 days'),
        (${allDeals[0] || 'NULL'}, ${allContacts[0]}, 10000.00, 'USD', 'Market Entry - Phase 1', 'completed', 'pi_demo_002', NOW() - INTERVAL '45 days'),
        (${allDeals[1] || 'NULL'}, ${allContacts[1]}, 25000.00, 'USD', 'Executive Search - Retainer', 'completed', 'pi_demo_003', NOW() - INTERVAL '40 days'),
        (${allDeals[1] || 'NULL'}, ${allContacts[1]}, 25000.00, 'USD', 'Executive Search - Placement', 'pending', 'pi_demo_004', NOW() - INTERVAL '10 days'),
        (${allDeals[2] || allDeals[0]}, ${allContacts[2]}, 8500.00, 'USD', 'AI Readiness Assessment', 'completed', 'pi_demo_005', NOW() - INTERVAL '35 days'),
        (${allDeals[2] || allDeals[0]}, ${allContacts[2]}, 4500.00, 'USD', 'Market Intelligence Report', 'completed', 'pi_demo_006', NOW() - INTERVAL '30 days'),
        (${allDeals[3] || allDeals[0]}, ${allContacts[3] || allContacts[0]}, 7500.00, 'USD', 'Board Advisory - Q1', 'completed', 'pi_demo_007', NOW() - INTERVAL '28 days'),
        (${allDeals[3] || allDeals[0]}, ${allContacts[3] || allContacts[0]}, 7500.00, 'USD', 'Board Advisory - Q2', 'pending', 'pi_demo_008', NOW() - INTERVAL '5 days'),
        (${allDeals[4] || allDeals[0]}, ${allContacts[4] || allContacts[0]}, 15000.00, 'USD', 'Market Entry Package', 'completed', 'pi_demo_009', NOW() - INTERVAL '25 days'),
        (${allDeals[4] || allDeals[0]}, ${allContacts[4] || allContacts[0]}, 3500.00, 'USD', 'Growth Strategy Sprint', 'completed', 'pi_demo_010', NOW() - INTERVAL '20 days'),
        (${allDeals[5] || allDeals[0]}, ${allContacts[5] || allContacts[0]}, 12000.00, 'USD', 'Deal Origination - Month 1', 'completed', 'pi_demo_011', NOW() - INTERVAL '18 days'),
        (${allDeals[5] || allDeals[0]}, ${allContacts[5] || allContacts[0]}, 12000.00, 'USD', 'Deal Origination - Month 2', 'pending', 'pi_demo_012', NOW() - INTERVAL '3 days'),
        (${allDeals[6] || allDeals[0]}, ${allContacts[6] || allContacts[0]}, 10000.00, 'USD', 'Leadership Assessment Program', 'completed', 'pi_demo_013', NOW() - INTERVAL '15 days'),
        (${allDeals[6] || allDeals[0]}, ${allContacts[6] || allContacts[0]}, 6000.00, 'USD', 'Employer Brand Package', 'refunded', 'pi_demo_014', NOW() - INTERVAL '12 days'),
        (${allDeals[7] || allDeals[0]}, ${allContacts[7] || allContacts[0]}, 35000.00, 'USD', 'Cross-Border M&A Advisory', 'completed', 'pi_demo_015', NOW() - INTERVAL '8 days'),
        (${allDeals[8] || allDeals[0]}, ${allContacts[8] || allContacts[0]}, 2500.00, 'USD', 'AI Strategy Workshop', 'completed', 'pi_demo_016', NOW() - INTERVAL '2 days')
      RETURNING id;
    `);
    const paymentIds = payResult.rows.map(r => r.id);
    console.log(`Seeded ${paymentIds.length} payments`);

    // -------------------------------------------------------
    // ORDERS (currently 0, add 16)
    // -------------------------------------------------------
    await client.query(`
      INSERT INTO orders (deal_id, contact_id, service_package_id, payment_id, delivery_stage, notes)
      VALUES
        (${allDeals[0] || 'NULL'}, ${allContacts[0]}, ${allPackages[0]}, ${paymentIds[0]}, 'completed', 'Strategy diagnostic delivered successfully'),
        (${allDeals[0] || 'NULL'}, ${allContacts[0]}, ${allPackages[1]}, ${paymentIds[1]}, 'in-progress', 'Market entry phase 1 underway - research stage'),
        (${allDeals[1] || 'NULL'}, ${allContacts[1]}, ${allPackages[2]}, ${paymentIds[2]}, 'in-progress', 'Executive search active - screening candidates'),
        (${allDeals[2] || allDeals[0]}, ${allContacts[2]}, ${allPackages[3]}, ${paymentIds[4]}, 'completed', 'AI readiness report delivered'),
        (${allDeals[2] || allDeals[0]}, ${allContacts[2]}, ${allPackages[4] || allPackages[0]}, ${paymentIds[5]}, 'completed', 'Market intelligence report delivered'),
        (${allDeals[3] || allDeals[0]}, ${allContacts[3] || allContacts[0]}, ${allPackages[5] || allPackages[0]}, ${paymentIds[6]}, 'in-progress', 'Board advisory retainer - ongoing'),
        (${allDeals[4] || allDeals[0]}, ${allContacts[4] || allContacts[0]}, ${allPackages[1]}, ${paymentIds[8]}, 'in-progress', 'Market entry execution phase'),
        (${allDeals[4] || allDeals[0]}, ${allContacts[4] || allContacts[0]}, ${allPackages[6] || allPackages[0]}, ${paymentIds[9]}, 'completed', 'Growth strategy sprint completed'),
        (${allDeals[5] || allDeals[0]}, ${allContacts[5] || allContacts[0]}, ${allPackages[7] || allPackages[0]}, ${paymentIds[10]}, 'in-progress', 'Deal origination support active'),
        (${allDeals[6] || allDeals[0]}, ${allContacts[6] || allContacts[0]}, ${allPackages[8] || allPackages[0]}, ${paymentIds[12]}, 'completed', 'Leadership assessment completed for exec team'),
        (${allDeals[6] || allDeals[0]}, ${allContacts[6] || allContacts[0]}, ${allPackages[9] || allPackages[0]}, ${paymentIds[13]}, 'cancelled', 'Employer brand package cancelled - client pivot'),
        (${allDeals[7] || allDeals[0]}, ${allContacts[7] || allContacts[0]}, ${allPackages[10] || allPackages[0]}, ${paymentIds[14]}, 'in-progress', 'Cross-border M&A due diligence phase'),
        (${allDeals[8] || allDeals[0]}, ${allContacts[8] || allContacts[0]}, ${allPackages[11] || allPackages[0]}, ${paymentIds[15]}, 'kickoff', 'AI strategy workshop scheduled for next week'),
        (${allDeals[9] || allDeals[0]}, ${allContacts[9] || allContacts[0]}, ${allPackages[0]}, NULL, 'kickoff', 'New strategy diagnostic engagement'),
        (${allDeals[10] || allDeals[0]}, ${allContacts[10] || allContacts[0]}, ${allPackages[2]}, NULL, 'discovery', 'Executive search scoping in progress'),
        (${allDeals[11] || allDeals[0]}, ${allContacts[11] || allContacts[0]}, ${allPackages[3]}, NULL, 'kickoff', 'AI readiness kickoff pending payment')
    `);
    console.log('Seeded 16 orders');

    // -------------------------------------------------------
    // WEBSITES (currently 10, add 6 more)
    // -------------------------------------------------------
    const biz = businesses;
    await client.query(`
      INSERT INTO websites (business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, published, visits)
      VALUES
        (${biz[5] || biz[0]}, 'Premium Auto Detailing', 'premium-auto-detail', 'business', 'Your Car Deserves the Best Care', 'Professional auto detailing services with premium products and expert technicians.', 'Book Now', '/book', true, 234),
        (${biz[6] || biz[0]}, 'Green Thumb Landscaping', 'green-thumb-landscape', 'service', 'Transform Your Outdoor Space', 'Expert landscaping design and maintenance for residential and commercial properties.', 'Get a Quote', '/contact', true, 189),
        (${biz[7] || biz[0]}, 'Digital Marketing Pro', 'digital-marketing-pro', 'agency', 'Grow Your Business Online', 'Full-service digital marketing agency specializing in SEO, PPC, and social media management.', 'Start Growing', '/consult', true, 567),
        (${biz[8] || biz[0]}, 'Healthy Bites Meal Prep', 'healthy-bites-meals', 'ecommerce', 'Healthy Eating Made Easy', 'Fresh, chef-prepared meals delivered to your door. Customized for your dietary needs.', 'Order Now', '/menu', true, 412),
        (${biz[9] || biz[0]}, 'Swift Plumbing Services', 'swift-plumbing', 'business', 'Fast, Reliable Plumbing Solutions', '24/7 emergency plumbing services with licensed and insured professionals.', 'Call Now', '/emergency', true, 156),
        (${biz[10] || biz[0]}, 'Creative Studio Design', 'creative-studio-design', 'portfolio', 'Where Ideas Come to Life', 'Award-winning graphic design, branding, and web development studio.', 'View Portfolio', '/work', false, 78)
    `);
    console.log('Seeded 6 websites');

    // -------------------------------------------------------
    // ONBOARDING WORKFLOWS (currently 1, add 15 more)
    // -------------------------------------------------------
    await client.query(`
      INSERT INTO onboarding_workflows (deal_id, contact_id, company_id, service, status, payment_received, welcome_email_sent, kickoff_scheduled, kickoff_date, internal_project_created, project_notes, milestone_1, milestone_1_done, milestone_2, milestone_2_done, milestone_3, milestone_3_done, milestone_4, milestone_4_done)
      VALUES
        (${allDeals[0]}, ${allContacts[0]}, ${allCompanies[0]}, 'Strategy Diagnostic', 'in-progress', true, true, true, '2026-03-15', true, 'Phase 1 complete, moving to analysis', 'Discovery Session', true, 'Data Collection', true, 'Analysis & Report', false, 'Strategy Presentation', false),
        (${allDeals[1]}, ${allContacts[1]}, ${allCompanies[1] || allCompanies[0]}, 'Executive Search', 'in-progress', true, true, true, '2026-03-20', true, 'Active search phase', 'Role Definition', true, 'Candidate Sourcing', true, 'Interview Coordination', false, 'Offer & Placement', false),
        (${allDeals[2] || allDeals[0]}, ${allContacts[2]}, NULL, 'AI Readiness Assessment', 'completed', true, true, true, '2026-02-28', true, 'Successfully delivered', 'Current State Audit', true, 'Opportunity Mapping', true, 'Tool Evaluation', true, 'Roadmap Delivery', true),
        (${allDeals[3] || allDeals[0]}, ${allContacts[3] || allContacts[0]}, ${allCompanies[2] || allCompanies[0]}, 'Market Entry Package', 'in-progress', true, true, true, '2026-03-25', true, 'Market research underway for 3 countries', 'Market Assessment', true, 'Regulatory Review', false, 'Partner Mapping', false, 'GTM Strategy', false),
        (${allDeals[4] || allDeals[0]}, ${allContacts[4] || allContacts[0]}, NULL, 'Growth Strategy Sprint', 'completed', true, true, true, '2026-02-15', true, 'Sprint completed ahead of schedule', 'Kickoff Workshop', true, 'Research & Analysis', true, 'Strategy Development', true, 'Deliverable & Review', true),
        (${allDeals[5] || allDeals[0]}, ${allContacts[5] || allContacts[0]}, NULL, 'Deal Origination Support', 'in-progress', true, true, true, '2026-03-01', true, 'Monthly retainer active', 'Thesis Alignment', true, 'Sector Screening', true, 'Outreach Campaign', false, 'Pipeline Building', false),
        (${allDeals[6] || allDeals[0]}, ${allContacts[6] || allContacts[0]}, NULL, 'Leadership Assessment', 'completed', true, true, true, '2026-02-10', true, 'All assessments completed', 'Assessment Design', true, 'Psychometric Testing', true, 'Stakeholder Interviews', true, 'Development Plans', true),
        (${allDeals[7] || allDeals[0]}, ${allContacts[7] || allContacts[0]}, ${allCompanies[3] || allCompanies[0]}, 'Cross-Border M&A', 'in-progress', true, true, true, '2026-03-10', true, 'Due diligence phase active', 'Target Identification', true, 'Preliminary Analysis', true, 'Due Diligence', false, 'Deal Structuring', false),
        (${allDeals[8] || allDeals[0]}, ${allContacts[8] || allContacts[0]}, NULL, 'AI Strategy Workshop', 'initiated', true, true, false, '2026-04-15', false, 'Pre-work materials being prepared', 'Pre-work & Prep', false, 'Workshop Day', false, 'Summary Report', false, 'Follow-up Session', false),
        (${allDeals[9] || allDeals[0]}, ${allContacts[9] || allContacts[0]}, ${allCompanies[4] || allCompanies[0]}, 'Market Intelligence Report', 'in-progress', true, true, true, '2026-03-18', true, 'Data collection phase', 'Brief & Scope', true, 'Data Collection', false, 'Analysis', false, 'Report Delivery', false),
        (${allDeals[10] || allDeals[0]}, ${allContacts[10] || allContacts[0]}, NULL, 'Talent Mapping', 'initiated', false, true, false, NULL, false, 'Awaiting payment to begin', 'Brief & Scope', false, 'Research Phase', false, 'Mapping & Analysis', false, 'Report & Presentation', false),
        (${allDeals[11] || allDeals[0]}, ${allContacts[11] || allContacts[0]}, NULL, 'Regulatory Compliance', 'in-progress', true, true, true, '2026-03-22', true, 'Regulatory landscape research', 'Scope Definition', true, 'Regulatory Research', true, 'Gap Analysis', false, 'Roadmap & Filing', false),
        (${allDeals[12] || allDeals[0]}, ${allContacts[12] || allContacts[0]}, NULL, 'Board Advisory', 'in-progress', true, true, true, '2026-03-05', true, 'Monthly retainer - Q2 active', 'Onboarding', true, 'Q1 Advisory', true, 'Q2 Advisory', false, 'Annual Review', false),
        (${allDeals[13] || allDeals[0]}, ${allContacts[13] || allContacts[0]}, NULL, 'Fractional CFO', 'initiated', true, true, false, '2026-04-10', false, 'Setting up financial systems access', 'Onboarding', false, 'Financial Review', false, 'Monthly Cadence', false, 'Quarterly Planning', false),
        (${allDeals[14] || allDeals[0]}, ${allContacts[14] || allContacts[0]}, ${allCompanies[5] || allCompanies[0]}, 'AI Ops Optimization', 'in-progress', true, true, true, '2026-03-28', true, 'Process mining phase', 'Process Audit', true, 'Opportunity Scoring', false, 'Solution Design', false, 'Implementation', false)
    `);
    console.log('Seeded 15 onboarding workflows');

    await client.query('COMMIT');

    // Print final counts
    const tables = ['candidates', 'companies', 'deals', 'partners', 'payments', 'orders', 'websites', 'onboarding_workflows',
      'contacts', 'insights', 'opportunities', 'service_packages', 'meetings', 'consultations',
      'customers', 'bookings', 'reviews', 'campaigns', 'leads', 'social_posts', 'notifications',
      'seo_audits', 'keyword_rankings', 'analytics_events', 'businesses', 'users'];

    console.log('\n--- Final Counts ---');
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
      const count = parseInt(r.rows[0].count);
      const flag = count < 15 ? ' *** UNDER 15 ***' : '';
      console.log(`${t}: ${count}${flag}`);
    }

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

seedAll();
