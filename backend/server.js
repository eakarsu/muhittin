const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/social', require('./routes/social'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/seo', require('./routes/seo'));

// Consulting routes
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/consulting-payments', require('./routes/consulting-payments'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/service-packages', require('./routes/service-packages'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/case-studies', require('./routes/case-studies'));
app.use('/api/industries', require('./routes/industries'));
app.use('/api/search', require('./routes/search'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Muhittin backend running on port ${PORT}`);
});
