const OPPORTUNITY_TYPES = new Set([
  'Consulting Project',
  'Executive Search',
  'Investment Deal',
  'Partnership',
  'Other',
]);

const STATUS_TRANSITIONS = Object.freeze({
  new: Object.freeze(['reviewing', 'qualified', 'closed']),
  reviewing: Object.freeze(['qualified', 'closed']),
  qualified: Object.freeze(['proposal', 'closed']),
  proposal: Object.freeze(['negotiation', 'closed']),
  negotiation: Object.freeze(['converted', 'closed']),
  converted: Object.freeze([]),
  closed: Object.freeze([]),
});

function cleanString(value, field, { required = false, min = 0, max, multiline = false }) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new TypeError(`${field} is required`);
    return null;
  }
  if (typeof value !== 'string') throw new TypeError(`${field} must be text`);
  const cleaned = value.trim().replace(/\r\n?/g, '\n');
  if ((required && cleaned.length < Math.max(1, min)) || cleaned.length < min) throw new TypeError(`${field} is too short`);
  if (cleaned.length > max) throw new TypeError(`${field} is too long`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u.test(cleaned) || (!multiline && /[\n\t]/.test(cleaned))) {
    throw new TypeError(`${field} contains unsupported control characters`);
  }
  return cleaned;
}

function validateIdempotencyKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9:_-]{16,128}$/.test(value)) {
    throw new TypeError('Idempotency-Key must contain 16 through 128 safe characters');
  }
  return value;
}

function validateOpportunitySubmission(body) {
  if (body?.consent !== true) throw new TypeError('consent is required');
  const companyName = cleanString(body?.company_name, 'company_name', { required: true, min: 2, max: 255 });
  const contactName = cleanString(body?.contact_name, 'contact_name', { required: true, min: 2, max: 255 });
  const email = cleanString(body?.email, 'email', { required: true, min: 3, max: 255 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('email is invalid');
  const phone = cleanString(body?.phone, 'phone', { max: 50 });
  if (phone && !/^\+?[0-9().\-\s]{7,50}$/.test(phone)) throw new TypeError('phone is invalid');
  const opportunityType = cleanString(body?.opportunity_type, 'opportunity_type', { required: true, max: 100 });
  if (!OPPORTUNITY_TYPES.has(opportunityType)) throw new TypeError('opportunity_type is unsupported');
  return {
    company_name: companyName,
    contact_name: contactName,
    email,
    phone,
    opportunity_type: opportunityType,
    description: cleanString(body?.description, 'description', { required: true, min: 20, max: 5000, multiline: true }),
    region: cleanString(body?.region, 'region', { max: 100 }),
    budget_range: cleanString(body?.budget_range, 'budget_range', { max: 100 }),
    consent: true,
  };
}

function validateStatusTransition(fromStatus, toStatus, note) {
  if (!Object.hasOwn(STATUS_TRANSITIONS, fromStatus)) throw new TypeError('Current opportunity status is unsupported');
  if (!STATUS_TRANSITIONS[fromStatus].includes(toStatus)) throw new TypeError(`Transition from ${fromStatus} to ${toStatus} is not allowed`);
  const cleanedNote = cleanString(note, 'note', { max: 500 });
  if (toStatus === 'closed' && !cleanedNote) throw new TypeError('A note is required when closing an opportunity');
  return { status: toStatus, note: cleanedNote };
}

module.exports = {
  OPPORTUNITY_TYPES,
  STATUS_TRANSITIONS,
  validateIdempotencyKey,
  validateOpportunitySubmission,
  validateStatusTransition,
};
