const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Initialize Stripe - handle missing key gracefully
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? require('stripe')(stripeKey) : null;

function requireStripe(req, res, next) {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
  next();
}

// Create Checkout Session for a service package
router.post('/create-checkout', authenticateToken, requireStripe, async (req, res) => {
  try {
    const { package_id, contact_email, contact_name, success_url, cancel_url } = req.body;

    const pkg = await pool.query('SELECT * FROM service_packages WHERE id = $1', [package_id]);
    if (pkg.rows.length === 0) return res.status(404).json({ error: 'Package not found' });

    const servicePackage = pkg.rows[0];

    const sessionParams = {
      payment_method_types: ['card'],
      customer_email: contact_email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: servicePackage.name },
          unit_amount: Math.round(servicePackage.price * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        package_id: servicePackage.id,
        contact_name: contact_name
      }
    };

    // Use existing Stripe price if available
    if (servicePackage.stripe_price_id) {
      sessionParams.line_items = [{
        price: servicePackage.stripe_price_id,
        quantity: 1
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create and send invoice for a deal
router.post('/create-invoice', authenticateToken, requireStripe, async (req, res) => {
  try {
    const { deal_id, items, contact_email } = req.body;

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: contact_email, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: contact_email });
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: true,
      metadata: { deal_id: deal_id }
    });

    // Add line items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        description: item.description,
        amount: Math.round(item.amount * 100),
        currency: 'usd'
      });
    }

    // Finalize and send
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    res.json({
      invoice_id: finalizedInvoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url,
      invoice_pdf: finalizedInvoice.invoice_pdf,
      status: finalizedInvoice.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment status for a checkout session
router.get('/payment-status/:session_id', authenticateToken, requireStripe, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.session_id);
    res.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook handler
// NOTE: server.js needs special handling for this route - the webhook endpoint
// requires the raw request body (not parsed by express.json). In server.js, add:
//   app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
// BEFORE the general express.json() middleware, or use a route-specific approach.
router.post('/webhook', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await pool.query(
          `INSERT INTO consulting_payments (amount, currency, status, stripe_payment_id, receipt_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            (session.amount_total || 0) / 100,
            session.currency || 'usd',
            'completed',
            session.payment_intent,
            session.url
          ]
        );
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        if (invoice.metadata && invoice.metadata.deal_id) {
          await pool.query("UPDATE deals SET stage = 'won' WHERE id = $1", [invoice.metadata.deal_id]);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object;
        console.error('Invoice payment failed:', failedInvoice.id, 'Customer:', failedInvoice.customer);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
