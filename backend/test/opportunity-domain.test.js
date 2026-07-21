const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateIdempotencyKey,
  validateOpportunitySubmission,
  validateStatusTransition,
} = require('../domain/opportunity');

const validSubmission = {
  company_name: '  Example Company  ',
  contact_name: 'Ada Lovelace',
  email: 'ADA@EXAMPLE.COM',
  phone: '+1 (212) 555-0100',
  opportunity_type: 'Consulting Project',
  description: 'A sufficiently detailed consulting opportunity description.',
  region: 'North America',
  budget_range: '$50k-$100k',
  consent: true,
};

test('public opportunity input is normalized and bounded', () => {
  const result = validateOpportunitySubmission(validSubmission);
  assert.equal(result.company_name, 'Example Company');
  assert.equal(result.email, 'ada@example.com');
  assert.equal(validateIdempotencyKey('submission_1234567890'), 'submission_1234567890');

  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, email: 'not-an-email' }), /email is invalid/);
  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, opportunity_type: 'Unknown' }), /unsupported/);
  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, description: 'too short' }), /too short/);
  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, consent: false }), /consent is required/);
  assert.equal(
    validateOpportunitySubmission({ ...validSubmission, description: 'First line of context.\r\nSecond line of context.' }).description,
    'First line of context.\nSecond line of context.',
  );
  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, company_name: 'Bad\nCompany' }), /control characters/);
  assert.throws(() => validateOpportunitySubmission({ ...validSubmission, description: 'Valid length with a null byte\0 inside.' }), /control characters/);
  assert.throws(() => validateIdempotencyKey('short'), /16 through 128/);
});

test('opportunity state changes follow the declared workflow', () => {
  assert.deepEqual(validateStatusTransition('new', 'reviewing', 'Initial review'), {
    status: 'reviewing',
    note: 'Initial review',
  });
  assert.deepEqual(validateStatusTransition('qualified', 'proposal'), {
    status: 'proposal',
    note: null,
  });
  assert.throws(() => validateStatusTransition('qualified', 'reviewing'), /not allowed/);
  assert.throws(() => validateStatusTransition('converted', 'closed', 'Changed mind'), /not allowed/);
  assert.throws(() => validateStatusTransition('new', 'closed'), /note is required/);
});
