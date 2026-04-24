const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config({ path: __dirname + '/../../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callAI(prompt, systemPrompt = 'You are a helpful business growth assistant for local businesses. Provide practical, actionable advice formatted in clean markdown.') {
  if (!OPENROUTER_API_KEY) {
    return '**AI features require an OpenRouter API key.** Add your `OPENROUTER_API_KEY` to the `.env` file to enable AI-powered suggestions.\n\nFor now, here\'s a sample response based on best practices.';
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Muhittin Platform'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      })
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (data.error) {
      return `AI error: ${data.error.message || JSON.stringify(data.error)}`;
    }
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    return 'Unable to generate response. Please try again.';
  } catch (err) {
    if (err.name === 'AbortError') return 'AI request timed out after 30 seconds. Please try again.';
    return `AI service error: ${err.message}`;
  }
}

// Generate business description
router.post('/generate-description', authenticateToken, async (req, res) => {
  try {
    const { businessName, category, services, city } = req.body;
    const prompt = `Write a compelling, professional business description for "${businessName}", a ${category} business in ${city || 'the local area'}. They offer: ${services || 'various services'}. Make it 2-3 paragraphs, highlighting unique value propositions and why customers should choose them.`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest services
router.post('/suggest-services', authenticateToken, async (req, res) => {
  try {
    const { category, subcategory, currentServices } = req.body;
    const prompt = `Suggest 10-15 services for a ${subcategory || category} business. Current services: ${currentServices || 'none listed'}. Format as a markdown list with service name, brief description, and suggested price range. Focus on profitable services that local businesses commonly offer.`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate review response
router.post('/review-response', authenticateToken, async (req, res) => {
  try {
    const { customerName, rating, comment, businessName } = req.body;
    const prompt = `Write a professional, warm response to this ${rating}-star review for ${businessName || 'our business'}:\n\nReviewer: ${customerName}\nReview: "${comment}"\n\nThe response should:\n- Thank the customer by name\n- Address specific points they mentioned\n- ${rating >= 4 ? 'Express gratitude and invite them back' : 'Apologize sincerely and offer to make things right'}\n- Keep it under 100 words\n- Sound genuine, not corporate`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate campaign content
router.post('/campaign-content', authenticateToken, async (req, res) => {
  try {
    const { businessName, campaignType, goal, targetAudience, promotion } = req.body;
    const prompt = `Create ${campaignType || 'email'} marketing content for ${businessName || 'a local business'}.\n\nGoal: ${goal || 'increase bookings'}\nTarget: ${targetAudience || 'existing customers'}\nPromotion: ${promotion || 'seasonal offer'}\n\nProvide:\n- Subject line (for email) or opening hook (for SMS)\n- Full body content\n- Call-to-action\n- ${campaignType === 'sms' ? 'Keep under 160 characters' : 'Keep email body under 200 words'}`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Score and prioritize leads
router.post('/lead-score', authenticateToken, async (req, res) => {
  try {
    const { leads } = req.body;
    const leadSummary = (leads || []).map(l => `${l.name} - Source: ${l.source}, Value: $${l.value}, Status: ${l.status}, Notes: ${l.notes || 'none'}`).join('\n');
    const prompt = `Analyze and score these leads on a scale of 1-10 for likelihood to convert. Provide prioritized recommendations:\n\n${leadSummary || 'No leads provided'}\n\nFor each lead, provide:\n- Score (1-10)\n- Priority action\n- Suggested follow-up approach\n- Estimated conversion timeline`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate social media post
router.post('/social-post', authenticateToken, async (req, res) => {
  try {
    const { businessName, platform, topic, tone, category } = req.body;
    const prompt = `Create a ${platform || 'instagram'} post for ${businessName || 'a local business'} (${category || 'local service'}).\n\nTopic: ${topic || 'business promotion'}\nTone: ${tone || 'professional and engaging'}\n\nProvide:\n- Post caption (appropriate length for ${platform || 'instagram'})\n- 5-8 relevant hashtags\n- Best time to post suggestion\n- Image/visual suggestion`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate website copy
router.post('/website-copy', authenticateToken, async (req, res) => {
  try {
    const { businessName, category, services, goal } = req.body;
    const prompt = `Write landing page copy for ${businessName || 'a local business'} (${category || 'local service'}).\n\nServices: ${services || 'various'}\nGoal: ${goal || 'generate leads'}\n\nProvide:\n- Headline (under 10 words)\n- Subheadline (1-2 sentences)\n- 3 key benefit sections with titles and descriptions\n- Call-to-action text\n- Social proof section suggestion`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer insights
router.post('/customer-insights', authenticateToken, async (req, res) => {
  try {
    const { name, email, source, tags, total_spent, visit_count, notes } = req.body;
    const prompt = `Analyze this customer profile and suggest engagement strategies:\n\nName: ${name}\nSource: ${source || 'unknown'}\nTags: ${tags || 'none'}\nTotal Spent: $${total_spent || 0}\nVisits: ${visit_count || 0}\nNotes: ${notes || 'none'}\n\nProvide:\n- Customer segment classification\n- Personalized upsell/cross-sell opportunities\n- Retention strategy\n- Recommended next touchpoint`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Booking optimization
router.post('/booking-suggest', authenticateToken, async (req, res) => {
  try {
    const { service_name, customer_name, date, duration, price } = req.body;
    const prompt = `Suggest follow-up actions for this booking:\n\nService: ${service_name}\nCustomer: ${customer_name}\nDate: ${date}\nDuration: ${duration} min\nPrice: $${price}\n\nProvide:\n- Follow-up message to send after appointment\n- Upsell suggestion for next visit\n- Recommended rebooking timeframe\n- Customer satisfaction check-in template`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Contact outreach
router.post('/contact-outreach', authenticateToken, async (req, res) => {
  try {
    const { name, company, industry, region, lifecycle_stage, interest } = req.body;
    const prompt = `Draft a personalized outreach strategy for this consulting contact:\n\nName: ${name}\nCompany: ${company || 'unknown'}\nIndustry: ${industry || 'unknown'}\nRegion: ${region || 'unknown'}\nStage: ${lifecycle_stage || 'visitor'}\nInterest: ${interest || 'general consulting'}\n\nProvide:\n- Personalized email draft (under 150 words)\n- 3 talking points for a call\n- Value proposition tailored to their industry\n- Suggested meeting agenda`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Company research
router.post('/company-research', authenticateToken, async (req, res) => {
  try {
    const { name, industry, size, region, website } = req.body;
    const prompt = `Provide a strategic analysis for engaging this company as a consulting client:\n\nCompany: ${name}\nIndustry: ${industry || 'unknown'}\nSize: ${size || 'unknown'}\nRegion: ${region || 'unknown'}\nWebsite: ${website || 'N/A'}\n\nProvide:\n- Likely business challenges based on industry and size\n- Recommended service offerings to pitch\n- Competitive positioning strategy\n- Key decision-maker approach`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Deal strategy
router.post('/deal-strategy', authenticateToken, async (req, res) => {
  try {
    const { service_line, opportunity_type, value, stage, region } = req.body;
    const prompt = `Suggest a winning strategy for this consulting deal:\n\nService: ${service_line || 'consulting'}\nType: ${opportunity_type || 'general'}\nValue: $${value || 0}\nStage: ${stage || 'discovery'}\nRegion: ${region || 'unknown'}\n\nProvide:\n- Next steps to advance the deal\n- Key risks and mitigation strategies\n- Pricing/negotiation recommendations\n- Competitive differentiation points\n- Timeline to close`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Candidate evaluation
router.post('/candidate-evaluate', authenticateToken, async (req, res) => {
  try {
    const { name, industry, role_level, experience_years, region, skills, compensation_min, compensation_max } = req.body;
    const prompt = `Evaluate this executive candidate and suggest placement opportunities:\n\nName: ${name}\nIndustry: ${industry || 'unknown'}\nRole Level: ${role_level || 'unknown'}\nExperience: ${experience_years || 0} years\nRegion: ${region || 'unknown'}\nSkills: ${skills || 'not specified'}\nCompensation: $${compensation_min || 0} - $${compensation_max || 0}\n\nProvide:\n- Candidate strength assessment\n- Ideal role/company profile match\n- Market positioning vs compensation expectations\n- Interview preparation tips\n- Placement probability score (1-10)`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Partner strategy
router.post('/partner-strategy', authenticateToken, async (req, res) => {
  try {
    const { company_name, type, region, industry, status } = req.body;
    const prompt = `Develop a partnership engagement strategy:\n\nPartner: ${company_name}\nType: ${type || 'referral'}\nRegion: ${region || 'unknown'}\nIndustry: ${industry || 'unknown'}\nStatus: ${status || 'new'}\n\nProvide:\n- Partnership value proposition\n- Revenue sharing model suggestion\n- Joint go-to-market opportunities\n- KPIs to track partnership success\n- Engagement timeline and milestones`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Payment/invoice analysis
router.post('/payment-analysis', authenticateToken, async (req, res) => {
  try {
    const { service, amount, currency, status, contact_name } = req.body;
    const prompt = `Analyze this payment and suggest next actions:\n\nService: ${service || 'consulting'}\nAmount: ${amount} ${currency || 'USD'}\nStatus: ${status || 'pending'}\nClient: ${contact_name || 'unknown'}\n\nProvide:\n- ${status === 'pending' ? 'Follow-up strategy to collect payment' : status === 'paid' ? 'Upsell opportunities' : 'Recovery strategy'}\n- Invoice optimization tips\n- Client relationship recommendations\n- Revenue forecasting insight`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Order delivery optimization
router.post('/order-optimize', authenticateToken, async (req, res) => {
  try {
    const { delivery_stage, service_package, contact_name } = req.body;
    const prompt = `Optimize delivery for this consulting order:\n\nStage: ${delivery_stage || 'kickoff'}\nPackage: ${service_package || 'consulting service'}\nClient: ${contact_name || 'unknown'}\n\nProvide:\n- Key milestones for current stage\n- Client communication template\n- Risk factors to monitor\n- Quality checkpoints\n- Handoff checklist for next stage`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Consultation prep
router.post('/consultation-prep', authenticateToken, async (req, res) => {
  try {
    const { name, company, service_interest, notes } = req.body;
    const prompt = `Prepare for this upcoming consultation:\n\nClient: ${name}\nCompany: ${company || 'unknown'}\nInterest: ${service_interest || 'general consulting'}\nNotes: ${notes || 'none'}\n\nProvide:\n- Pre-meeting research checklist\n- 5 discovery questions to ask\n- Value proposition talking points\n- Proposal framework outline\n- Follow-up action plan`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Insight article generator
router.post('/generate-insight', authenticateToken, async (req, res) => {
  try {
    const { title, category, domain } = req.body;
    const prompt = `Write a thought leadership article for a boutique consulting firm:\n\nTitle: ${title || 'Business Growth Strategy'}\nCategory: ${category || 'strategy'}\nDomain: ${domain || 'general'}\n\nWrite a professional, insightful article (400-500 words) that:\n- Opens with a compelling hook\n- Provides 3-4 actionable insights\n- Includes real-world examples\n- Ends with a clear takeaway\n- Positions the firm as an authority`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Opportunity assessment
router.post('/opportunity-assess', authenticateToken, async (req, res) => {
  try {
    const { company_name, opportunity_type, region, budget_range, description } = req.body;
    const prompt = `Assess this business opportunity:\n\nCompany: ${company_name}\nType: ${opportunity_type || 'consulting'}\nRegion: ${region || 'unknown'}\nBudget: ${budget_range || 'unknown'}\nDescription: ${description || 'none'}\n\nProvide:\n- Opportunity score (1-10)\n- Strategic fit analysis\n- Resource requirements estimate\n- Recommended approach/proposal outline\n- Key risks and go/no-go factors`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Meeting prep
router.post('/meeting-prep', authenticateToken, async (req, res) => {
  try {
    const { title, type, contact_name, company_name, agenda } = req.body;
    const prompt = `Prepare a comprehensive meeting brief:\n\nMeeting: ${title || 'Client Meeting'}\nType: ${type || 'general'}\nContact: ${contact_name || 'unknown'}\nCompany: ${company_name || 'unknown'}\nAgenda: ${agenda || 'general discussion'}\n\nProvide:\n- Pre-meeting preparation checklist\n- Opening talking points\n- Key questions to drive the conversation\n- Anticipated objections and responses\n- Meeting close and next steps template`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Package pricing suggestion
router.post('/package-pricing', authenticateToken, async (req, res) => {
  try {
    const { name, domain, description, current_price } = req.body;
    const prompt = `Analyze and suggest pricing strategy for this consulting service package:\n\nPackage: ${name}\nDomain: ${domain || 'consulting'}\nDescription: ${description || 'professional service'}\nCurrent Price: ${current_price ? '$' + current_price : 'not set'}\n\nProvide:\n- Market-based pricing recommendation\n- Value-based pricing justification\n- Tiered pricing options (basic/standard/premium)\n- Competitive positioning\n- Upsell and add-on suggestions`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// General business Q&A
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question, context } = req.body;
    const prompt = `${context ? `Context: ${context}\n\n` : ''}Question: ${question || 'How can I grow my local business?'}\n\nProvide practical, actionable advice with specific examples and steps.`;
    const result = await callAI(prompt);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
