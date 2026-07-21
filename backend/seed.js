const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { getDatabaseConfig } = require('./config');

const pool = new Pool({
  connectionString: getDatabaseConfig().databaseUrl,
});

async function seed() {
  if (process.env.NODE_ENV === 'production' || process.env.CONFIRM_DESTRUCTIVE_RESET !== 'muhittin_platform') {
    throw new Error('Destructive demo reset refused. Set CONFIRM_DESTRUCTIVE_RESET=muhittin_platform outside production to continue.');
  }
  const client = await pool.connect();
  try {
    // Drop tables
    await client.query(`
      DROP TABLE IF EXISTS opportunity_events CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
      DROP TABLE IF EXISTS onboarding_workflows CASCADE;
      DROP TABLE IF EXISTS meetings CASCADE;
      DROP TABLE IF EXISTS opportunities CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS deals CASCADE;
      DROP TABLE IF EXISTS consultations CASCADE;
      DROP TABLE IF EXISTS service_packages CASCADE;
      DROP TABLE IF EXISTS candidates CASCADE;
      DROP TABLE IF EXISTS partners CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS insights CASCADE;
      DROP TABLE IF EXISTS case_studies CASCADE;
      DROP TABLE IF EXISTS industries CASCADE;
      DROP TABLE IF EXISTS keyword_rankings CASCADE;
      DROP TABLE IF EXISTS seo_audits CASCADE;
      DROP TABLE IF EXISTS analytics_events CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS social_posts CASCADE;
      DROP TABLE IF EXISTS websites CASCADE;
      DROP TABLE IF EXISTS leads CASCADE;
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS businesses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'owner',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE businesses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        description TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website_url VARCHAR(500),
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        hours TEXT,
        services TEXT,
        pricing_info TEXT,
        logo_url VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address VARCHAR(500),
        city VARCHAR(100),
        tags TEXT,
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        total_spent DECIMAL(10,2) DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        last_visit DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        service_name VARCHAR(255),
        date DATE NOT NULL,
        time_slot VARCHAR(50),
        duration_minutes INTEGER DEFAULT 60,
        price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        customer_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        response TEXT,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE campaigns (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        subject VARCHAR(500),
        content TEXT,
        target_audience VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        recipients INTEGER DEFAULT 0,
        opens INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE leads (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        value DECIMAL(10,2),
        notes TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE websites (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        page_title VARCHAR(255),
        slug VARCHAR(255),
        template VARCHAR(100),
        headline VARCHAR(500),
        subheadline TEXT,
        cta_text VARCHAR(255),
        cta_link VARCHAR(500),
        sections TEXT,
        published BOOLEAN DEFAULT false,
        visits INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE social_posts (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        platform VARCHAR(50),
        content TEXT,
        image_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        likes INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        link VARCHAR(500),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE seo_audits (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        overall_score INTEGER DEFAULT 0,
        google_business_claimed BOOLEAN DEFAULT false,
        nap_consistent BOOLEAN DEFAULT false,
        website_mobile_friendly BOOLEAN DEFAULT false,
        ssl_enabled BOOLEAN DEFAULT false,
        meta_tags_optimized BOOLEAN DEFAULT false,
        schema_markup BOOLEAN DEFAULT false,
        page_speed_score INTEGER DEFAULT 0,
        reviews_avg DECIMAL(2,1) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        photos_count INTEGER DEFAULT 0,
        posts_last_30_days INTEGER DEFAULT 0,
        citations_count INTEGER DEFAULT 0,
        backlinks_count INTEGER DEFAULT 0,
        domain_authority INTEGER DEFAULT 0,
        monthly_searches INTEGER DEFAULT 0,
        monthly_impressions INTEGER DEFAULT 0,
        monthly_clicks INTEGER DEFAULT 0,
        avg_position DECIMAL(4,1) DEFAULT 0,
        recommendations TEXT,
        last_audit_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE keyword_rankings (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        keyword VARCHAR(255) NOT NULL,
        position INTEGER,
        previous_position INTEGER,
        search_volume INTEGER DEFAULT 0,
        difficulty INTEGER DEFAULT 0,
        url VARCHAR(500),
        location VARCHAR(100),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE analytics_events (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        event_type VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed users
    const demoPassword = process.env.DEMO_ADMIN_PASSWORD;
    if (!demoPassword || demoPassword.length < 12) throw new Error('DEMO_ADMIN_PASSWORD must contain at least 12 characters.');
    const hashedPassword = await bcrypt.hash(demoPassword, 12);
    await client.query(`
      INSERT INTO users (email, password, name, phone, role) VALUES
      ('demo@muhittin.com', $1, 'Demo User', '555-0100', 'owner'),
      ('sarah@muhittin.com', $1, 'Sarah Johnson', '555-0101', 'owner'),
      ('mike@muhittin.com', $1, 'Mike Chen', '555-0102', 'owner'),
      ('lisa@muhittin.com', $1, 'Lisa Martinez', '555-0103', 'manager'),
      ('tom@muhittin.com', $1, 'Tom Wilson', '555-0104', 'staff');
    `, [hashedPassword]);

    // Seed businesses — 15 per category, 8 categories = 120 businesses (REAL TX businesses)
    // Healthcare (1-15)
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'South Austin Dental Associates', 'Healthcare', 'Dentist', 'Cosmetic and family dentistry with modern technology in South Austin.', '(512) 444-1133', 'info@southaustindental.com', 'https://southaustindentalassociates.com', '4419 Frontier Trail, Suite 104', 'Austin', 'TX', '78745', 'Mon-Fri 8am-5pm', 'Cosmetic Dentistry, Veneers, Whitening, Invisalign, Implants, Crowns, Pediatric, Emergency', 'Cleaning $150, Whitening from $300, Invisalign from $3500', 4.8, 247, 'active'),
      (2, 'Walden Dental', 'Healthcare', 'Dentist', 'Modern family dentistry with same-day crowns and Invisalign.', '(512) 883-8450', 'info@waldendental.com', 'https://www.waldendentaltx.com', '9800 N Lake Creek Pkwy, Suite 150', 'Austin', 'TX', '78717', 'Mon-Fri 8am-5pm, Sat 9am-2pm', 'Invisalign, Same-Day Crowns, ZOOM Whitening, Implants, Veneers, Family Dentistry', 'Exam $120, Same-day crown $900, ZOOM whitening $400', 4.6, 189, 'active'),
      (3, 'Sunrise Dental Center', 'Healthcare', 'Dentist', 'Comprehensive dental care including implants and orthodontics in Houston Heights.', '(713) 869-9973', 'info@sunrisedentalsmile.com', 'https://www.sunrisedentalsmile.com', '2707 N Shepherd Dr', 'Houston', 'TX', '77008', 'Mon-Fri 8am-6pm, Sat 9am-3pm', 'All-on-4 Implants, Invisalign, Root Canals, Sedation Dentistry, Emergency', 'Cleaning $150, Implant from $2500, Root canal from $800', 4.9, 312, 'active'),
      (1, 'Pediatric Associates of Dallas', 'Healthcare', 'Pediatrician', 'Board-certified pediatric physicians with 24-hour nurse line and telemedicine.', '(214) 369-7661', 'info@paddallas.com', 'https://paddallas.com', '7859 Walnut Hill Lane, Suite 200', 'Dallas', 'TX', '75230', 'Mon-Fri 8am-5pm, Sat 9am-12pm', 'Well-Child Visits, Immunizations, ADHD Screening, Autism Testing, Speech Therapy', 'Well visit $180, Sick visit $150, Telemedicine $100', 4.7, 156, 'active'),
      (2, 'Clinical Pediatric Associates', 'Healthcare', 'Pediatrician', 'Comprehensive pediatric care with same-day sick appointments in Dallas.', '(214) 368-3659', 'info@clinicalpediatrics.com', 'https://www.clinicalpediatrics.com', '8355 Walnut Hill Lane, Suites 205', 'Dallas', 'TX', '75231', 'Mon-Fri 8am-5pm', 'Well-Baby Visits, Same-Day Sick Visits, Immunizations, Developmental Assessments', 'Well visit $175, Sick visit $140, After-hours advice included', 4.5, 203, 'active'),
      (3, 'Heritage Pediatrics', 'Healthcare', 'Pediatrician', 'General pediatric care for infants through adolescents in San Antonio.', '(210) 804-2301', 'info@heritagepediatrics.com', 'https://www.heritagepediatrics.com', '8031 Broadway Street', 'San Antonio', 'TX', '78209', 'Mon-Fri 8am-5pm', 'General Pediatric Care, Vaccine Administration, Same-Day Sick Visits, Newborn Care', 'Well visit $180, Sick visit $150, Flu shot $40', 4.4, 178, 'active'),
      (1, 'Houston Dermatology Associates', 'Healthcare', 'Dermatologist', 'Board-certified dermatologists offering medical and cosmetic treatments.', '(713) 790-0058', 'info@houstonderm.com', 'https://www.houstondermatologyassociates.com', '6560 Fannin Street, Suite 1720', 'Houston', 'TX', '77030', 'Mon-Fri 8am-5pm', 'Skin Cancer, Mole Removal, Botox, Fillers, Laser, CoolSculpting, Microneedling', 'Consultation $200, Botox $12/unit, CoolSculpting from $750', 4.8, 134, 'active'),
      (2, 'Allustra Dermatology', 'Healthcare', 'Dermatologist', 'Comprehensive dermatology including pediatric and surgical care.', '(713) 868-5861', 'info@allustradermatology.com', 'https://www.allustradermatology.com', '1740 W 27th Street, Suite 315', 'Houston', 'TX', '77008', 'Mon-Fri 8am-5pm', 'Acne, Eczema, Psoriasis, Botox, Dysport, IPL, Laser Therapy, Pediatric Dermatology', 'Consultation $175, Botox $14/unit, IPL $350', 4.9, 267, 'active'),
      (3, 'Bellaire Dermatology', 'Healthcare', 'Dermatologist', 'Medical and cosmetic dermatology serving the Bellaire area since 1985.', '(713) 661-4383', 'info@bellairedermatology.com', 'https://www.bellairedermatology.com', '6565 West Loop S, Suite 800', 'Bellaire', 'TX', '77401', 'Mon-Fri 8am-5pm', 'Chemical Peels, Laser Hair Reduction, Botox, Acne, Skin Cancer, Rosacea', 'Microdermabrasion $150, Chemical peel from $200, Laser from $300', 4.3, 445, 'active'),
      (1, 'Chiropractic Centers of Texas', 'Healthcare', 'Chiropractor', 'Advanced chiropractic care with laser therapy and spinal decompression.', '(210) 828-2665', 'info@chiropracticcenterstx.com', 'https://www.chiropracticcentersoftexas.com', '147 W Sunset Rd, Suite 101', 'San Antonio', 'TX', '78209', 'Mon-Fri 8am-6pm', 'PERFORM Better Protocol, Low Level Laser, Spinal Decompression, Sports Injury', 'First visit $75, Adjustment $55, Decompression $85', 4.7, 98, 'active'),
      (2, 'San Antonio Family Chiropractic', 'Healthcare', 'Chiropractor', 'Family chiropractic care including pediatric and prenatal adjustments.', '(210) 699-0158', 'info@safamilychiro.com', 'https://www.safamilychiro.com', '9386 Huebner Rd, Suite 100', 'San Antonio', 'TX', '78240', 'Mon-Fri 9am-6pm', 'Chiropractic Adjustments, Pediatric Care, Scoliosis, Back Pain, Headache Treatment', 'Adjustment $60, Package of 10 $500, Family plan available', 4.5, 112, 'active'),
      (3, 'Owen Chiropractic & Wellness', 'Healthcare', 'Chiropractor', 'Active Release Technique and chiropractic for all ages.', '(210) 549-3297', 'info@owenchiropractic.com', 'https://www.owenchiropractic.com', '8018 Broadway St, Suite 101', 'San Antonio', 'TX', '78209', 'Mon-Fri 8am-6pm', 'Active Release Technique, Chiropractic Care, Back Pain, Neck Pain, Wellness', 'First visit $85, Adjustment $55, ART session $75', 4.8, 289, 'active'),
      (1, 'First Eye Care Fort Worth', 'Healthcare', 'Optometrist', 'Comprehensive eye exams and disease management in Fort Worth.', '(817) 346-2020', 'info@firsteyecarefw.com', 'https://www.firsteyecarefortworth.com', '3608 Altamesa Blvd', 'Fort Worth', 'TX', '76133', 'Mon-Fri 9am-6pm, Sat 9am-1pm', 'Eye Exams, Contact Lenses, Glaucoma, Cataracts, Macular Degeneration, Emergencies', 'Eye exam $99, Contacts fitting $50, Frames from $129', 4.6, 87, 'active'),
      (2, 'Eyes Fort Worth', 'Healthcare', 'Optometrist', 'Eye care and designer eyewear on Camp Bowie Boulevard.', '(817) 738-9301', 'info@eyesfortworth.com', 'https://www.eyesfortworth.com', '6333 Camp Bowie Blvd, Suite 272', 'Fort Worth', 'TX', '76116', 'Mon-Fri 9am-5:30pm', 'Comprehensive Eye Exams, Eyeglasses, Contact Lenses, Eye Disease Treatment', 'Exam $110, Premium frames from $200, Contact fitting $65', 4.7, 145, 'active'),
      (3, 'ATX Optometry', 'Healthcare', 'Optometrist', 'Modern eye care with myopia management and dry eye therapy.', '(512) 890-2020', 'info@atxoptometry.com', 'https://www.atxoptometry.com', '10000 Research Blvd, Suite 150', 'Austin', 'TX', '78759', 'Mon-Fri 9am-6pm', 'Myopia Management, Dry Eye Therapy, Contact Lenses, Scleral Lenses, Keratoconus', 'Exam $125, Specialty contact fitting $100, Dry eye consult $85', 4.5, 167, 'active');
    `);

    // Legal (16-30) — REAL TX law firms
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Graves Dougherty Hearon & Moody', 'Legal', 'Business Law', 'Full-service Austin law firm serving businesses since 1946.', '(512) 480-5600', 'info@gdhm.com', 'https://www.gdhm.com', '401 Congress Avenue, Suite 2700', 'Austin', 'TX', '78701', 'Mon-Fri 8am-6pm', 'Litigation, Bankruptcy, Corporate Law, IP, Energy, Real Estate, Banking', 'Hourly from $350, Corporate retainer from $5000', 4.8, 234, 'active'),
      (2, 'Winstead PC', 'Legal', 'Corporate', 'National full-service law firm with deep Texas roots.', '(512) 370-2800', 'info@winstead.com', 'https://www.winstead.com', '600 W 5th Street, Suite 900', 'Austin', 'TX', '78701', 'Mon-Fri 8am-6pm', 'Corporate Transactions, Litigation, Real Estate, Financial Services, Healthcare', 'Consultation from $300, Hourly $350-600', 4.7, 156, 'active'),
      (3, 'McGinnis Lochridge', 'Legal', 'Litigation', 'Business-focused law firm handling complex commercial matters.', '(512) 495-6000', 'info@mcginnislaw.com', 'https://www.mcginnislaw.com', '1111 W 6th Street, Building B, Suite 400', 'Austin', 'TX', '78703', 'Mon-Fri 8am-6pm', 'Commercial Financing, M&A, IP, Insurance, Environmental, Employment, Tax', 'Consultation $250, Hourly $300-550', 4.6, 312, 'active'),
      (1, 'Jackson Walker LLP', 'Legal', 'Full Service', 'One of Texas largest law firms serving businesses statewide.', '(214) 953-6000', 'info@jw.com', 'https://www.jw.com', '2323 Ross Avenue, Suite 600', 'Dallas', 'TX', '75201', 'Mon-Fri 8am-6pm', 'Real Estate, Litigation, Healthcare, Trusts, Bankruptcy, Corporate, IP, Tax', 'Hourly from $400, Retainer based', 4.4, 189, 'active'),
      (2, 'Thompson Law Injury Lawyers', 'Legal', 'Personal Injury', 'Aggressive personal injury representation — no win, no pay.', '(214) 609-1527', 'contact@1800lionlaw.com', 'https://1800lionlaw.com', '3300 Oak Lawn Avenue, Suite 300', 'Dallas', 'TX', '75219', 'Mon-Fri 8am-6pm', 'Car Accidents, Truck Accidents, Motorcycle, Wrongful Death, Catastrophic Injury', 'Free consultation, Contingency fee only', 4.9, 98, 'active'),
      (3, 'The Jimenez Law Firm', 'Legal', 'Family Law', 'Board-certified family law attorneys in Dallas.', '(214) 513-3614', 'info@jimenezlawfirm.com', 'https://www.thejimenezlawfirm.com', '8080 N Central Expressway, Suite 1700', 'Dallas', 'TX', '75206', 'Mon-Fri 9am-6pm', 'Divorce, Child Custody, Child Support, Family Law Litigation', 'Consultation $250, Retainer from $5000', 4.6, 145, 'active'),
      (1, 'Baker Botts LLP', 'Legal', 'Energy Law', 'Global law firm headquartered in Houston — energy and corporate leader.', '(713) 229-1234', 'info@bakerbotts.com', 'https://www.bakerbotts.com', '910 Louisiana Street', 'Houston', 'TX', '77002', 'Mon-Fri 8am-6pm', 'Corporate, Energy, Technology, Litigation, IP, Tax, Banking, Real Estate', 'Hourly from $500, Major transaction retainers', 4.5, 178, 'active'),
      (2, 'Andrews Myers PC', 'Legal', 'Construction Law', 'Houston construction and business law specialists.', '(713) 850-4200', 'info@andrewsmyers.com', 'https://www.andrewsmyers.com', '1885 Saint James Place, 15th Floor', 'Houston', 'TX', '77056', 'Mon-Fri 8am-6pm', 'Construction Law, Real Estate, Corporate, Employment, Energy, Bankruptcy', 'Consultation $200, Hourly $300-500', 4.3, 112, 'active'),
      (3, 'Law Offices of Ned Barnett', 'Legal', 'Criminal Defense', 'Experienced criminal defense with former prosecutor insight.', '(713) 222-6767', 'info@nedbarnett.com', 'https://www.nedbarnett.com', '8441 Gulf Freeway, Suite 210', 'Houston', 'TX', '77017', 'Mon-Fri 8am-8pm', 'DWI/DUI, Sex Crimes, Federal Crimes, Drug Crimes, Assault, Expungements', 'Free consultation, Flat fees from $2500', 4.4, 87, 'active'),
      (1, 'Porter Hedges LLP', 'Legal', 'Corporate', 'Houston-based business law firm with energy and finance focus.', '(713) 226-6000', 'info@porterhedges.com', 'https://www.porterhedges.com', '1000 Main Street, 36th Floor', 'Houston', 'TX', '77002', 'Mon-Fri 8am-6pm', 'Bankruptcy, Commercial Lending, Corporate, Energy, IP, Litigation, Real Estate, Tax', 'Hourly from $400, Corporate retainers', 4.7, 67, 'active'),
      (2, 'Carabin Shaw', 'Legal', 'Personal Injury', 'San Antonio injury lawyers — auto accidents and workplace injuries.', '(800) 862-1260', 'info@carabinshaw.com', 'https://www.carabinshaw.com', '875 E Ashby Place, Suite 1100', 'San Antonio', 'TX', '78212', 'Mon-Fri 8am-6pm', 'Auto Accidents, Trucking, Wrongful Death, Workplace Injuries, Medical Malpractice', 'Free consultation, No upfront cost', 4.5, 134, 'active'),
      (3, 'Gamez Law Firm', 'Legal', 'Personal Injury', 'San Antonio personal injury attorneys fighting for fair compensation.', '(210) 736-4040', 'info@joegamezlaw.com', 'https://joegamezlaw.com', '2943 Mossrock', 'San Antonio', 'TX', '78230', 'Mon-Fri 8am-6pm', 'Motor Vehicle Accidents, Workplace Accidents, Premises Liability, Wrongful Death', 'Free consultation, Contingency only', 4.8, 78, 'active'),
      (1, 'Kreager Mitchell', 'Legal', 'Estate Planning', 'Estate planning and business law in San Antonio since 1974.', '(210) 829-7722', 'info@kreagermitchell.com', 'https://kreagermitchell.com', '7373 Broadway Street, Suite 500', 'San Antonio', 'TX', '78209', 'Mon-Fri 9am-5pm', 'Wills, Trust Agreements, Powers of Attorney, Business Law, Tax Law, Real Estate', 'Will from $500, Trust from $2000, Business formation $1500', 4.6, 56, 'active'),
      (2, 'Kelly Hart & Hallman', 'Legal', 'Full Service', 'Fort Worth full-service law firm with 100+ year history.', '(817) 332-2500', 'info@kellyhart.com', 'https://www.kellyhart.com', '201 Main Street, Suite 2500', 'Fort Worth', 'TX', '76102', 'Mon-Fri 8am-6pm', 'Aviation, Banking, Bankruptcy, Corporate, Environmental, Estate, Healthcare, IP, Oil & Gas', 'Hourly from $350, Corporate retainers available', 4.4, 92, 'active'),
      (3, 'Sisemore Law Firm', 'Legal', 'Family Law', 'Fort Worth family law specialists for high-net-worth divorce and custody.', '(817) 336-4444', 'info@thetxattorneys.com', 'https://www.thetxattorneys.com', '603 E Belknap Street, Suite 100', 'Fort Worth', 'TX', '76102', 'Mon-Fri 9am-6pm', 'High-Net-Worth Divorce, Child Custody, Child Support, Mediation', 'Consultation $250, Retainer from $5000', 4.5, 103, 'active');
    `);

    // Home Services (31-45) — REAL TX home service businesses
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Stan''s Heating, Air, Plumbing & Electrical', 'Home Services', 'Plumber', 'Serving Austin since 1954 — plumbing, HVAC, and electrical.', '(512) 929-9393', 'info@stansac.com', 'https://www.stansac.com', '6016 Dillard Cir', 'Austin', 'TX', '78752', '24/7 Emergency Available', 'AC Install, Furnace Repair, Drain Cleaning, Water Heater, Electrical Panels', 'Service call $89, AC repair from $150, Panel upgrade from $1500', 4.7, 387, 'active'),
      (2, 'Village Plumbing, Air & Electric', 'Home Services', 'Plumber', 'Full-service plumbing, HVAC, and electrical for Houston area.', '(713) 369-2290', 'info@villageplumbing.com', 'https://villageplumbing.com', '10644 W Little York Rd, Suite 200', 'Houston', 'TX', '77041', 'Mon-Sat 7am-7pm, Emergency 24/7', 'HVAC Repair, Plumbing Repair, Electrical Services, Water Heaters', 'Service call $79, Drain cleaning from $150, Water heater from $800', 4.6, 245, 'active'),
      (3, 'Mister Sparky DFW', 'Home Services', 'Electrician', '24-hour emergency electrical service with 100% satisfaction guarantee.', '(214) 414-2727', 'info@mistersparky-dfw.com', 'https://www.mistersparky-dfw.com', '4827 W Royal Lane, Suite B', 'Dallas', 'TX', '75229', 'Mon-Sat 7am-8pm, Emergency 24/7', 'Electrical Repair, Wiring, Panel Upgrades, Lighting, Ceiling Fans, EV Chargers', 'Service call $79, Panel upgrade from $1500, Lighting from $200', 4.5, 198, 'active'),
      (1, 'Rhino Roofers', 'Home Services', 'Roofer', 'San Antonio roofing with 50-year warranty and lifetime workmanship.', '(210) 361-7663', 'info@rhinoroofers.com', 'https://rhinoroofers.com', '4949 N Loop 1604 W, Suite 250', 'San Antonio', 'TX', '78249', 'Mon-Sat 7am-6pm', 'Roof Repair, Replacement, Inspections, Storm Damage, Gutters, Metal Roofing', 'Free inspection, Roof from $6000, Repair from $300', 4.4, 312, 'active'),
      (2, 'Presidio Roofing Company', 'Home Services', 'Roofer', 'Owens Corning Platinum Preferred Contractor in San Antonio.', '(210) 899-5600', 'info@presidioroof.com', 'https://presidioroof.com', '1231 Safari St', 'San Antonio', 'TX', '78216', 'Mon-Sat 7am-6pm', 'Roof Repair, Replacement, Residential, Commercial, Tile Repair, Gutters', 'Free estimate, Shingle roof from $5500, Tile repair from $500', 4.8, 156, 'active'),
      (3, 'Air Depot Cooling & Heating', 'Home Services', 'HVAC', 'AC repair and installation serving greater Houston area.', '(281) 477-3700', 'info@airdepot.com', 'https://airdepot.com', '12920 Cypress North Houston Rd', 'Cypress', 'TX', '77429', 'Mon-Sat 7am-8pm, Emergency 24/7', 'AC Repair, AC Installation, Heating, HVAC Maintenance, Indoor Air Quality', 'Tune-up $89, AC repair from $150, New system from $4500', 4.6, 178, 'active'),
      (1, 'New Day Landscaping', 'Home Services', 'Landscaper', 'Full-service landscaping and property restoration in Fort Worth.', '(817) 760-0479', 'info@newdaylandscaping.net', 'https://www.newdaylandscaping.net', '3205 Minot Ave', 'Fort Worth', 'TX', '76133', 'Mon-Sat 7am-5pm', 'Lawn Mowing, Irrigation, Tree Trimming, Hardscaping, Yard Cleanups', 'Mow from $40, Design from $500, Irrigation from $2000', 4.3, 234, 'active'),
      (2, 'FNA Landscape', 'Home Services', 'Landscaper', 'Commercial and residential landscape design and maintenance.', '(817) 249-8084', 'info@fnalandscape.com', 'https://www.fnalandscape.com', '7520 Benbrook Parkway', 'Fort Worth', 'TX', '76126', 'Mon-Fri 7am-5pm', 'Landscape Design, Installation, Maintenance, Irrigation, Commercial', 'Design from $500, Monthly maintenance from $200, Irrigation from $1500', 4.5, 145, 'active'),
      (3, 'D3 Painting Services', 'Home Services', 'Painter', 'Interior and exterior painting for residential and commercial.', '(281) 906-9208', 'info@d3painting.com', 'https://www.d3painting.com', '5750 N Sam Houston Pkwy E, Suite 510', 'Houston', 'TX', '77032', 'Mon-Sat 7am-6pm', 'Interior Painting, Exterior Painting, Drywall Repair, Floor Coatings, Staining', 'Room from $300, Exterior from $2500, Cabinets from $1800', 4.7, 267, 'active'),
      (1, 'A-Tex Pest Management', 'Home Services', 'Pest Control', 'Residential and commercial pest control serving Austin since 2002.', '(512) 714-3383', 'info@atexpest.com', 'https://www.atexpest.com', '208 A Commerce Blvd', 'Round Rock', 'TX', '78664', 'Mon-Sat 8am-6pm', 'Termites, Rodents, Bed Bugs, Ants, Mosquitoes, Wildlife Removal', 'One-time $175, Monthly plan $45, Termite from $800', 4.4, 198, 'active'),
      (2, 'Hank''s Handyman Services', 'Home Services', 'Handyman', 'DFW metroplex handyman for all home repairs.', '(469) 304-0535', 'info@callhanks.com', 'https://callhanks.com', '6010 W Spring Creek Pkwy, Suite 349', 'Plano', 'TX', '75024', 'Mon-Sat 8am-6pm', 'Carpentry, Drywall, Door Repairs, Appliance Install, Painting, Tile', 'Hourly $75, Half day $275, Full day $500', 4.6, 112, 'active'),
      (3, 'ABC Home & Commercial Services', 'Home Services', 'Multi-Service', 'Family-owned since 1949 — pest, plumbing, HVAC, lawn, electrical.', '(512) 837-9500', 'info@abchomeandcommercial.com', 'https://www.abchomeandcommercial.com/austin', '9475 US-290', 'Austin', 'TX', '78724', 'Mon-Sat 7am-7pm', 'Pest Management, Plumbing, HVAC, Lawn Care, Electrical, Wildlife', 'Pest plan from $50/mo, AC tune-up $89, Lawn care from $45', 4.5, 89, 'active'),
      (1, 'Gueldner Electric', 'Home Services', 'Electrician', 'Residential and commercial electrical services in San Antonio.', '(210) 828-1378', 'info@gueldnerelectric.com', 'https://www.gueldnerelectric.com', '247 W Olmos Dr, Suite 100', 'San Antonio', 'TX', '78212', 'Mon-Fri 7am-5pm', 'Residential Electrical, Commercial, Panel Upgrades, Wiring, Lighting', 'Service call $79, Panel upgrade from $1200, Wiring from $200', 4.7, 134, 'active'),
      (2, 'Davila Electric', 'Home Services', 'Electrician', 'Electrical installation and repair since 1967 in San Antonio.', '(210) 436-1551', 'info@davilaelectric.com', 'https://www.davilaelectric.com', '1842 Bandera Rd', 'San Antonio', 'TX', '78228', 'Mon-Fri 7am-5pm', 'Residential Electrical, Commercial, Lighting, Wiring, Panel Work', 'Service call $75, Lighting install from $150, Panel from $1000', 4.6, 156, 'active'),
      (3, 'CertaPro Painters Houston', 'Home Services', 'Painter', 'Professional painting with color consultation for Houston homes.', '(713) 824-5166', 'info@certapro-houston.com', 'https://certapro.com/central-northeast-houston', '8584 Katy Freeway, Suite 305', 'Houston', 'TX', '77024', 'Mon-Sat 7am-6pm', 'Interior Painting, Exterior Painting, Cabinet Painting, Color Consultation', 'Room from $350, Exterior from $3000, Cabinet painting from $2000', 4.5, 203, 'active');
    `);

    // Beauty (46-60) — REAL TX beauty businesses
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Urban Betty Salon & Spa', 'Beauty', 'Hair Salon', 'Austin salon offering hair, facials, waxing, and bridal services.', '(512) 371-7663', 'info@urbanbetty.com', 'https://urbanbetty.com', '1206 W 38th Street, Suite 1107', 'Austin', 'TX', '78705', 'Tue-Sat 9am-8pm, Sun 10am-5pm', 'Haircuts, Hair Coloring, Balayage, Extensions, Facials, Waxing, Bridal', 'Women cut $55, Color from $95, Balayage from $180, Facial from $75', 4.9, 412, 'active'),
      (2, 'Jose Luis Salon', 'Beauty', 'Hair Salon', 'Austin salon known for precision cuts and color transformations.', '(512) 474-1146', 'info@joseluissalon.com', 'https://joseluissalon.com', '3100 Esperanza Crossing, Suite 124', 'Austin', 'TX', '78758', 'Tue-Sat 9am-7pm', 'Precision Haircuts, Color Transformations, Extensions, Makeup, Bridal', 'Cut from $65, Color from $120, Extensions from $400', 4.8, 298, 'active'),
      (3, 'Method Hair', 'Beauty', 'Hair Salon', 'East Austin salon specializing in curly, textured, and all hair types.', '(512) 469-0044', 'info@methodhair.com', 'https://www.methodhair.com', '1800 E 4th St, Suite 103', 'Austin', 'TX', '78702', 'Tue-Sat 10am-7pm', 'Precision Cuts, Color, Perm, Relaxer, Keratherapy, Head Spa, Blowouts', 'Cut from $60, Color from $100, Head spa $90, Keratin from $250', 4.6, 234, 'active'),
      (1, 'Dantara Thai Wellness & Spa', 'Beauty', 'Spa', 'Thai-inspired wellness and spa treatments in Dallas.', '(945) 899-6395', 'info@dantaraspa.com', 'https://www.dantaraspa.com', '18810 Preston Rd', 'Dallas', 'TX', '75252', 'Daily 10am-8pm', 'Thai Massage, Deep Tissue, Rejuvenating Facials, Botanical Massage', 'Massage from $85, Facial from $75, Couples package $250', 4.7, 178, 'active'),
      (2, 'Sanjiva Med Spa', 'Beauty', 'Med Spa', 'Medical aesthetics including Hydrafacial, Botox, and body contouring.', '(214) 245-9999', 'info@sanjivamedspa.com', 'https://sanjivamedspa.com', '5633 W Lovers Ln', 'Dallas', 'TX', '75209', 'Mon-Sat 9am-7pm', 'Hydrafacial, Botox, Fillers, PDO Threads, Microneedling, Laser, IV Hydration', 'Botox $12/unit, Filler from $600, Hydrafacial from $200', 4.5, 145, 'active'),
      (3, 'Pure Spa and Salon', 'Beauty', 'Spa', 'Full-service spa and salon in Dallas Mockingbird Station area.', '(214) 827-4200', 'info@purespaandsalon.com', 'https://www.purespaandsalon.com', '5555 E Mockingbird Ln, Suite 300', 'Dallas', 'TX', '75206', 'Tue-Sat 9am-8pm, Sun 10am-5pm', 'Deep Tissue Massage, Swedish, Facials, Haircuts, Brazilian Blowout, Body Wraps', 'Massage from $90, Facial from $80, Haircut from $55', 4.8, 267, 'active'),
      (1, 'Milano Nail Spa The Heights', 'Beauty', 'Nail Salon', 'Upscale nail spa in Houston Heights with complimentary drinks.', '(832) 650-0777', 'info@milanonailspa.com', 'https://milanonailspatheheights.com', '2799 Katy Fwy, Suite 130', 'Houston', 'TX', '77007', 'Mon-Sat 9am-8pm, Sun 10am-6pm', 'Manicure, Pedicure, Nail Design, Gel-X, Waxing, Lash Extensions', 'Mani $30, Pedi $45, Gel mani $50, Lash extensions from $120', 4.9, 189, 'active'),
      (2, 'Gloss Nail Bar', 'Beauty', 'Nail Salon', 'Houston nail bar with Gel-X extensions and luxury pedicures.', '(281) 974-2828', 'info@glossnail.bar', 'https://glossnail.bar', '504 W Gray St, Suite B', 'Houston', 'TX', '77019', 'Mon-Sat 9am-8pm', 'Gel-X Extensions, Builder Gel, Nail Art, Luxury Pedicures, Acrylic', 'Gel-X from $75, Builder gel $65, Luxury pedi $60', 4.6, 312, 'active'),
      (3, 'It''s a Secret Med Spa', 'Beauty', 'Med Spa', 'Houston med spa with Morpheus8, CoolSculpting, and PRF treatments.', '(713) 452-1860', 'info@secretmedspa.com', 'https://secretmedspa.com/houston-tx', '4525 Washington Ave, Suite 200', 'Houston', 'TX', '77007', 'Mon-Sat 9am-7pm', 'Botox, Fillers, Morpheus8, CoolSculpting, Laser Hair Removal, Hydrafacial', 'Botox $11/unit, CoolSculpting from $750, Morpheus8 from $800', 4.7, 156, 'active'),
      (1, 'Los Barberos Classic Barbershop', 'Beauty', 'Barbershop', 'Classic barbershop with fades, hot towel shaves, and walk-ins welcome.', '(210) 370-3262', 'info@losbarberos.com', 'https://losbarberosclassicbarbershop.com', '443 McCarty Rd', 'San Antonio', 'TX', '78216', 'Mon-Sat 9am-7pm', 'Haircuts, Fades, Hot Towel Shaves, Beard Trims, Grooming', 'Cut $25, Cut & beard $35, Hot shave $30', 4.8, 234, 'active'),
      (2, 'Gevalis Barbershop', 'Beauty', 'Barbershop', 'Modern barbershop for men, women, and children in San Antonio.', '(210) 957-1374', 'info@gevalisbarbershop.com', 'https://gevalisbarbershop.com', '5619 West Loop 1604 North, Suite 116', 'San Antonio', 'TX', '78253', 'Tue-Sat 9am-7pm', 'Haircuts, Fades, Beard Trims, Kids Cuts, Grooming', 'Men cut $28, Kids $18, Beard trim $15', 4.4, 198, 'active'),
      (3, 'All American Barbershop', 'Beauty', 'Barbershop', 'Walk-ins only barbershop near San Antonio River Walk.', '(210) 990-2100', 'info@allamericanbarbershop.com', 'https://www.allamericanbarbershopllc.com', '525 San Pedro Avenue', 'San Antonio', 'TX', '78212', 'Mon-Sat 9am-7pm', 'Haircuts, Fades, Shaves, Beard Trims, Walk-ins Only', 'Cut $22, Shave $20, Cut & beard $32', 4.7, 267, 'active'),
      (1, 'Amazing Lash Studio Fort Worth', 'Beauty', 'Lash Studio', 'Custom eyelash extensions in private suite experience.', '(682) 204-1382', 'info@amazinglash-fw.com', 'https://www.amazinglashstudio.com/studios/tx/fort-worth/alliance-town-center', '3110 Texas Sage Trail', 'Fort Worth', 'TX', '76177', 'Tue-Sat 9am-7pm', 'Classic Lashes, Volume Lashes, Lash Lifts, Brow Lamination, Brow Tinting', 'Classic full set $150, Volume $200, Lash lift $85, Brow lamination $65', 4.6, 123, 'active'),
      (2, 'Long Lash Studio', 'Beauty', 'Lash Studio', 'Lash extensions and lifts in Fort Worth Camp Bowie area.', '(817) 420-9079', 'info@longlashstudio.com', 'https://longlashstudio.com', '6115 Camp Bowie Blvd, Unit 112', 'Fort Worth', 'TX', '76116', 'Tue-Sat 9am-6pm', 'Eyelash Extensions, Lash Lifts, Waxing Services', 'Classic set $130, Hybrid $170, Volume $200, Lash lift $75', 4.8, 145, 'active'),
      (3, '413 Lash Studio', 'Beauty', 'Lash Studio', 'Private boutique lash studio by licensed esthetician in Fort Worth.', '(817) 675-5022', 'info@413lashstudio.com', 'https://www.413lashstudio.com', '9336 Team Ranch Rd, Suite 127', 'Fort Worth', 'TX', '76126', 'By Appointment', 'Lash Extensions, Natural Lash Lifts, Brow Lamination', 'Full set from $140, Lash lift $80, Brow lamination $60', 4.7, 203, 'active');
    `);

    // Fitness (61-75) — REAL TX fitness businesses
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Castle Hill Fitness', 'Fitness', 'Full-Service Gym', 'Austin gym with 80+ classes, spa, PT, and health coaching since 2002.', '(512) 478-4567', 'info@castlehillfitness.com', 'https://www.castlehillfitness.com', '1112 North Lamar Blvd', 'Austin', 'TX', '78703', 'Mon-Fri 5am-10pm, Sat-Sun 7am-8pm', 'Group Classes, Personal Training, Pilates, Spa, Yoga, Cycling, Nutrition', 'Monthly from $99, PT session $75, Spa massage from $85', 4.8, 187, 'active'),
      (2, 'Black Swan Yoga', 'Fitness', 'Yoga', 'Donation-based heated yoga in East Austin.', '(512) 960-4026', 'info@blackswanyoga.com', 'https://www.blackswanyoga.com', '913 E Cesar Chavez St', 'Austin', 'TX', '78702', 'Daily 6am-9pm', 'Heated Vinyasa Flow, Yoga Teacher Training, Online Classes', 'Donation-based, Membership $99/mo, Teacher training $2500', 4.7, 234, 'active'),
      (3, 'CrossFit Houston', 'Fitness', 'CrossFit', 'Houston CrossFit with Olympic lifting and strength conditioning.', '(832) 265-8195', 'info@crossfithouston.com', 'https://www.crossfithouston.com', '716 Telephone Rd', 'Houston', 'TX', '77023', 'Mon-Fri 5am-8pm, Sat 7am-12pm', 'CrossFit WODs, Olympic Weightlifting, Strength, Metabolic Conditioning', 'Unlimited $175/mo, 3x/week $140/mo, Drop-in $25', 4.9, 312, 'active'),
      (1, 'PURE Yoga Texas', 'Fitness', 'Yoga', 'Hot yoga studio with Bikram-style and vinyasa classes in Dallas.', '(214) 824-9642', 'info@pureyogatexas.com', 'https://www.pureyogatexas.com/dallas', '6333 E Mockingbird Ln #253', 'Dallas', 'TX', '75214', 'Daily 6am-9pm', 'Hot Yoga, Bikram, Vinyasa Flow, Beginner Yoga, Teacher Training', 'Single class $22, 10-class pass $180, Unlimited $150/mo', 4.6, 289, 'active'),
      (2, 'Life Time Highland Park', 'Fitness', 'Luxury Gym', 'Premium health club with pools, courts, spa, and kids activities.', '(214) 624-5800', 'info@lifetime-hp.com', 'https://www.lifetime.life/locations/tx/dallas-highland-park.html', '5910 N Central Expy', 'Dallas', 'TX', '75206', '24/7 Access', 'Full Fitness Floor, Group Studios, Swimming, Basketball, Spa, Kids', 'Monthly from $159, Family plans available', 4.7, 178, 'active'),
      (3, 'Fit180 Personal Training', 'Fitness', 'Personal Trainer', 'Private one-on-one personal training and body transformation.', '(214) 305-8578', 'info@fit180.com', 'https://fit180.com', '4245 N Central Expy', 'Dallas', 'TX', '75205', 'Mon-Sat 5am-9pm', 'Private Personal Training, Weight Loss, Strength, Nutrition Coaching', '1-on-1 $75/session, 10-pack $650, Nutrition plan $200', 4.5, 156, 'active'),
      (1, 'BODYBAR Pilates Dallas', 'Fitness', 'Pilates', 'Reformer Pilates classes in Uptown Dallas.', '(214) 520-2227', 'info@bodybarpilates.com', 'https://bodybarpilates.com/studios/dallas-uptown', '4514 Travis St Suite 125', 'Dallas', 'TX', '75205', 'Mon-Sat 6am-8pm, Sun 8am-5pm', 'Reformer Pilates, Mat Pilates, Full-Body Workouts, Private Sessions', 'Class $35, 10-pack $300, Unlimited $199/mo, Private $90', 4.8, 198, 'active'),
      (2, 'Gold''s Gym Rogers Ranch', 'Fitness', 'Gym', 'Full-service gym with group classes and personal training.', '(210) 408-9050', 'info@goldsgym-sa.com', 'https://www.goldsgym.com/locations/tx/san-antonio-rogers-ranch', '2711 Treble Creek', 'San Antonio', 'TX', '78258', 'Mon-Fri 5am-11pm, Sat-Sun 7am-9pm', 'Weight Training, Cardio, Group Exercise, Personal Training, Les Mills', 'Monthly $35, Annual $360, PT session $60', 4.6, 145, 'active'),
      (3, 'Dominion MMA', 'Fitness', 'Martial Arts', 'Mixed martial arts, BJJ, and Muay Thai in San Antonio.', '(210) 560-0662', 'info@dominionmma.com', 'https://www.dominionmma.com', '9910 N Loop 1604 Ste 109', 'San Antonio', 'TX', '78254', 'Mon-Sat 6am-9pm', 'MMA, Brazilian Jiu-Jitsu, Muay Thai, Boxing, Wrestling, Kids Classes', 'Unlimited $165/mo, 2x/week $120/mo, Kids $100/mo', 4.4, 112, 'active'),
      (1, 'Skyline CrossFit', 'Fitness', 'CrossFit', 'Houston Heights CrossFit with foundations course for beginners.', '(832) 409-2759', 'info@skylinecrossfit.com', 'https://www.skylinecrossfit.com', '551 N Shepherd Dr #200', 'Houston', 'TX', '77007', 'Mon-Fri 5am-8pm, Sat 8am-12pm', 'CrossFit Classes, Olympic Lifting, Gymnastics, Personal Training', 'Unlimited $175/mo, Foundations course $250, Drop-in $25', 4.7, 134, 'active'),
      (2, 'Hot Yoga Houston', 'Fitness', 'Yoga', 'Texas original hot yoga studio since 1995.', '(713) 529-0900', 'info@hotyogahouston.com', 'https://www.hotyogahouston.com', '2438 South Blvd', 'Houston', 'TX', '77098', 'Daily 6am-9pm', 'Hot Yoga, Bikram 26-Posture Series, Power Yoga, Vinyasa, Beginners', 'Single class $20, 10-class $170, Unlimited $149/mo', 4.5, 98, 'active'),
      (3, 'Ohana Academy', 'Fitness', 'Martial Arts', 'Brazilian Jiu-Jitsu and MMA academy in San Antonio.', '(210) 437-4227', 'info@ohanajiujitsu.com', 'https://ohanajiujitsu.com', '15032 San Pedro Ave', 'San Antonio', 'TX', '78232', 'Mon-Sat 6am-9pm', 'BJJ Gi & No-Gi, MMA, Striking, Kids Martial Arts, Women Self-Defense', 'Unlimited $160/mo, 2x/week $120/mo, Kids $90/mo', 4.8, 167, 'active'),
      (1, 'Love Cycling Studio', 'Fitness', 'Cycling', 'Music-driven indoor cycling with themed rides in Austin.', '(512) 524-1354', 'info@lovecyclingstudio.com', 'https://www.lovecyclingstudio.com', '507 Pressler St', 'Austin', 'TX', '78703', 'Mon-Sat 6am-8pm, Sun 8am-4pm', 'Rhythm Cycling, Endurance Rides, Theme Rides, Artist Rides', 'Single ride $25, 5-pack $110, 10-pack $200, Unlimited $180/mo', 4.6, 189, 'active'),
      (2, 'Inursha Fitness', 'Fitness', 'Personal Training', 'Fort Worth upscale personal training gym since 1999.', '(817) 332-7554', 'info@inursha.com', 'https://www.inursha.com', '2927 Shamrock Ave', 'Fort Worth', 'TX', '76107', 'Mon-Fri 5am-9pm, Sat 7am-2pm', 'Personal Training, Group Fitness, Strength, Cardio, Functional Fitness', '1-on-1 $70/session, Group $25/class, Monthly unlimited $150', 4.7, 145, 'active'),
      (3, 'MoveStudio', 'Fitness', 'Yoga/Pilates', 'Yoga, Pilates, dance, and barre classes in Plano.', '(214) 764-1232', 'info@movestudio.com', 'https://movestudio.com', '5560 Tennyson Pkwy Suite 175', 'Plano', 'TX', '75024', 'Mon-Sat 6am-8pm, Sun 9am-5pm', 'Yoga, Mat Pilates, Dance Fitness, Strength, Barre, Flexibility', 'Single class $20, 10-pack $170, Unlimited $140/mo', 4.5, 87, 'active');
    `);

    // Veterinary (76-90) — REAL TX vet businesses
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Austin Vet Hospital', 'Veterinary', 'Animal Hospital', 'Established in 1971 — full-service veterinary hospital in Austin.', '(512) 459-7676', 'info@austinvethospital.com', 'https://www.austinvethospital.com', '7435 Burnet Rd', 'Austin', 'TX', '78757', 'Mon-Fri 8am-7pm, Sat 9am-3pm', 'Wellness Exams, Vaccinations, Surgery, Dental, Emergency, X-Ray, Senior Care', 'Exam $65, Vaccination from $25, Dental cleaning $250', 4.9, 367, 'active'),
      (2, 'ATX Animal Clinic', 'Veterinary', 'Vet Clinic', 'Wellness exams, spay/neuter, and diagnostics in North Austin.', '(512) 338-4300', 'info@atxanimalclinic.com', 'https://www.atxanimalclinic.com', '12129 Ranch Rd 620 N Suite 401', 'Austin', 'TX', '78750', 'Mon-Fri 8am-6pm, Sat 9am-2pm', 'Wellness Exams, Spay/Neuter, Dental, Diagnostics, Microchipping', 'Exam $55, Spay from $200, Dental from $220', 4.6, 245, 'active'),
      (3, 'Emancipet', 'Veterinary', 'Low-Cost Clinic', 'Low-cost pet clinic providing affordable spay/neuter and vaccines.', '(512) 587-7729', 'info@emancipet.org', 'https://emancipet.org', '1030 Norwood Park Blvd, Ste 316', 'Austin', 'TX', '78753', 'Mon-Sat 8am-5pm', 'Low-Cost Spay/Neuter, Vaccinations, Microchipping, Wellness, Heartworm', 'Spay from $55, Vaccines from $10, Microchip $20', 4.8, 312, 'active'),
      (1, 'Taurus Academy', 'Veterinary', 'Pet Daycare', 'Dog daycare, boarding, and training since 1994 in Austin.', '(512) 444-4646', 'info@taurusacademy.com', 'https://www.taurusacademy.com', '715 S Lamar Blvd', 'Austin', 'TX', '78704', 'Mon-Fri 6:30am-7pm, Sat-Sun 8am-6pm', 'Dog Daycare, Overnight Boarding, Grooming, Training, Puppy Socialization', 'Daycare $35/day, Boarding $50/night, 10-day pass $300', 4.7, 198, 'active'),
      (2, 'East Dallas Veterinary Clinic', 'Veterinary', 'Vet Clinic', 'AAHA accredited since 1972 with grooming services in Dallas.', '(214) 225-3729', 'info@eastdallasvetclinic.com', 'https://eastdallasvetclinic.com', '727 N Buckner Blvd', 'Dallas', 'TX', '75218', 'Mon-Fri 8am-6pm, Sat 8am-1pm', 'Vet Exams, Surgery, Dentistry, Grooming, Radiology, Vaccinations', 'Exam $65, Dental from $250, Grooming from $40', 4.9, 145, 'active'),
      (3, 'CityVet Uptown Dallas', 'Veterinary', 'Full-Service Vet', 'Vet care, boarding, grooming, and dayplay in Uptown Dallas.', '(214) 953-1001', 'info@cityvet.com', 'https://www.cityvet.com/location/uptown', '3221 McKinney Ave', 'Dallas', 'TX', '75204', 'Mon-Fri 7am-7pm, Sat 8am-5pm', 'Preventive Medicine, Surgery, Boarding, Grooming, Dayplay, Dental', 'Exam $60, Boarding $45/night, Dayplay $28/day', 4.5, 234, 'active'),
      (1, 'Preston Center Animal Clinic', 'Veterinary', 'Vet Clinic', 'Comprehensive veterinary care in the heart of Dallas.', '(214) 368-3592', 'info@pcacvet.com', 'https://pcacvet.com', '8137 Preston Rd', 'Dallas', 'TX', '75225', 'Mon-Fri 8am-6pm, Sat 8am-12pm', 'Wellness, Surgery, Dental, Diagnostics, Emergency, Senior Care', 'Exam $70, Surgery from $300, Dental from $275', 4.8, 167, 'active'),
      (2, 'Bingle Vet', 'Veterinary', 'Vet Clinic', 'Family-owned Houston vet for over 30 years.', '(713) 468-1676', 'info@binglevet.com', 'https://binglevet.com', '1114 Bingle Rd', 'Houston', 'TX', '77055', 'Mon-Fri 8am-6pm, Sat 8am-1pm', 'Wellness Exams, Dental, Surgery, Diagnostics, Emergency, Boarding', 'Exam $60, Dental from $230, Boarding $40/night', 4.7, 89, 'active'),
      (3, 'Cat Veterinary Clinic', 'Veterinary', 'Cat Only', 'Texas first cat-focused clinic since 1973 — feline exclusive.', '(713) 523-5171', 'info@catvetclinic.com', 'https://www.catvetclinic.com', '3122 White Oak Dr, Ste A', 'Houston', 'TX', '77007', 'Mon-Fri 8am-6pm, Sat 8am-12pm', 'Feline Wellness, Dental, Surgery, Diagnostics, Senior Cat Care, Behavior', 'Exam $65, Dental from $250, Surgery from $400', 4.6, 78, 'active'),
      (1, 'Camp Bow Wow Houston Heights', 'Veterinary', 'Pet Daycare', 'Dog boarding, daycare, and grooming with live webcams.', '(713) 804-8809', 'info@campbowwow-hh.com', 'https://www.campbowwow.com/houston-greater-heights', '7232 Wynnwood Ln', 'Houston', 'TX', '77008', 'Mon-Fri 6:30am-7pm, Sat-Sun 8am-6pm', 'Dog Boarding, Daycare, Grooming, Training, Enrichment, Webcams', 'Daycare $38/day, Boarding $48/night, Grooming from $45', 4.7, 156, 'active'),
      (2, 'Houston Cat Hospital', 'Veterinary', 'Cat Hospital', 'Feline-exclusive veterinary hospital serving Houston since 2003.', '(713) 782-6369', 'info@houstoncathospital.com', 'https://www.houstoncathospital.com', '11169 Westheimer Rd', 'Houston', 'TX', '77042', 'Mon-Fri 8am-6pm, Sat 8am-2pm', 'Feline Wellness, Dental, Surgery, Boarding for Cats, Senior Wellness', 'Exam $60, Dental from $240, Cat boarding $30/night', 4.3, 203, 'active'),
      (3, 'Stone Oak Veterinary Clinic', 'Veterinary', 'Vet Clinic', 'Full-service vet with daycare program in San Antonio.', '(210) 481-9090', 'info@yourstoneoakvet.com', 'https://www.yourstoneoakvet.com', '20803 Stone Oak Pkwy Suite 101', 'San Antonio', 'TX', '78258', 'Mon-Fri 8am-6pm, Sat 8am-1pm', 'Wellness, Surgery, Dental, Diagnostics, Daycare, Grooming, Boarding', 'Exam $65, Daycare $30/day, Boarding $45/night', 4.8, 178, 'active'),
      (1, 'Culebra Creek Vet Hospital', 'Veterinary', 'Animal Hospital', 'Veterinary hospital and pet resort in San Antonio.', '(210) 684-2382', 'info@culebracreekvet.com', 'https://www.culebracreekvet.com', '8039 Culebra Rd', 'San Antonio', 'TX', '78251', 'Mon-Fri 8am-7pm, Sat 8am-4pm', 'Vet Exams, Surgery, Dental, Grooming, Daycare, Boarding, Lab', 'Exam $60, Surgery from $350, Pet boarding $42/night', 4.5, 123, 'active'),
      (2, 'Glam Pet Groom', 'Veterinary', 'Pet Grooming', 'Full-service dog and cat grooming in San Antonio.', '(210) 617-8808', 'info@glampetgroom.com', 'https://glampetgroom.com', '10171 Culebra Rd Suite 101', 'San Antonio', 'TX', '78251', 'Mon-Sat 7am-6pm', 'Full Groom, Bath, Haircuts, Nail Trim, Ear Cleaning, De-shedding', 'Small dog $40, Medium $55, Large $70, Cat grooming $60', 4.8, 198, 'active'),
      (3, 'Animal Hospital of San Antonio', 'Veterinary', 'Animal Hospital', 'Comprehensive vet medicine with boarding and text updates.', '(210) 344-9741', 'info@animalhospitalsa.com', 'https://animalhospitalsanantonio.com', '4618 N Loop 1604 W', 'San Antonio', 'TX', '78249', 'Mon-Fri 8am-6pm, Sat 8am-2pm', 'Vet Medicine, Surgery, Dental, Boarding, Wellness, Vaccinations', 'Exam $65, Boarding $40/night, Wellness plan from $30/mo', 4.6, 67, 'active');
    `);

    // Restaurant (91-105) — REAL TX restaurants
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Franklin Barbecue', 'Restaurant', 'BBQ', 'Michelin-recognized BBQ — the most famous brisket in Texas.', '(512) 653-1187', 'info@franklinbbq.com', 'https://franklinbbq.com', '900 E 11th St', 'Austin', 'TX', '78702', 'Tue-Sun 11am-3pm or sold out', 'Brisket, Pulled Pork, Ribs, Turkey, Sausage, Sides, Pies', 'Brisket $28/lb, Ribs $22/half rack, 3-meat plate $25', 4.8, 445, 'active'),
      (2, 'Matt''s El Rancho', 'Restaurant', 'Tex-Mex', 'Austin Tex-Mex institution since 1952 — home of Bob Armstrong dip.', '(512) 462-9333', 'info@mattselrancho.com', 'https://www.mattselrancho.com', '2613 S Lamar Blvd', 'Austin', 'TX', '78704', 'Daily 11am-10pm', 'Fajitas, Enchiladas, Bob Armstrong Dip, Tacos, Margaritas', 'Entrees $14-22, Margaritas $10-14, Brunch $12-18', 4.7, 389, 'active'),
      (3, 'Uchi', 'Restaurant', 'Japanese', 'Elevated Japanese cuisine with seasonal tasting menus.', '(512) 916-4808', 'info@uchirestaurants.com', 'https://uchi.uchirestaurants.com', '801 S Lamar Blvd', 'Austin', 'TX', '78704', 'Sun-Thu 5pm-10pm, Fri-Sat 5pm-11pm', 'Sushi, Sashimi, Hot & Cold Tastings, Omakase, Sake Bar', 'Sushi rolls $14-22, Omakase $95-150, Tastings $12-24', 4.9, 512, 'active'),
      (1, 'Vespaio Ristorante', 'Restaurant', 'Italian', 'Classic Italian cuisine with handmade pasta on South Congress.', '(512) 441-6100', 'info@vespaioristorante.com', 'https://www.vespaioristorante.com', '1610 S Congress Ave', 'Austin', 'TX', '78704', 'Daily 5pm-10pm', 'Handmade Pasta, Seasonal Menu, Wine List, Dinner Service', 'Pasta $18-28, Entrees $28-42, Wine from $12/glass', 4.7, 298, 'active'),
      (2, 'Ramen Tatsu-Ya', 'Restaurant', 'Japanese', 'Authentic Japanese ramen with tonkotsu, miso, and vegan options.', '(737) 314-5621', 'info@ramen-tatsuya.com', 'https://www.ramen-tatsuya.com', '8557 Research Blvd, Ste 126', 'Austin', 'TX', '78758', 'Daily 11am-11pm', 'Tonkotsu Ramen, Miso, Shoyu, Vegan Ramen, Appetizers, Rice Bowls', 'Ramen $16-19, Appetizers $6-12, Rice bowls $14', 4.8, 567, 'active'),
      (3, 'Pecan Lodge', 'Restaurant', 'BBQ', 'Deep Ellum BBQ destination with legendary brisket and beef ribs.', '(214) 748-8900', 'info@pecanlodge.com', 'https://pecanlodge.com', '2702 Main St', 'Dallas', 'TX', '75226', 'Tue-Sun 11am-3pm', 'Brisket, Beef Ribs, Pulled Pork, Sausage, Banana Pudding, Sandwiches', 'Brisket $26/lb, Beef rib $28, 2-meat plate $22', 4.8, 234, 'active'),
      (1, 'Chuy''s Dallas', 'Restaurant', 'Tex-Mex', 'Fun Tex-Mex with fresh-squeezed margaritas and green chile.', '(214) 559-2489', 'info@chuys.com', 'https://www.chuys.com', '4544 McKinney Ave', 'Dallas', 'TX', '75205', 'Daily 11am-10pm', 'Burritos, Enchiladas, Fajitas, Tacos, Margaritas, Green Chile Stew', 'Entrees $12-18, Margaritas $8-12', 4.5, 312, 'active'),
      (2, 'Lucia', 'Restaurant', 'Italian', 'Chef-owned Italian in Bishop Arts — house-cured salumi and handmade pasta.', '(214) 948-4998', 'info@luciadallas.com', 'https://www.luciadallas.com', '287 N Bishop Ave', 'Dallas', 'TX', '75208', 'Wed-Sat 5:30pm-10pm', 'House-Cured Salumi, Handmade Pasta, Fresh Bread, Seasonal Menu, Wine', 'Pasta $22-32, Entrees $30-48, Tasting menu $85', 4.6, 178, 'active'),
      (3, 'Loro Asian Smokehouse', 'Restaurant', 'Asian BBQ', 'Asian-inspired smoked meats from the Uchi and Franklin BBQ teams.', '(214) 833-4983', 'info@loroeats.com', 'https://www.loroeats.com', '1812 N Haskell Ave', 'Dallas', 'TX', '75204', 'Daily 11am-10pm', 'Smoked Brisket, Thai Curry, Noodles, Oak-Smoked Salmon, Cocktails', 'Plates $14-22, Cocktails $12-15', 4.7, 189, 'active'),
      (1, 'Cafe Brazil', 'Restaurant', 'Cafe', '24-hour Dallas cafe with all-day breakfast and specialty coffee.', '(214) 691-7791', 'info@cafebrazil.com', 'https://cafebrazil.com', '6420 N Central Expy', 'Dallas', 'TX', '75206', '24 Hours', 'All-Day Breakfast, Omelets, Pancakes, Crepes, Sandwiches, Coffee', 'Breakfast $9-16, Lunch $10-15, Coffee from $3.50', 4.6, 267, 'active'),
      (2, 'The Original Ninfa''s on Navigation', 'Restaurant', 'Mexican', 'The birthplace of fajitas since 1973 — Houston Tex-Mex legend.', '(713) 228-1175', 'info@ninfas.com', 'https://ninfas.com', '2704 Navigation Blvd', 'Houston', 'TX', '77003', 'Daily 11am-10pm', 'Fajitas, Tacos, Enchiladas, Handmade Tortillas, Queso, Margaritas', 'Fajitas $22-28, Entrees $14-24, Margaritas $10-14', 4.5, 198, 'active'),
      (3, 'Pappas Bros. Steakhouse', 'Restaurant', 'Steakhouse', 'Michelin Recommended — USDA Prime steaks and fine dining.', '(713) 780-7352', 'info@pappasbros.com', 'https://pappasbros.com', '5839 Westheimer Rd', 'Houston', 'TX', '77057', 'Mon-Sat 5pm-10pm, Sun 5pm-9pm', 'USDA Prime Steaks, Seafood, Wine List, Craft Cocktails, Private Dining', 'Steaks $50-85, Seafood $40-65, Wine from $15/glass', 4.7, 356, 'active'),
      (1, 'Doshi House', 'Restaurant', 'Cafe', 'Plant-based cafe and community space in Houston Third Ward.', '(713) 814-5085', 'info@doshihouse.com', 'https://www.doshihouse.com', '3419 Emancipation Ave', 'Houston', 'TX', '77004', 'Daily 7am-7pm', 'Specialty Coffee, Loose-Leaf Tea, Vegan Food, Matcha, Pastries', 'Coffee from $4, Vegan plates $10-14, Matcha $6', 4.8, 234, 'active'),
      (2, 'La Gloria', 'Restaurant', 'Mexican', 'Interior Mexican street food by Chef Johnny Hernandez at the Pearl.', '(210) 267-9040', 'info@lagloria-sa.com', 'https://chefjohnnyhernandez.com/la-gloria-pearl', '100 E Grayson St', 'San Antonio', 'TX', '78215', 'Daily 11am-10pm', 'Street Tacos, Ceviches, Enchiladas, Mole, Margaritas, Craft Cocktails', 'Tacos $4-6, Entrees $16-24, Margaritas $12', 4.6, 267, 'active'),
      (3, 'Sushi Zushi', 'Restaurant', 'Japanese', 'Japanese-Latin fusion sushi with multiple San Antonio locations.', '(210) 545-6100', 'info@sushizushi.com', 'https://sushizushi.com', '18720 Stone Oak Pkwy #154', 'San Antonio', 'TX', '78258', 'Daily 11am-10pm', 'Sushi, Sashimi, Specialty Rolls, Ramen, Hibachi, Sake, Cocktails', 'Rolls $12-20, Ramen $16, Hibachi $22-30', 4.9, 189, 'active');
    `);

    // Automotive (106-120) — REAL TX automotive businesses
    await client.query(`
      INSERT INTO businesses (user_id, name, category, subcategory, description, phone, email, website_url, address, city, state, zip_code, hours, services, pricing_info, rating, review_count, status) VALUES
      (1, 'Quality Body Shop', 'Automotive', 'Body Shop', 'Collision repair and auto painting — multiple Austin locations.', '(512) 837-3568', 'info@qualitybodyshop.com', 'https://www.qualitybodyshopaustin.com', '8131 N Lamar Blvd', 'Austin', 'TX', '78753', 'Mon-Fri 8am-6pm, Sat 9am-1pm', 'Collision Repair, Dent Removal, Auto Painting, Frame Straightening', 'Free estimates, Insurance work welcome', 4.5, 298, 'active'),
      (2, 'Terry Sayther Automotive', 'Automotive', 'European Specialist', 'BMW, MINI, Mercedes, Land Rover, and Jaguar specialist in Austin.', '(512) 442-1361', 'info@terrysaytherauto.com', 'https://www.terrysaytherauto.com', '1700 Fort View Rd', 'Austin', 'TX', '78704', 'Mon-Fri 8am-6pm', 'BMW, MINI, Mercedes, Land Rover, Jaguar, Maintenance, Diagnostics', 'Oil service from $120, Brake service from $350, Diagnostics $125', 4.7, 167, 'active'),
      (3, 'Road Runner Body & Paint', 'Automotive', 'Body Shop', 'Complete collision repair, paint jobs, and hail damage in Austin.', '(512) 280-8008', 'info@roadrunnerbody.com', 'https://www.roadrunnerbodyandpaint.com', '9301 Johnny Morris Rd', 'Austin', 'TX', '78724', 'Mon-Fri 8am-6pm, Sat 9am-1pm', 'Collision Repair, Complete Paint, Color Matching, Hail Damage, Insurance', 'Free estimates, Paint from $1500, Dent repair from $200', 4.4, 234, 'active'),
      (1, 'Jiffy Lube Austin', 'Automotive', 'Oil Change', 'No appointment needed — fast oil changes and vehicle maintenance.', '(512) 454-5823', 'info@jiffylube-austin.com', 'https://www.jiffylube.com/locations/tx/austin/829', '3809 Guadalupe St', 'Austin', 'TX', '78751', 'Mon-Sat 8am-6pm', 'Oil Changes, Tire Rotation, Brake Services, Transmission, Air Filters', 'Conventional $40, Synthetic blend $55, Full synthetic $75', 4.3, 445, 'active'),
      (2, 'Texasland Auto Service & Tire', 'Automotive', 'Tire Shop', 'Family-owned tire and auto repair since 1996 in Dallas.', '(972) 306-2326', 'info@texaslandtire.com', 'https://www.texaslandtire.com', '3680 Rosemeade Pkwy', 'Dallas', 'TX', '75287', 'Mon-Sat 7am-6pm', 'Tire Sales, Alignment, Engine Repair, Brakes, AC, Diagnostics', 'Alignment $79, Tire from $80, Oil change $39', 4.5, 198, 'active'),
      (3, 'Discount Tire Dallas', 'Automotive', 'Tire Shop', 'Tire sales, installation, and free inspections in Dallas.', '(214) 520-1566', 'info@discounttire-dallas.com', 'https://www.discounttire.com', '3524 Inwood Rd', 'Dallas', 'TX', '75209', 'Mon-Sat 8am-6pm', 'Tire Sales, Installation, Flat Repair, Rotation, Balancing, TPMS', 'Tire from $80, Mount & balance $20/tire, Flat repair free', 4.8, 89, 'active'),
      (1, 'Dunlap-Swain Tire Co.', 'Automotive', 'Tire Shop', 'New and used tires with commercial fleet services in Dallas.', '(214) 741-1234', 'info@dunlapswain.com', 'https://www.dunlapswain.com', '2607 San Jacinto St', 'Dallas', 'TX', '75201', 'Mon-Sat 7am-6pm', 'New Tires, Used Tires, Alignment, Balancing, Commercial Truck Tires', 'Tires from $60, Alignment $75, Fleet pricing available', 4.4, 156, 'active'),
      (2, 'Caliber Collision Houston', 'Automotive', 'Body Shop', 'Nationwide collision repair with warranty — Houston Silber Rd.', '(713) 680-2266', 'info@caliber-houston.com', 'https://www.caliber.com', '1517 Silber Rd', 'Houston', 'TX', '77055', 'Mon-Fri 8am-6pm, Sat 9am-12pm', 'Collision Repair, Paintless Dent, Frame Repair, Glass, Insurance Claims', 'Free estimates, Insurance direct repair', 4.7, 178, 'active'),
      (3, 'Maaco Houston', 'Automotive', 'Auto Paint', 'Auto painting and collision repair at affordable prices.', '(832) 548-9579', 'info@maaco-houston.com', 'https://www.maaco.com', '5625 Bellaire Blvd', 'Houston', 'TX', '77081', 'Mon-Fri 8am-6pm, Sat 9am-1pm', 'Auto Painting, Collision Repair, Dent Repair, Bumper Repair, Fleet', 'Paint from $300, Collision repair varies, Free estimates', 4.5, 312, 'active'),
      (1, 'Today''s European Cars', 'Automotive', 'European Specialist', 'German import specialist — Mercedes, BMW, Audi, VW since 1984.', '(713) 781-9877', 'info@cars-autos.com', 'https://www.cars-autos.com', '6261 Richmond Ave, Ste E', 'Houston', 'TX', '77057', 'Mon-Fri 8am-6pm', 'Mercedes, BMW, Audi, VW, MINI, Maintenance, Diagnostics, AC', 'Oil service from $100, Diagnostics $95, Brake service from $300', 4.3, 145, 'active'),
      (2, 'Eric''s Car Care', 'Automotive', 'European Specialist', 'ASE-certified European auto repair — BMW, Audi, Mercedes, Porsche.', '(713) 352-8058', 'info@ericscarcare.com', 'https://ericscarcare.com', '8407 Katy Fwy', 'Houston', 'TX', '77024', 'Mon-Fri 7:30am-6pm', 'European Auto Repair, Brake, Engine, Transmission, AC, State Inspection', 'Oil service from $110, Brake from $280, Inspection $25.50', 4.4, 112, 'active'),
      (3, 'The Garagisti', 'Automotive', 'European Specialist', 'High-performance European vehicle service — Porsche, Ferrari, BMW.', '(713) 893-5253', 'info@thegaragisti.com', 'https://www.thegaragisti.com', '3735 Dacoma St', 'Houston', 'TX', '77092', 'Mon-Fri 8am-6pm', 'Porsche, BMW, Mercedes, Audi, Ferrari, Lamborghini, Performance Upgrades', 'Service from $150, Performance upgrades from $500, Diagnostics $125', 4.6, 234, 'active'),
      (1, 'Christian Brothers Alamo Heights', 'Automotive', 'Auto Repair', 'Full-service auto repair with courtesy shuttle in San Antonio.', '(210) 880-0480', 'info@cbac-alamoheights.com', 'https://www.cbac.com/alamo-heights', '1431 Austin Hwy', 'San Antonio', 'TX', '78209', 'Mon-Fri 7am-6pm', 'Oil Change, Brakes, Engine, AC, Transmission, Diagnostics, Shuttle', 'Oil change $45, Brake pads from $150, Diagnostics $89', 4.5, 198, 'active'),
      (2, 'Eurasian Auto Repair', 'Automotive', 'European/Asian Specialist', 'ASE-certified for BMW, Audi, Mercedes, Porsche, and Asian makes.', '(210) 599-3100', 'info@eurasianautorepair.com', 'https://eurasianautorepair.com', '12235 Nacogdoches Rd', 'San Antonio', 'TX', '78217', 'Mon-Fri 8am-6pm', 'BMW, Audi, Mercedes, Porsche, Toyota, Honda, Brake, Engine, Diagnostics', 'Oil service from $100, Brake from $250, Diagnostics $95', 4.7, 87, 'active'),
      (3, 'Goose Euro', 'Automotive', 'European Specialist', 'BMW, Mercedes, Audi, and VW dealer-quality maintenance.', '(210) 390-0500', 'info@gooseautomotive.com', 'https://gooseautomotive.com', '2654 Pat Booker Rd', 'Universal City', 'TX', '78148', 'Mon-Fri 8am-6pm', 'BMW, Mercedes, Audi, VW, Maintenance, Engine, Brake, Suspension', 'Oil service from $95, Brake from $275, Pre-purchase inspection $150', 4.2, 156, 'active');
    `);

    // Seed customers (20)
    await client.query(`
      INSERT INTO customers (business_id, name, email, phone, address, city, tags, source, status, notes, total_spent, visit_count, last_visit) VALUES
      (1, 'Alice Thompson', 'alice@email.com', '555-2001', '100 Elm St', 'Austin', 'regular,family', 'referral', 'active', 'Prefers morning appointments', 1250.00, 8, '2024-12-15'),
      (1, 'Bob Richards', 'bob@email.com', '555-2002', '200 Pine St', 'Austin', 'new,insurance', 'google', 'active', 'Delta Dental insurance', 350.00, 2, '2024-12-20'),
      (1, 'Carol Davis', 'carol@email.com', '555-2003', '300 Oak St', 'Austin', 'vip,regular', 'website', 'active', 'VIP patient since 2020', 4500.00, 24, '2025-01-05'),
      (3, 'David Kim', 'david@email.com', '555-2004', '400 Maple Ave', 'Dallas', 'corporate', 'linkedin', 'active', 'Business client referrals', 8500.00, 12, '2025-01-10'),
      (3, 'Emma Watson', 'emma.w@email.com', '555-2005', '500 Cedar Dr', 'Dallas', 'family-law', 'google', 'active', 'Ongoing divorce case', 15000.00, 6, '2025-01-12'),
      (5, 'Frank Lopez', 'frank@email.com', '555-2006', '600 River Rd', 'Houston', 'emergency,repeat', 'yelp', 'active', 'Called for emergency pipe burst', 2800.00, 5, '2025-01-08'),
      (5, 'Grace Chen', 'grace@email.com', '555-2007', '700 Hill St', 'Houston', 'maintenance', 'referral', 'active', 'Annual maintenance contract', 1200.00, 4, '2024-11-20'),
      (7, 'Hannah Moore', 'hannah@email.com', '555-2008', '800 Style Ave', 'San Antonio', 'vip,regular', 'instagram', 'active', 'Monthly color appointment', 3600.00, 18, '2025-01-15'),
      (7, 'Isabella Cruz', 'isabella@email.com', '555-2009', '900 Beauty Ln', 'San Antonio', 'bridal', 'referral', 'active', 'Wedding party - June 2025', 800.00, 3, '2025-01-10'),
      (9, 'James Park', 'james@email.com', '555-2010', '110 Fit Way', 'Austin', 'monthly,nutrition', 'facebook', 'active', '3x/week training schedule', 2100.00, 36, '2025-01-14'),
      (9, 'Karen White', 'karen@email.com', '555-2011', '220 Gym St', 'Austin', 'starter', 'google', 'active', 'Started Jan 2025, weight loss goal', 420.00, 6, '2025-01-13'),
      (11, 'Leo Martinez', 'leo@email.com', '555-2012', '330 Pet Blvd', 'Dallas', 'multi-pet,regular', 'website', 'active', '2 dogs, 1 cat - annual wellness', 1800.00, 9, '2025-01-11'),
      (11, 'Mia Johnson', 'mia@email.com', '555-2013', '440 Animal Way', 'Dallas', 'puppy', 'referral', 'active', 'New puppy - vaccination schedule', 450.00, 3, '2025-01-09'),
      (13, 'Nathan Brown', 'nathan@email.com', '555-2014', '550 Food St', 'Houston', 'regular,catering', 'yelp', 'active', 'Monthly catering orders', 5200.00, 15, '2025-01-12'),
      (13, 'Olivia Taylor', 'olivia@email.com', '555-2015', '660 Dine Ave', 'Houston', 'vip', 'instagram', 'active', 'Preferred table by window', 2800.00, 22, '2025-01-14'),
      (2, 'Peter Adams', 'peter@email.com', '555-2016', '770 Tooth Ln', 'Austin', 'orthodontics', 'google', 'active', 'Son needs braces consultation', 600.00, 4, '2024-12-28'),
      (5, 'Rachel Green', 'rachel@email.com', '555-2017', '880 Water St', 'Houston', 'new', 'nextdoor', 'active', 'Kitchen remodel plumbing', 0.00, 0, NULL),
      (8, 'Sam Wilson', 'sam@email.com', '555-2018', '990 Spa Rd', 'San Antonio', 'couples', 'groupon', 'active', 'Monthly couples massage', 1600.00, 8, '2025-01-06'),
      (10, 'Tina Foster', 'tina@email.com', '555-2019', '101 Strong Ave', 'Austin', 'competition', 'instagram', 'active', 'Preparing for CrossFit open', 900.00, 12, '2025-01-15'),
      (15, 'Victor Reyes', 'victor@email.com', '555-2020', '202 Motor Pl', 'San Antonio', 'fleet', 'referral', 'active', 'Fleet of 5 company vehicles', 3200.00, 10, '2025-01-07');
    `);

    // Seed bookings (20)
    await client.query(`
      INSERT INTO bookings (business_id, customer_id, service_name, date, time_slot, duration_minutes, price, status, notes) VALUES
      (1, 1, 'Teeth Cleaning', '2025-02-01', '09:00 AM', 60, 150.00, 'completed', 'Regular 6-month cleaning'),
      (1, 2, 'Dental Filling', '2025-02-03', '10:30 AM', 90, 200.00, 'completed', 'Lower molar filling'),
      (1, 3, 'Teeth Whitening', '2025-02-10', '02:00 PM', 120, 300.00, 'confirmed', 'Professional whitening session'),
      (3, 4, 'Legal Consultation', '2025-02-05', '11:00 AM', 60, 200.00, 'completed', 'Business formation discussion'),
      (3, 5, 'Case Review', '2025-02-12', '03:00 PM', 90, 300.00, 'confirmed', 'Document review for divorce'),
      (5, 6, 'Pipe Repair', '2025-02-02', '08:00 AM', 120, 350.00, 'completed', 'Emergency pipe burst repair'),
      (5, 7, 'Annual Maintenance', '2025-02-15', '10:00 AM', 60, 150.00, 'scheduled', 'Annual plumbing inspection'),
      (7, 8, 'Hair Color & Cut', '2025-02-08', '11:00 AM', 150, 180.00, 'completed', 'Balayage with trim'),
      (7, 9, 'Bridal Trial', '2025-02-20', '01:00 PM', 180, 250.00, 'confirmed', 'Wedding hair and makeup trial'),
      (8, 18, 'Couples Massage', '2025-02-14', '04:00 PM', 90, 180.00, 'confirmed', 'Valentine special'),
      (9, 10, 'Personal Training', '2025-02-03', '06:00 AM', 60, 70.00, 'completed', 'Upper body focus'),
      (9, 11, 'Fitness Assessment', '2025-02-06', '07:00 AM', 90, 100.00, 'completed', 'Initial fitness assessment'),
      (10, 19, 'CrossFit Class', '2025-02-04', '05:30 AM', 60, 25.00, 'completed', 'WOD - Fran'),
      (11, 12, 'Wellness Exam', '2025-02-07', '09:00 AM', 45, 65.00, 'completed', 'Annual checkup - 2 dogs'),
      (11, 13, 'Puppy Vaccination', '2025-02-18', '10:30 AM', 30, 45.00, 'scheduled', 'DHPP booster shot'),
      (13, 14, 'Catering Consultation', '2025-02-09', '12:00 PM', 60, 0.00, 'completed', 'Planning corporate lunch'),
      (13, 15, 'Private Dining', '2025-02-22', '07:00 PM', 180, 500.00, 'confirmed', 'Birthday dinner for 8'),
      (15, 20, 'Oil Change', '2025-02-11', '08:00 AM', 45, 39.00, 'completed', 'Synthetic oil change'),
      (15, 20, 'Brake Inspection', '2025-02-25', '09:00 AM', 60, 0.00, 'scheduled', 'Free brake check'),
      (1, 1, 'Root Canal', '2025-03-01', '10:00 AM', 120, 800.00, 'scheduled', 'Upper right molar');
    `);

    // Seed reviews (20)
    await client.query(`
      INSERT INTO reviews (business_id, customer_name, rating, comment, source, status, response) VALUES
      (1, 'Alice Thompson', 5, 'Best dental experience ever! Dr. Smith is incredibly gentle and thorough. The whole team made me feel comfortable.', 'google', 'responded', 'Thank you so much, Alice! We love having you as a patient.'),
      (1, 'John Miller', 4, 'Good service and clean office. Wait time was a bit long but the care was excellent.', 'yelp', 'responded', 'Thanks for your feedback, John. We are working on reducing wait times.'),
      (3, 'David Kim', 5, 'Sarah Johnson is an exceptional attorney. Won my case and kept me informed throughout the entire process.', 'google', 'responded', 'Thank you David! It was a pleasure working with you.'),
      (5, 'Frank Lopez', 5, 'Called at 2am for an emergency pipe burst. They arrived in 30 minutes and fixed everything. Lifesavers!', 'google', 'responded', 'We are glad we could help, Frank! That is what we are here for.'),
      (5, 'Maria Santos', 3, 'Good work but pricing was higher than the initial estimate. Would appreciate more transparency.', 'yelp', 'pending', NULL),
      (7, 'Hannah Moore', 5, 'Absolutely love my balayage! The stylists here are true artists. Best salon in San Antonio.', 'instagram', 'responded', 'You looked amazing Hannah! See you next month!'),
      (7, 'Jessica Lee', 5, 'The bridal package was perfect. My entire wedding party looked stunning. Highly recommend!', 'google', 'responded', 'Thank you Jessica! Your wedding was beautiful!'),
      (8, 'Sam Wilson', 4, 'Great massage experience. Very relaxing atmosphere. Only wish they had more availability on weekends.', 'google', 'pending', NULL),
      (9, 'James Park', 5, 'Completely transformed my fitness level in 6 months. Coach knows exactly how to push you while keeping it safe.', 'google', 'responded', 'Your dedication is inspiring, James! Keep crushing it!'),
      (9, 'Amy Richards', 4, 'Solid training program. Wished they had more flexible scheduling for early morning sessions.', 'yelp', 'pending', NULL),
      (10, 'Tina Foster', 5, 'Best CrossFit box I have ever been to. Community is incredible and coaching is top-notch.', 'google', 'responded', 'Welcome to the Thunder family, Tina!'),
      (11, 'Leo Martinez', 5, 'Dr. Patel is amazing with animals. My dogs actually get excited to go to the vet now!', 'google', 'responded', 'We adore your fur babies, Leo! See you all soon!'),
      (11, 'Susan Clark', 4, 'Very caring staff. Prices are fair for the quality of care. Easy online booking.', 'yelp', 'responded', 'Thank you for your kind words, Susan!'),
      (13, 'Nathan Brown', 5, 'Best Italian food outside of Italy! The homemade pasta is incredible. Catering was perfect for our event.', 'google', 'responded', 'Grazie mille, Nathan! We put love in every dish.'),
      (13, 'Laura Wright', 4, 'Wonderful food and atmosphere. Gets crowded on weekends so make a reservation.', 'yelp', 'pending', NULL),
      (14, 'Mike Chen', 5, 'Best croissants in town! Coffee is excellent too. My go-to morning spot.', 'google', 'responded', 'Thank you Mike! See you tomorrow morning!'),
      (15, 'Victor Reyes', 5, 'Honest mechanics who do quality work. They saved me money by not recommending unnecessary repairs.', 'google', 'responded', 'Integrity is our priority, Victor! Thanks for trusting us.'),
      (15, 'Dan Cooper', 4, 'Good work on my transmission. Took a bit longer than estimated but they kept me updated.', 'yelp', 'pending', NULL),
      (2, 'Peter Adams', 4, 'Friendly staff and nice office. Good with kids. Slightly pricey for basic procedures.', 'google', 'responded', 'Thanks Peter! We strive to make every visit comfortable.'),
      (6, 'Tony Harris', 5, 'Excellent electrical work. Very professional team. Completed the panel upgrade ahead of schedule.', 'google', 'responded', 'Thank you Tony! Safety and quality are our priorities.');
    `);

    // Seed campaigns (15)
    await client.query(`
      INSERT INTO campaigns (business_id, name, type, subject, content, target_audience, status, scheduled_at, sent_at, recipients, opens, clicks) VALUES
      (1, 'Spring Cleaning Special', 'email', 'Brighten Your Smile This Spring!', 'Book your spring cleaning and get 20% off whitening. Limited time offer for our valued patients.', 'all_customers', 'sent', '2025-01-15 09:00:00', '2025-01-15 09:00:00', 450, 180, 45),
      (1, 'Appointment Reminder', 'sms', 'Dental Appointment Tomorrow', 'Hi! This is a reminder about your dental appointment tomorrow. Reply C to confirm.', 'upcoming_appointments', 'sent', '2025-02-01 08:00:00', '2025-02-01 08:00:00', 28, 28, 22),
      (3, 'Free Consultation Month', 'email', 'Free Legal Consultation - January Only', 'Start the new year right. Get a free 30-minute legal consultation this January.', 'leads', 'sent', '2025-01-02 10:00:00', '2025-01-02 10:00:00', 1200, 360, 89),
      (5, 'Winter Pipe Protection', 'email', 'Protect Your Pipes This Winter', 'Freezing temperatures are coming. Schedule a preventive inspection and save on emergency repairs.', 'all_customers', 'sent', '2024-12-01 09:00:00', '2024-12-01 09:00:00', 800, 320, 96),
      (7, 'Valentine Glam Package', 'email', 'Look Stunning This Valentine''s Day', 'Book our Valentine Glam Package: Hair, Makeup & Nails for just $199. Limited spots!', 'female_customers', 'sent', '2025-01-25 10:00:00', '2025-01-25 10:00:00', 600, 312, 156),
      (7, 'Referral Bonus', 'sms', 'Refer a Friend, Get $25 Off!', 'Love your look? Refer a friend and you both get $25 off your next visit!', 'active_customers', 'sent', '2025-01-20 11:00:00', '2025-01-20 11:00:00', 350, 350, 87),
      (9, 'New Year Fitness Challenge', 'email', 'Join Our 30-Day Transformation Challenge', 'Start 2025 strong! Join our 30-day challenge and get 50% off your first month of training.', 'leads', 'sent', '2024-12-28 07:00:00', '2024-12-28 07:00:00', 500, 225, 78),
      (11, 'Pet Wellness Month', 'email', 'February is Pet Dental Health Month', 'Get 15% off pet dental cleanings all February. Healthy teeth = happy pets!', 'all_customers', 'scheduled', '2025-02-01 09:00:00', NULL, 0, 0, 0),
      (13, 'Weekend Brunch Launch', 'email', 'New Weekend Brunch Menu!', 'Introducing our new weekend brunch menu. Italian-inspired breakfast dishes you will love.', 'all_customers', 'sent', '2025-01-10 08:00:00', '2025-01-10 08:00:00', 900, 405, 162),
      (13, 'Catering Promo', 'email', 'Book Catering & Save 10%', 'Planning an event? Book our catering service before March and save 10% on orders over $500.', 'corporate', 'draft', NULL, NULL, 0, 0, 0),
      (15, 'Spring Car Care', 'email', 'Get Your Car Spring-Ready', 'Book a spring maintenance package: oil change, tire rotation & multi-point inspection for $99.', 'all_customers', 'draft', NULL, NULL, 0, 0, 0),
      (5, 'Emergency Service Reminder', 'sms', '24/7 Emergency Plumbing', 'Remember: Pro Plumbing is available 24/7 for emergencies. Save our number!', 'all_customers', 'sent', '2025-01-18 12:00:00', '2025-01-18 12:00:00', 800, 800, 120),
      (8, 'Spa Day Special', 'email', 'Treat Yourself to a Spa Day', 'Midweek spa packages starting at $99. Massage, facial, and aromatherapy included.', 'female_customers', 'sent', '2025-01-22 09:00:00', '2025-01-22 09:00:00', 450, 198, 67),
      (10, 'Open Gym Saturdays', 'email', 'Free Open Gym Every Saturday', 'Bring a friend for free every Saturday in February. No commitment, just sweat!', 'all_customers', 'scheduled', '2025-02-01 06:00:00', NULL, 0, 0, 0),
      (14, 'Loyalty Card Launch', 'email', 'Introducing Our Loyalty Card!', 'Buy 9 coffees, get the 10th free! Pick up your loyalty card on your next visit.', 'regular_customers', 'sent', '2025-01-08 07:00:00', '2025-01-08 07:00:00', 600, 330, 198);
    `);

    // Seed leads (18)
    await client.query(`
      INSERT INTO leads (business_id, name, email, phone, source, status, value, notes, follow_up_date) VALUES
      (1, 'Robert Garcia', 'robert.g@email.com', '555-3001', 'google', 'new', 500.00, 'Searched for teeth whitening services', '2025-02-05'),
      (1, 'Sandra Lee', 'sandra.l@email.com', '555-3002', 'facebook', 'contacted', 1200.00, 'Interested in family dental plan', '2025-02-08'),
      (3, 'Michael Scott', 'michael.s@email.com', '555-3003', 'website', 'qualified', 5000.00, 'Business formation - LLC', '2025-02-03'),
      (3, 'Angela Martin', 'angela.m@email.com', '555-3004', 'referral', 'won', 8000.00, 'Estate planning, referred by David Kim', '2025-02-01'),
      (5, 'Kevin Brown', 'kevin.b@email.com', '555-3005', 'yelp', 'new', 300.00, 'Needs bathroom remodel plumbing', '2025-02-10'),
      (5, 'Pam Wilson', 'pam.w@email.com', '555-3006', 'nextdoor', 'contacted', 800.00, 'Water heater replacement inquiry', '2025-02-06'),
      (7, 'Diana Prince', 'diana.p@email.com', '555-3007', 'instagram', 'qualified', 400.00, 'Wedding party of 6 - hair and makeup', '2025-02-12'),
      (7, 'Natasha Roman', 'natasha.r@email.com', '555-3008', 'google', 'new', 200.00, 'Looking for keratin treatment', '2025-02-15'),
      (9, 'Bruce Wayne', 'bruce.w@email.com', '555-3009', 'website', 'contacted', 2100.00, 'Interested in 3-month transformation', '2025-02-04'),
      (9, 'Clark Kent', 'clark.k@email.com', '555-3010', 'referral', 'won', 1680.00, 'Signed up for 6-month plan', '2025-01-28'),
      (11, 'Wanda Vision', 'wanda.v@email.com', '555-3011', 'google', 'new', 250.00, 'New puppy needs first vet visit', '2025-02-07'),
      (11, 'Peter Parker', 'peter.p@email.com', '555-3012', 'website', 'lost', 500.00, 'Moved to different city', '2025-01-20'),
      (13, 'Tony Stark', 'tony.s@email.com', '555-3013', 'google', 'qualified', 3000.00, 'Corporate event catering for 50', '2025-02-09'),
      (13, 'Steve Rogers', 'steve.r@email.com', '555-3014', 'yelp', 'new', 150.00, 'Interested in private dining', '2025-02-14'),
      (15, 'Nick Fury', 'nick.f@email.com', '555-3015', 'referral', 'contacted', 2000.00, 'Fleet maintenance contract - 10 vehicles', '2025-02-11'),
      (8, 'Pepper Potts', 'pepper.p@email.com', '555-3016', 'instagram', 'qualified', 600.00, 'Corporate spa day for team of 12', '2025-02-13'),
      (10, 'Thor Odinson', 'thor.o@email.com', '555-3017', 'facebook', 'new', 150.00, 'Interested in CrossFit fundamentals', '2025-02-16'),
      (14, 'Loki Laufey', 'loki.l@email.com', '555-3018', 'website', 'contacted', 1500.00, 'Weekly office coffee delivery', '2025-02-08');
    `);

    // Seed websites (10)
    await client.query(`
      INSERT INTO websites (business_id, page_title, slug, template, headline, subheadline, cta_text, cta_link, sections, published, visits) VALUES
      (1, 'Bright Smile Dental - New Patient Special', 'bright-smile-special', 'healthcare', 'Your Best Smile Starts Here', 'New patients get a free exam and X-rays with their first cleaning.', 'Book Your Free Exam', '/bookings', '["about","services","testimonials","contact"]', true, 1250),
      (3, 'Johnson Law - Free Consultation', 'johnson-law-consult', 'professional', 'Protect What Matters Most', 'Get expert legal advice with a free 30-minute consultation.', 'Schedule Free Consultation', '/bookings', '["about","practice-areas","results","contact"]', true, 890),
      (5, 'Pro Plumbing - Emergency Service', 'pro-plumbing-emergency', 'service', 'Plumbing Emergency? We''re Here 24/7', 'Fast, reliable emergency plumbing service. 30-minute response time guaranteed.', 'Call Now', 'tel:555-1005', '["services","pricing","reviews","contact"]', true, 2100),
      (7, 'Glamour Studio - Book Online', 'glamour-studio-book', 'beauty', 'Where Beauty Meets Artistry', 'Book your appointment with our award-winning stylists online.', 'Book Now', '/bookings', '["services","gallery","team","contact"]', true, 1800),
      (9, 'Peak Performance - Transform Your Body', 'peak-performance-transform', 'fitness', 'Transform Your Body in 90 Days', 'Science-based personal training that delivers real results.', 'Start Your Transformation', '/bookings', '["programs","results","testimonials","pricing"]', true, 950),
      (11, 'Happy Paws - New Pet Parent', 'happy-paws-new-pet', 'healthcare', 'Welcome to the Happy Paws Family', 'Comprehensive care for your new furry family member. First visit 50% off.', 'Book First Visit', '/bookings', '["services","team","testimonials","contact"]', true, 1400),
      (13, 'Mario''s Kitchen - Catering', 'marios-catering', 'restaurant', 'Authentic Italian Catering', 'Make your next event unforgettable with our authentic Italian cuisine.', 'Get Catering Quote', '/contact', '["menu","packages","gallery","contact"]', true, 670),
      (10, 'CrossFit Thunder - Join Us', 'cf-thunder-join', 'fitness', 'Find Your Strength', 'CrossFit classes for all fitness levels. First week free!', 'Try Free Week', '/bookings', '["about","schedule","pricing","contact"]', true, 820),
      (8, 'Pure Bliss Spa - Relax & Rejuvenate', 'pure-bliss-relax', 'beauty', 'Your Escape Awaits', 'Luxury spa treatments designed to restore mind, body, and soul.', 'Book Your Escape', '/bookings', '["treatments","packages","gallery","contact"]', false, 0),
      (15, 'Ace Auto - Spring Special', 'ace-auto-spring', 'service', 'Keep Your Car Running Perfect', 'Spring maintenance package: oil change, tire rotation, and inspection for just $99.', 'Book Service', '/bookings', '["services","specials","reviews","contact"]', false, 0);
    `);

    // Seed social posts (20)
    await client.query(`
      INSERT INTO social_posts (business_id, platform, content, image_url, status, scheduled_at, published_at, likes, comments_count, shares) VALUES
      (1, 'instagram', 'Nothing beats the confidence of a bright, healthy smile! Book your cleaning today and start your smile journey. #DentalCare #BrightSmile #HealthySmile', NULL, 'published', NULL, '2025-01-15 10:00:00', 89, 12, 5),
      (1, 'facebook', 'Did you know? Regular dental checkups can prevent 90% of dental problems. Schedule your next visit today!', NULL, 'published', NULL, '2025-01-20 09:00:00', 45, 8, 15),
      (3, 'linkedin', 'Proud to announce Johnson Law Group has been recognized as a Top 10 Family Law Firm in Dallas for 2025. Thank you to our amazing clients and team!', NULL, 'published', NULL, '2025-01-18 11:00:00', 234, 42, 67),
      (5, 'facebook', 'Winter weather alert! Protect your pipes from freezing. Here are our top 5 tips for preventing burst pipes this season.', NULL, 'published', NULL, '2025-01-12 08:00:00', 156, 23, 89),
      (7, 'instagram', 'Transformation Tuesday! Check out this stunning balayage by our senior stylist. Swipe to see the before and after! #HairTransformation #Balayage', NULL, 'published', NULL, '2025-01-21 12:00:00', 312, 45, 28),
      (7, 'tiktok', 'Quick tutorial: How to maintain your salon color at home between visits. Save this for later!', NULL, 'published', NULL, '2025-01-22 15:00:00', 1250, 89, 234),
      (8, 'instagram', 'Self-care Sunday starts at Pure Bliss Spa. Treat yourself to our signature relaxation package. You deserve it.', NULL, 'published', NULL, '2025-01-19 08:00:00', 178, 21, 12),
      (9, 'instagram', 'Client spotlight: James has lost 30 lbs and gained serious muscle in just 6 months of training. Your transformation starts with one decision.', NULL, 'published', NULL, '2025-01-23 07:00:00', 267, 34, 19),
      (9, 'facebook', 'New Year, New You! Our 30-day transformation challenge starts February 1st. Limited spots available. Sign up now!', NULL, 'published', NULL, '2025-01-25 09:00:00', 98, 15, 42),
      (10, 'instagram', 'Today''s WOD crushed it! Great energy from the 5:30 AM crew. Who is joining us tomorrow? #CrossFit #WOD #FitnessMotivation', NULL, 'published', NULL, '2025-01-24 08:00:00', 145, 28, 8),
      (11, 'facebook', 'February is National Pet Dental Health Month! Schedule your pet''s dental cleaning and save 15%. Healthy teeth = happy pets!', NULL, 'scheduled', '2025-02-01 09:00:00', NULL, 0, 0, 0),
      (11, 'instagram', 'Meet our newest patient, Luna the golden retriever puppy! Welcome to the Happy Paws family. #PuppyLove #VetLife', NULL, 'published', NULL, '2025-01-22 11:00:00', 456, 67, 34),
      (13, 'instagram', 'Fresh homemade pasta, made from scratch every morning. Come taste the difference at Mario''s Italian Kitchen. #ItalianFood #FreshPasta', NULL, 'published', NULL, '2025-01-20 17:00:00', 234, 31, 18),
      (13, 'facebook', 'Exciting news! Our new weekend brunch menu launches this Saturday. Italian-inspired breakfast dishes you won''t find anywhere else.', NULL, 'published', NULL, '2025-01-17 10:00:00', 189, 45, 56),
      (14, 'instagram', 'Start your morning right with our signature pour-over coffee and a freshly baked almond croissant. See you tomorrow! #CoffeeLovers #BakeryLife', NULL, 'published', NULL, '2025-01-23 06:00:00', 167, 19, 7),
      (15, 'facebook', 'Spring is coming! Book your spring maintenance package now and keep your car running smoothly all season. Early bird special: $99!', NULL, 'draft', NULL, NULL, 0, 0, 0),
      (5, 'instagram', 'Before and after: Complete bathroom plumbing renovation. Modern fixtures, clean lines, and perfect function. #PlumbingLife #HomeRenovation', NULL, 'published', NULL, '2025-01-25 14:00:00', 123, 18, 9),
      (3, 'facebook', 'Know your rights! This week on our blog: 5 things everyone should know about estate planning. Link in bio.', NULL, 'scheduled', '2025-02-03 10:00:00', NULL, 0, 0, 0),
      (8, 'facebook', 'Valentine''s Day couples spa package now available! Relax together with matching massages and facials. Book early - spots fill fast!', NULL, 'scheduled', '2025-02-05 09:00:00', NULL, 0, 0, 0),
      (7, 'facebook', 'We are hiring! Looking for experienced stylists to join our growing team. DM us for details. #NowHiring #SalonJobs', NULL, 'published', NULL, '2025-01-26 10:00:00', 78, 23, 45);
    `);

    // Seed notifications (20)
    await client.query(`
      INSERT INTO notifications (user_id, type, title, message, link, read, created_at) VALUES
      (1, 'review', 'New 5-Star Review', 'Alice Thompson left a 5-star review for Bright Smile Dental', '/reviews', false, '2025-01-25 10:00:00'),
      (1, 'booking', 'New Booking', 'Carol Davis booked Teeth Whitening for Feb 10', '/bookings', false, '2025-01-24 14:30:00'),
      (1, 'lead', 'New Lead', 'Robert Garcia is interested in teeth whitening services', '/leads', false, '2025-01-23 09:15:00'),
      (1, 'campaign', 'Campaign Sent', 'Spring Cleaning Special sent to 450 recipients', '/campaigns', true, '2025-01-15 09:05:00'),
      (1, 'review', 'New Review', 'John Miller left a 4-star review for Bright Smile Dental', '/reviews', true, '2025-01-20 16:00:00'),
      (2, 'booking', 'Booking Confirmed', 'David Kim confirmed Legal Consultation for Feb 5', '/bookings', false, '2025-01-22 11:00:00'),
      (2, 'lead', 'Lead Won', 'Angela Martin signed estate planning agreement', '/leads', false, '2025-01-21 15:30:00'),
      (2, 'review', 'New 5-Star Review', 'David Kim left a 5-star review for Johnson Law Group', '/reviews', true, '2025-01-19 10:00:00'),
      (3, 'booking', 'Emergency Booking', 'Frank Lopez needs emergency pipe repair', '/bookings', true, '2025-02-02 02:15:00'),
      (3, 'lead', 'New Lead', 'Kevin Brown inquired about bathroom remodel plumbing', '/leads', false, '2025-01-26 08:30:00'),
      (1, 'social', 'Post Performing Well', 'Your Instagram post has 89 likes and 12 comments', '/social', false, '2025-01-16 10:00:00'),
      (1, 'website', 'Website Traffic Up', 'Bright Smile landing page had 150 visits this week', '/websites', true, '2025-01-20 08:00:00'),
      (2, 'campaign', 'High Open Rate', 'Valentine Glam Package email has 52% open rate', '/campaigns', false, '2025-01-26 09:00:00'),
      (2, 'social', 'Viral Post', 'Your TikTok tutorial has 1,250 likes!', '/social', false, '2025-01-23 16:00:00'),
      (3, 'review', 'New 5-Star Review', 'Frank Lopez left a 5-star review for Pro Plumbing', '/reviews', false, '2025-01-25 14:00:00'),
      (1, 'booking', 'Booking Reminder', 'You have 3 appointments scheduled for tomorrow', '/bookings', false, '2025-01-31 18:00:00'),
      (2, 'lead', 'Follow-up Due', 'Diana Prince follow-up is due tomorrow', '/leads', false, '2025-02-11 08:00:00'),
      (3, 'booking', 'Booking Cancelled', 'A customer cancelled their appointment for Feb 15', '/bookings', true, '2025-01-28 10:00:00'),
      (1, 'system', 'Welcome to Muhittin', 'Welcome! Start by setting up your business profile.', '/businesses', true, '2025-01-01 00:00:00'),
      (2, 'system', 'Welcome to Muhittin', 'Welcome! Start by setting up your business profile.', '/businesses', true, '2025-01-01 00:00:00');
    `);

    // Seed analytics events (30)
    await client.query(`
      INSERT INTO analytics_events (business_id, event_type, metadata, created_at) VALUES
      (1, 'page_view', '{"page": "landing", "source": "google"}', '2025-01-25 10:00:00'),
      (1, 'page_view', '{"page": "landing", "source": "facebook"}', '2025-01-25 11:00:00'),
      (1, 'booking_created', '{"service": "cleaning", "value": 150}', '2025-01-25 12:00:00'),
      (1, 'review_received', '{"rating": 5, "source": "google"}', '2025-01-25 13:00:00'),
      (1, 'campaign_opened', '{"campaign": "Spring Cleaning", "recipient": "alice@email.com"}', '2025-01-15 10:00:00'),
      (3, 'page_view', '{"page": "consultation", "source": "google"}', '2025-01-24 09:00:00'),
      (3, 'lead_created', '{"source": "website", "value": 5000}', '2025-01-24 09:30:00'),
      (3, 'booking_created', '{"service": "consultation", "value": 200}', '2025-01-24 10:00:00'),
      (5, 'page_view', '{"page": "emergency", "source": "google"}', '2025-01-23 02:00:00'),
      (5, 'booking_created', '{"service": "emergency", "value": 350}', '2025-01-23 02:15:00'),
      (5, 'review_received', '{"rating": 5, "source": "google"}', '2025-01-24 08:00:00'),
      (7, 'page_view', '{"page": "booking", "source": "instagram"}', '2025-01-22 10:00:00'),
      (7, 'booking_created', '{"service": "balayage", "value": 180}', '2025-01-22 10:30:00'),
      (7, 'social_engagement', '{"platform": "instagram", "likes": 312, "comments": 45}', '2025-01-21 18:00:00'),
      (9, 'page_view', '{"page": "programs", "source": "google"}', '2025-01-20 07:00:00'),
      (9, 'lead_created', '{"source": "website", "value": 2100}', '2025-01-20 07:15:00'),
      (9, 'booking_created', '{"service": "training", "value": 70}', '2025-01-20 08:00:00'),
      (11, 'page_view', '{"page": "services", "source": "google"}', '2025-01-19 09:00:00'),
      (11, 'booking_created', '{"service": "wellness_exam", "value": 65}', '2025-01-19 09:30:00'),
      (11, 'review_received', '{"rating": 5, "source": "google"}', '2025-01-20 10:00:00'),
      (13, 'page_view', '{"page": "menu", "source": "yelp"}', '2025-01-18 12:00:00'),
      (13, 'page_view', '{"page": "catering", "source": "google"}', '2025-01-18 13:00:00'),
      (13, 'booking_created', '{"service": "catering", "value": 500}', '2025-01-18 14:00:00'),
      (1, 'campaign_clicked', '{"campaign": "Spring Cleaning", "link": "book-now"}', '2025-01-15 10:30:00'),
      (7, 'social_engagement', '{"platform": "tiktok", "likes": 1250, "shares": 234}', '2025-01-22 20:00:00'),
      (5, 'lead_created', '{"source": "nextdoor", "value": 800}', '2025-01-21 11:00:00'),
      (15, 'page_view', '{"page": "services", "source": "google"}', '2025-01-17 08:00:00'),
      (15, 'booking_created', '{"service": "oil_change", "value": 39}', '2025-01-17 08:30:00'),
      (14, 'social_engagement', '{"platform": "instagram", "likes": 167, "comments": 19}', '2025-01-23 12:00:00'),
      (10, 'booking_created', '{"service": "crossfit_class", "value": 25}', '2025-01-24 06:00:00');
    `);

    // Seed SEO audits — one per business (120), with varied scores
    // Top performers: Lone Star BBQ (93), Glamour Studio (91), Happy Paws (89), Serenity Mental Health (88)
    await client.query(`
      INSERT INTO seo_audits (business_id, overall_score, google_business_claimed, nap_consistent, website_mobile_friendly, ssl_enabled, meta_tags_optimized, schema_markup, page_speed_score, reviews_avg, reviews_count, photos_count, posts_last_30_days, citations_count, backlinks_count, domain_authority, monthly_searches, monthly_impressions, monthly_clicks, avg_position, recommendations) VALUES
      (1, 82, true, true, true, true, true, false, 85, 4.8, 247, 45, 8, 42, 28, 35, 4800, 32000, 1850, 3.2, 'Add schema markup for dental practice. Add more service pages. Increase Google Business posts.'),
      (2, 68, true, true, true, true, false, false, 72, 4.6, 189, 22, 3, 28, 12, 22, 2400, 14000, 720, 5.8, 'Optimize meta tags. Add more photos. Increase posting frequency. Build more citations.'),
      (3, 78, true, true, true, true, true, true, 88, 4.9, 312, 38, 12, 48, 35, 42, 6200, 45000, 2800, 2.8, 'Strong profile. Add video content. Target more long-tail keywords.'),
      (4, 71, true, false, true, true, false, false, 68, 4.7, 156, 15, 2, 22, 8, 18, 1800, 9500, 420, 7.2, 'Fix NAP inconsistencies. Add meta descriptions. Submit to more directories.'),
      (5, 74, true, true, true, true, false, false, 76, 4.5, 203, 28, 4, 35, 18, 28, 3200, 18000, 980, 4.5, 'Add structured data. Create location-specific pages. More patient reviews.'),
      (6, 62, true, true, false, true, false, false, 55, 4.4, 178, 12, 1, 18, 6, 15, 1200, 6800, 280, 8.5, 'Website not mobile-friendly — critical fix. Add meta tags. More citations needed.'),
      (7, 85, true, true, true, true, true, true, 92, 4.8, 134, 52, 10, 55, 42, 48, 5400, 38000, 2400, 2.5, 'Excellent foundation. Target more specialty keywords. Add FAQ schema.'),
      (8, 88, true, true, true, true, true, true, 90, 4.9, 267, 48, 14, 52, 38, 45, 7800, 52000, 3200, 2.1, 'Top performer. Consider expanding content to target adjacent keywords.'),
      (9, 58, true, false, true, false, false, false, 48, 4.3, 445, 8, 0, 12, 4, 10, 8500, 28000, 680, 9.2, 'SSL missing — urgent. NAP inconsistent. No optimization at all. Low-hanging fruit.'),
      (10, 76, true, true, true, true, true, false, 82, 4.7, 98, 32, 6, 38, 22, 32, 2800, 16000, 920, 4.1, 'Good progress. Add schema markup. Target "physical therapy near me" keywords.'),
      (11, 64, true, true, true, true, false, false, 65, 4.5, 112, 18, 2, 24, 10, 20, 1600, 8200, 350, 6.8, 'Meta tags need work. Increase review velocity. More location citations.'),
      (12, 80, true, true, true, true, true, false, 86, 4.8, 289, 42, 8, 45, 32, 38, 5200, 35000, 2100, 3.0, 'Strong. Add OB/GYN-specific schema. Target pregnancy-related keywords.'),
      (13, 72, true, true, true, true, false, false, 75, 4.6, 87, 20, 3, 28, 14, 25, 2000, 11000, 550, 5.5, 'Add cardiology schema. Create condition-specific landing pages.'),
      (14, 77, true, true, true, true, true, false, 80, 4.7, 145, 35, 5, 38, 25, 35, 3800, 22000, 1300, 3.8, 'Good base. Target "plastic surgery [city]" more aggressively. Add before/after pages.'),
      (15, 66, true, false, true, true, false, false, 70, 4.5, 167, 14, 2, 20, 8, 18, 1400, 7500, 320, 7.5, 'Fix NAP. Optimize meta tags. Create more condition-specific content.'),
      (16, 86, true, true, true, true, true, true, 88, 4.8, 234, 55, 12, 58, 45, 52, 8200, 58000, 3800, 1.8, 'Top 3 performer. Expand to target "car accident lawyer" variations.'),
      (17, 79, true, true, true, true, true, false, 82, 4.7, 156, 28, 6, 42, 28, 38, 4200, 28000, 1650, 3.5, 'Add FAQ schema. Create blog content on custody topics. Strong review profile.'),
      (18, 83, true, true, true, true, true, true, 85, 4.6, 312, 40, 10, 52, 35, 42, 9500, 65000, 4200, 2.2, 'Excellent. Target more language-specific immigration keywords.'),
      (19, 70, true, true, true, true, false, false, 72, 4.4, 189, 16, 3, 30, 15, 25, 3600, 20000, 900, 5.2, 'Add criminal defense schema. Target DWI-specific keywords. More reviews needed.'),
      (20, 84, true, true, true, true, true, true, 90, 4.9, 98, 38, 8, 48, 38, 45, 3200, 24000, 1500, 2.8, 'Excellent trust signals. Create more educational content on estate planning.'),
      (21, 75, true, true, true, true, false, false, 78, 4.6, 145, 22, 4, 35, 20, 30, 2800, 16000, 880, 4.2, 'Add business law schema. Target startup-related keywords.'),
      (22, 69, true, false, true, true, false, false, 65, 4.5, 178, 18, 2, 25, 12, 22, 2200, 12000, 520, 6.2, 'Fix NAP. Add real estate attorney schema. More client testimonials needed.'),
      (23, 60, true, true, true, true, false, false, 58, 4.3, 112, 10, 1, 18, 6, 15, 1500, 8000, 300, 8.0, 'Low optimization. Add workers comp schema. Create injury-specific pages.'),
      (24, 65, true, true, true, true, false, false, 68, 4.4, 87, 12, 2, 22, 8, 18, 1800, 9500, 380, 7.0, 'Need meta optimization. Create debt-specific landing pages.'),
      (25, 72, true, true, true, true, false, false, 75, 4.7, 67, 20, 3, 28, 15, 25, 1200, 7000, 350, 5.8, 'Add mediation schema. Target "mediation near me" keywords.'),
      (26, 68, true, true, true, true, false, false, 70, 4.5, 134, 14, 3, 25, 10, 20, 3200, 18000, 780, 5.5, 'Target "DUI lawyer [city]" more. Add case results page.'),
      (27, 80, true, true, true, true, true, true, 85, 4.8, 78, 30, 6, 42, 32, 40, 1800, 12000, 720, 3.5, 'Strong IP presence. Add patent/trademark-specific pages.'),
      (28, 73, true, true, true, true, false, false, 76, 4.6, 56, 16, 2, 28, 12, 22, 1000, 5500, 250, 6.0, 'Create elder law content hub. Target Medicaid planning keywords.'),
      (29, 67, true, false, true, true, false, false, 68, 4.4, 92, 12, 2, 22, 8, 18, 2400, 13000, 520, 6.5, 'Fix NAP inconsistencies. Create IRS problem-specific pages.'),
      (30, 71, true, true, true, true, false, false, 72, 4.5, 103, 18, 3, 25, 14, 24, 1800, 10000, 450, 5.8, 'Add employment law schema. Create wrongful termination content.'),
      (31, 81, true, true, true, true, true, false, 84, 4.7, 387, 48, 10, 52, 35, 42, 7200, 48000, 3000, 2.5, 'Strong. Add plumbing emergency schema. Target "24/7 plumber" keywords.'),
      (32, 76, true, true, true, true, true, false, 80, 4.6, 245, 32, 6, 42, 25, 35, 4500, 28000, 1600, 3.8, 'Good foundation. Target EV charger installation keywords — growing niche.'),
      (33, 73, true, true, true, true, false, false, 75, 4.5, 198, 25, 4, 35, 18, 28, 3800, 22000, 1100, 4.5, 'Add roofing schema. Create storm damage content for seasonal traffic.'),
      (34, 70, true, true, true, true, false, false, 72, 4.4, 312, 20, 3, 30, 15, 25, 5500, 32000, 1400, 4.8, 'Target "AC repair near me" — high volume. Add HVAC schema.'),
      (35, 84, true, true, true, true, true, true, 88, 4.8, 156, 55, 12, 55, 40, 48, 3200, 24000, 1500, 2.2, 'Top landscaper. Add seasonal content calendar. Target "landscape design" keywords.'),
      (36, 74, true, true, true, true, false, false, 76, 4.6, 178, 28, 4, 32, 18, 28, 2800, 16000, 800, 4.5, 'Add painting portfolio page. Target interior/exterior painting separately.'),
      (37, 67, true, true, true, true, false, false, 68, 4.3, 234, 15, 2, 25, 10, 20, 4200, 25000, 1000, 5.2, 'Need pest-specific landing pages. Add FAQ content for common pests.'),
      (38, 65, true, false, true, true, false, false, 62, 4.5, 145, 12, 1, 20, 8, 16, 1800, 9500, 380, 7.0, 'Fix NAP. Add garage door schema. Create emergency service page.'),
      (39, 79, true, true, true, true, true, false, 84, 4.7, 267, 42, 8, 48, 32, 40, 4800, 32000, 2000, 3.0, 'Strong cleaning brand. Target "eco-friendly cleaning" niche keywords.'),
      (40, 69, true, true, true, true, false, false, 70, 4.4, 198, 18, 3, 28, 12, 22, 3200, 18000, 750, 5.5, 'Create service-specific pages for each handyman skill.'),
      (41, 72, true, true, true, true, false, false, 75, 4.6, 112, 22, 3, 30, 15, 25, 2200, 12000, 550, 5.2, 'Add fence/deck gallery pages. Target "[material] fence [city]" keywords.'),
      (42, 63, true, true, true, true, false, false, 60, 4.5, 89, 10, 1, 18, 6, 15, 1500, 8000, 300, 7.5, 'Low authority. Build more citations. Create home vs auto tint comparison content.'),
      (43, 77, true, true, true, true, true, false, 82, 4.7, 134, 35, 6, 42, 25, 35, 2800, 18000, 1050, 3.8, 'Good pool presence. Target "pool builder [city]" and seasonal keywords.'),
      (44, 71, true, true, true, true, false, false, 72, 4.6, 156, 20, 3, 30, 14, 25, 3200, 18000, 800, 5.0, 'Create flooring type comparison pages. Add installation gallery.'),
      (45, 75, true, true, true, true, true, false, 78, 4.5, 203, 28, 5, 38, 22, 32, 3800, 22000, 1200, 4.0, 'Add security system comparison content. Target "smart home security" keywords.'),
      (46, 91, true, true, true, true, true, true, 95, 4.9, 412, 65, 16, 62, 52, 58, 8800, 62000, 4500, 1.5, 'TOP 3. Dominating local beauty search. Maintain review velocity. Add video content.'),
      (47, 83, true, true, true, true, true, true, 88, 4.8, 298, 48, 10, 52, 38, 45, 5800, 40000, 2600, 2.5, 'Strong spa presence. Target specific treatment keywords. Add more Google posts.'),
      (48, 72, true, true, true, true, false, false, 75, 4.6, 234, 22, 4, 32, 16, 25, 3200, 18000, 850, 4.8, 'Add nail salon schema. Create service menu pages. More photos needed.'),
      (49, 78, true, true, true, true, true, false, 82, 4.7, 178, 35, 6, 42, 28, 35, 2800, 18000, 1100, 3.5, 'Good lash niche presence. Target "lash extensions near me" keywords.'),
      (50, 64, true, true, true, true, false, false, 65, 4.5, 145, 15, 2, 22, 8, 18, 1500, 8000, 320, 7.0, 'Low authority. Build spray tan specific content. Partner with wedding vendors.'),
      (51, 85, true, true, true, true, true, true, 90, 4.8, 267, 52, 12, 55, 42, 48, 6500, 45000, 3000, 2.0, 'Excellent medspa SEO. Target specific treatment keywords. Add before/after gallery.'),
      (52, 82, true, true, true, true, true, false, 86, 4.9, 189, 45, 8, 48, 35, 42, 4200, 28000, 1800, 2.8, 'Strong natural hair niche. Create hair type-specific content.'),
      (53, 70, true, true, true, true, false, false, 72, 4.6, 312, 18, 3, 28, 14, 22, 3800, 22000, 950, 5.0, 'High review count is good. Optimize meta tags. Add waxing FAQ page.'),
      (54, 76, true, true, true, true, true, false, 80, 4.7, 156, 32, 6, 38, 22, 32, 2400, 14000, 750, 4.2, 'Good skincare content. Create treatment comparison pages. Add before/after photos.'),
      (55, 80, true, true, true, true, true, false, 84, 4.8, 234, 48, 8, 45, 32, 40, 3500, 22000, 1400, 3.2, 'Strong tattoo presence. Add artist portfolio pages. Target style-specific keywords.'),
      (56, 60, true, true, false, true, false, false, 52, 4.4, 198, 8, 1, 15, 4, 12, 2200, 12000, 400, 8.5, 'Website not mobile-friendly. Very basic SEO. Lots of room for improvement.'),
      (57, 74, true, true, true, true, false, false, 76, 4.7, 267, 25, 5, 35, 18, 28, 3800, 24000, 1200, 4.2, 'Create stylist profile pages. Target specific hair service keywords.'),
      (58, 66, true, true, true, true, false, false, 68, 4.6, 123, 14, 2, 22, 8, 18, 1600, 8500, 340, 6.5, 'Add makeup portfolio. Target "bridal makeup [city]" keywords.'),
      (59, 78, true, true, true, true, true, false, 82, 4.8, 145, 38, 6, 42, 28, 35, 2200, 14000, 850, 3.8, 'Good microblading niche. Add healing process content. Target PMU keywords.'),
      (60, 77, true, true, true, true, true, false, 80, 4.7, 203, 30, 5, 38, 22, 32, 3200, 20000, 1100, 3.8, 'Add men grooming content. Target "hot shave" and premium barbershop keywords.'),
      (61, 83, true, true, true, true, true, true, 88, 4.8, 187, 48, 10, 52, 38, 45, 4800, 32000, 2100, 2.5, 'Strong PT presence. Create transformation story content. Target specific goals.'),
      (62, 81, true, true, true, true, true, false, 84, 4.7, 234, 42, 8, 48, 32, 40, 4200, 28000, 1800, 2.8, 'Good CrossFit community. Add WOD content. Target "CrossFit [city]" keywords.'),
      (63, 87, true, true, true, true, true, true, 92, 4.9, 312, 55, 14, 58, 45, 52, 6800, 48000, 3200, 1.8, 'Top yoga studio. Create style-specific class pages. Add teacher bios.'),
      (64, 72, true, true, true, true, false, false, 75, 4.6, 289, 20, 3, 32, 16, 25, 5200, 32000, 1400, 4.5, 'High search volume but low optimization. Target "24/7 gym [city]" keywords.'),
      (65, 75, true, true, true, true, false, false, 78, 4.7, 178, 28, 5, 35, 20, 30, 2800, 16000, 880, 4.2, 'Good cycling niche. Create class type pages. Target "spin class near me".'),
      (66, 68, true, true, true, true, false, false, 70, 4.5, 156, 15, 3, 25, 10, 20, 2400, 14000, 600, 5.8, 'Add boxing fitness schema. Create beginner-focused content.'),
      (67, 80, true, true, true, true, true, false, 84, 4.8, 198, 40, 8, 45, 32, 38, 3800, 24000, 1500, 3.0, 'Strong Pilates brand. Target "reformer Pilates [city]" keywords.'),
      (68, 70, true, true, true, true, false, false, 72, 4.6, 145, 18, 3, 28, 14, 22, 2200, 12000, 520, 5.5, 'Create outdoor workout content. Target "boot camp [city]" keywords.'),
      (69, 63, true, true, true, true, false, false, 60, 4.4, 112, 12, 1, 20, 6, 15, 1800, 9500, 350, 7.5, 'Low authority. Build swim-specific content. Target "swim lessons [city]".'),
      (70, 74, true, true, true, true, false, false, 76, 4.7, 134, 22, 4, 32, 18, 28, 1800, 10000, 500, 5.0, 'Niche powerlifting audience. Create competition prep content.'),
      (71, 66, true, true, true, true, false, false, 68, 4.5, 98, 14, 2, 22, 8, 18, 1200, 6800, 280, 7.0, 'New concept — needs more awareness content. Target flexibility/recovery keywords.'),
      (72, 79, true, true, true, true, true, false, 82, 4.8, 167, 35, 6, 42, 28, 35, 3200, 20000, 1200, 3.5, 'Strong martial arts brand. Create style-specific pages. Add competition results.'),
      (73, 71, true, true, true, true, false, false, 74, 4.6, 189, 20, 4, 30, 15, 25, 2400, 14000, 650, 5.2, 'Target "soul cycle" and premium cycling keywords. Add ride type descriptions.'),
      (74, 73, true, true, true, true, false, false, 76, 4.7, 145, 22, 4, 30, 16, 25, 2800, 16000, 750, 4.8, 'Target "women gym [city]" keywords. Create class schedule content.'),
      (75, 65, true, true, true, true, false, false, 66, 4.5, 87, 12, 2, 20, 8, 16, 1200, 6500, 260, 7.2, 'Low authority. Create race training content. Target "running coach [city]".'),
      (76, 89, true, true, true, true, true, true, 92, 4.9, 367, 58, 14, 60, 48, 55, 7500, 52000, 3600, 1.6, 'TOP 3. Dominating local vet search. Expand to target specialty care keywords.'),
      (77, 72, true, true, true, true, false, false, 75, 4.6, 245, 22, 4, 32, 16, 25, 3200, 18000, 850, 4.8, 'Add grooming breed-specific pages. Target "dog grooming near me".'),
      (78, 85, true, true, true, true, true, true, 88, 4.8, 312, 48, 10, 55, 42, 48, 6200, 42000, 2800, 2.2, 'Strong ER vet presence. Target "emergency vet [city]" keywords.'),
      (79, 76, true, true, true, true, true, false, 80, 4.7, 198, 35, 6, 40, 25, 32, 3500, 22000, 1200, 3.8, 'Good daycare presence. Add webcam/virtual tour pages. Target boarding keywords.'),
      (80, 82, true, true, true, true, true, true, 86, 4.9, 145, 42, 8, 48, 35, 42, 2200, 14000, 900, 2.8, 'Unique cat-only niche. Create feline-specific health content.'),
      (81, 69, true, true, true, true, false, false, 70, 4.5, 234, 18, 3, 28, 12, 22, 2800, 16000, 680, 5.5, 'Add luxury suite showcase. Target "pet resort [city]" keywords.'),
      (82, 80, true, true, true, true, true, false, 84, 4.8, 167, 38, 8, 45, 30, 38, 3500, 22000, 1400, 3.2, 'Good training authority. Create breed-specific training content.'),
      (83, 77, true, true, true, true, true, false, 80, 4.7, 89, 28, 5, 38, 22, 30, 1800, 10000, 600, 4.0, 'Unique mobile vet concept. Create convenience-focused content.'),
      (84, 75, true, true, true, true, false, false, 78, 4.6, 78, 22, 3, 30, 15, 25, 1200, 6500, 320, 5.5, 'Exotic vet is a high-value niche. Create species-specific care pages.'),
      (85, 71, true, true, true, true, false, false, 72, 4.7, 156, 20, 3, 28, 14, 22, 2200, 12000, 520, 5.2, 'Add spa treatment descriptions. Target "dog spa [city]" keywords.'),
      (86, 58, true, true, false, true, false, false, 48, 4.3, 203, 8, 0, 14, 4, 10, 1800, 10000, 350, 8.5, 'Website not mobile-friendly. Very basic optimization. Self-wash niche has potential.'),
      (87, 78, true, true, true, true, true, false, 82, 4.8, 178, 32, 6, 42, 25, 35, 2800, 18000, 1050, 3.8, 'Solid local vet. Create preventive care content hub.'),
      (88, 68, true, true, true, true, false, false, 70, 4.5, 123, 14, 2, 22, 10, 18, 1500, 8500, 350, 6.5, 'Create pet nutrition guides. Target "best dog food" type keywords.'),
      (89, 79, true, true, true, true, true, false, 82, 4.8, 198, 35, 6, 42, 28, 35, 2400, 14000, 850, 3.5, 'Good pet sitter presence. Target neighborhood-specific keywords.'),
      (90, 64, true, true, true, true, false, false, 65, 4.6, 67, 15, 2, 20, 8, 15, 800, 4500, 180, 7.5, 'Niche equine market. Create horse health content. Target "equine vet [area]".'),
      (91, 86, true, true, true, true, true, true, 90, 4.8, 445, 58, 12, 58, 45, 50, 8500, 58000, 3800, 1.8, 'Top Italian restaurant. Add menu schema. Target "Italian restaurant [city]" keywords.'),
      (92, 81, true, true, true, true, true, false, 84, 4.7, 389, 42, 8, 48, 32, 40, 5800, 38000, 2200, 2.8, 'Strong cafe brand. Target "best coffee [city]" and bakery keywords.'),
      (93, 93, true, true, true, true, true, true, 96, 4.9, 512, 72, 18, 65, 55, 62, 12000, 85000, 6200, 1.2, 'TOP 1. #1 BBQ in Austin search. Maintain. Add pitmaster content. Video strategy.'),
      (94, 82, true, true, true, true, true, true, 86, 4.7, 298, 45, 10, 52, 38, 45, 6800, 45000, 2800, 2.5, 'Strong sushi presence. Add omakase content. Target "best sushi [city]".'),
      (95, 87, true, true, true, true, true, true, 90, 4.8, 567, 55, 14, 58, 48, 52, 9200, 62000, 4200, 1.6, 'Top Mexican restaurant. Create regional dish content. Add chef story pages.'),
      (96, 84, true, true, true, true, true, true, 88, 4.8, 234, 48, 10, 55, 42, 48, 4800, 32000, 2100, 2.2, 'Strong farm-to-table brand. Create seasonal menu content. Add farm partner pages.'),
      (97, 73, true, true, true, true, false, false, 75, 4.5, 312, 22, 4, 32, 16, 25, 5200, 32000, 1400, 4.5, 'High search volume. Add menu schema. Target "Chinese food [city]" keywords.'),
      (98, 74, true, true, true, true, false, false, 76, 4.6, 178, 25, 4, 32, 18, 28, 3200, 18000, 850, 4.5, 'Create Mediterranean diet content. Target health-conscious food searches.'),
      (99, 78, true, true, true, true, true, false, 82, 4.7, 189, 35, 6, 42, 28, 35, 3800, 24000, 1400, 3.5, 'Growing vegan niche. Target "vegan restaurant [city]" and specific dish keywords.'),
      (100, 76, true, true, true, true, true, false, 80, 4.6, 267, 30, 5, 38, 22, 32, 4500, 28000, 1500, 3.8, 'Good seafood brand. Add seasonal crawfish content. Target "seafood [city]".'),
      (101, 70, true, true, true, true, false, false, 72, 4.5, 198, 18, 3, 28, 14, 22, 2800, 16000, 700, 5.2, 'Add Indian cuisine schema. Target "Indian buffet near me" keywords.'),
      (102, 79, true, true, true, true, true, false, 82, 4.7, 356, 38, 8, 45, 30, 38, 5500, 35000, 2000, 3.2, 'Strong burger brand. Create burger comparison content. Add loyalty program page.'),
      (103, 81, true, true, true, true, true, false, 84, 4.8, 234, 42, 8, 48, 32, 40, 4200, 28000, 1700, 2.8, 'Good pizza niche. Add Neapolitan pizza content. Target "[city] best pizza".'),
      (104, 74, true, true, true, true, false, false, 76, 4.6, 267, 22, 4, 32, 18, 28, 3800, 22000, 1000, 4.5, 'Add Vietnamese cuisine content. Target "pho near me" keywords.'),
      (105, 80, true, true, true, true, true, false, 84, 4.9, 189, 40, 8, 45, 32, 38, 3500, 22000, 1400, 3.0, 'Growing BBQ brand. Add pitmaster story. Target "BBQ [city]" keywords.'),
      (106, 74, true, true, true, true, false, false, 76, 4.5, 298, 22, 4, 32, 18, 28, 4800, 28000, 1200, 4.5, 'Add auto repair schema. Target "mechanic near me" keywords.'),
      (107, 79, true, true, true, true, true, false, 82, 4.7, 167, 35, 6, 42, 28, 35, 3200, 20000, 1200, 3.5, 'Strong European car niche. Target make-specific keywords (BMW repair, etc.).'),
      (108, 68, true, true, true, true, false, false, 70, 4.4, 234, 16, 2, 25, 10, 20, 3800, 22000, 900, 5.5, 'Add body shop schema. Create insurance claim guide content.'),
      (109, 65, true, true, true, true, false, false, 65, 4.3, 445, 12, 2, 20, 8, 16, 5200, 32000, 1200, 5.8, 'High search volume but low optimization. Add oil change schema. Quick wins available.'),
      (110, 71, true, true, true, true, false, false, 72, 4.5, 198, 18, 3, 28, 14, 22, 3500, 20000, 850, 5.0, 'Create tire buying guide content. Target "tire shop [city]" keywords.'),
      (111, 82, true, true, true, true, true, true, 88, 4.8, 89, 42, 8, 48, 35, 42, 2200, 14000, 900, 2.8, 'First mover in EV service niche. Create Tesla-specific content. High growth potential.'),
      (112, 66, true, true, true, true, false, false, 68, 4.4, 156, 14, 2, 22, 8, 18, 2400, 14000, 560, 6.2, 'Add transmission-specific content. Target "transmission repair [city]".'),
      (113, 80, true, true, true, true, true, false, 84, 4.7, 178, 40, 8, 45, 30, 38, 3200, 20000, 1300, 3.2, 'Strong detailing brand. Create ceramic coating content. Add before/after gallery.'),
      (114, 69, true, true, true, true, false, false, 70, 4.5, 312, 15, 2, 25, 10, 20, 4200, 25000, 1000, 5.2, 'High review count helps. Add mobile service content. Target "windshield repair [city]".'),
      (115, 62, true, true, true, true, false, false, 58, 4.3, 145, 10, 1, 18, 6, 14, 1800, 10000, 380, 7.5, 'Low optimization. Create exhaust system comparison content.'),
      (116, 64, true, true, true, true, false, false, 62, 4.4, 112, 12, 1, 20, 8, 16, 1500, 8500, 320, 7.0, 'Add auto electrical content. Target "car not starting" type searches.'),
      (117, 75, true, true, true, true, true, false, 78, 4.6, 234, 28, 5, 38, 22, 30, 4500, 28000, 1400, 4.0, 'Good brake specialist niche. Target "brake repair [city]" keywords.'),
      (118, 67, true, true, true, true, false, false, 68, 4.5, 198, 14, 2, 22, 10, 18, 3800, 22000, 850, 5.5, 'Target "car AC repair" — high volume in Texas. Add seasonal content.'),
      (119, 76, true, true, true, true, true, false, 80, 4.7, 87, 32, 5, 38, 22, 30, 1800, 10000, 600, 4.2, 'Growing performance niche. Create car-specific tuning content.'),
      (120, 60, true, true, true, true, false, false, 55, 4.2, 156, 10, 1, 16, 6, 12, 2800, 16000, 580, 7.8, 'Low optimization. Add inventory schema. Create financing guide content.');
    `);

    // Seed keyword rankings — top keywords for top businesses
    await client.query(`
      INSERT INTO keyword_rankings (business_id, keyword, position, previous_position, search_volume, difficulty, url, location) VALUES
      (93, 'best japanese restaurant austin', 1, 1, 6800, 72, 'https://uchi.uchirestaurants.com', 'Austin, TX'),
      (93, 'sushi austin tx', 1, 2, 8100, 68, 'https://uchi.uchirestaurants.com', 'Austin, TX'),
      (93, 'omakase austin', 1, 1, 3200, 58, 'https://uchi.uchirestaurants.com', 'Austin, TX'),
      (93, 'best sushi near me austin', 2, 3, 12000, 65, 'https://uchi.uchirestaurants.com', 'Austin, TX'),
      (93, 'fine dining austin', 3, 4, 4800, 75, 'https://uchi.uchirestaurants.com', 'Austin, TX'),
      (46, 'best hair salon austin', 1, 2, 6800, 70, 'https://urbanbetty.com', 'Austin, TX'),
      (46, 'balayage austin tx', 1, 1, 3200, 55, 'https://urbanbetty.com', 'Austin, TX'),
      (46, 'hair color specialist austin', 2, 3, 4800, 62, 'https://urbanbetty.com', 'Austin, TX'),
      (46, 'hair salon near me austin', 3, 4, 18000, 78, 'https://urbanbetty.com', 'Austin, TX'),
      (46, 'bridal hair austin', 1, 1, 1800, 42, 'https://urbanbetty.com', 'Austin, TX'),
      (76, 'best vet austin', 1, 1, 5400, 68, 'https://www.austinvethospital.com', 'Austin, TX'),
      (76, 'veterinarian near me austin', 2, 2, 8800, 72, 'https://www.austinvethospital.com', 'Austin, TX'),
      (76, 'pet vaccination austin', 1, 1, 2400, 45, 'https://www.austinvethospital.com', 'Austin, TX'),
      (76, 'dog dentist austin', 1, 2, 1200, 38, 'https://www.austinvethospital.com', 'Austin, TX'),
      (76, 'emergency vet austin tx', 3, 4, 3800, 65, 'https://www.austinvethospital.com', 'Austin, TX'),
      (16, 'business lawyer austin', 1, 2, 4800, 72, 'https://www.gdhm.com', 'Austin, TX'),
      (16, 'corporate attorney austin tx', 2, 3, 3200, 68, 'https://www.gdhm.com', 'Austin, TX'),
      (16, 'commercial litigation austin', 1, 1, 2400, 65, 'https://www.gdhm.com', 'Austin, TX'),
      (95, 'best ramen austin', 1, 1, 8800, 72, 'https://www.ramen-tatsuya.com', 'Austin, TX'),
      (95, 'ramen near me austin', 2, 3, 12000, 68, 'https://www.ramen-tatsuya.com', 'Austin, TX'),
      (8, 'dermatologist houston tx', 2, 3, 4800, 65, 'https://www.allustradermatology.com', 'Houston, TX'),
      (8, 'acne treatment houston', 1, 1, 2200, 52, 'https://www.allustradermatology.com', 'Houston, TX'),
      (63, 'crossfit houston', 1, 1, 5400, 62, 'https://www.crossfithouston.com', 'Houston, TX'),
      (63, 'crossfit gym near me houston', 2, 3, 3200, 55, 'https://www.crossfithouston.com', 'Houston, TX'),
      (31, 'plumber austin tx', 2, 3, 5800, 70, 'https://www.stansac.com', 'Austin, TX'),
      (31, 'emergency plumber austin', 3, 4, 12000, 75, 'https://www.stansac.com', 'Austin, TX'),
      (1, 'dentist austin tx', 3, 4, 6200, 72, 'https://southaustindentalassociates.com', 'Austin, TX'),
      (1, 'teeth whitening austin', 2, 2, 2400, 55, 'https://southaustindentalassociates.com', 'Austin, TX'),
      (91, 'best bbq austin', 1, 1, 8100, 72, 'https://franklinbbq.com', 'Austin, TX'),
      (91, 'brisket austin tx', 2, 3, 3200, 55, 'https://franklinbbq.com', 'Austin, TX'),
      (51, 'spa dallas tx', 1, 2, 4800, 65, 'https://www.purespaandsalon.com', 'Dallas, TX'),
      (51, 'massage dallas', 2, 3, 3200, 60, 'https://www.purespaandsalon.com', 'Dallas, TX'),
      (35, 'roofing san antonio', 1, 1, 4200, 58, 'https://presidioroof.com', 'San Antonio, TX'),
      (35, 'roof repair san antonio tx', 2, 2, 3200, 52, 'https://presidioroof.com', 'San Antonio, TX'),
      (111, 'tire shop dallas', 1, 1, 3800, 55, 'https://www.discounttire.com', 'Dallas, TX'),
      (111, 'discount tires near me dallas', 1, 2, 4200, 50, 'https://www.discounttire.com', 'Dallas, TX');
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error(`Seed error: ${err.message}`);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(`Demo reset failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { seed };
