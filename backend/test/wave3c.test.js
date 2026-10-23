'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { leadPipelineSummary, leadFollowupTriage, leadSourcePerformance } = require('../routes/wave3c');

test('wave3c: lead pipeline fallback preserves 0/false and is not AI-generated', () => {
  const out = leadPipelineSummary([{ name: 'A', status: 'new', value: 0 }]);
  assert.equal(out.aiGenerated, false);
  assert.equal(out.sections.metrics.totalValue, 0);
  assert.equal(out.sections.metrics.hasUnvaluedLeads, true);
});

test('wave3c: follow-up triage counts overdue open leads', () => {
  const out = leadFollowupTriage([{ name: 'A', status: 'new', follow_up_date: '2000-01-01' }], new Date('2024-01-01'));
  assert.equal(out.sections.metrics.overdueLeads, 1);
});

test('wave3c: source performance groups value by source preserving 0/false', () => {
  const out = leadSourcePerformance([{ name: 'A', source: 'web', value: 0 }, { name: 'B', source: 'web', value: 50 }, { name: 'C', value: 5 }]);
  assert.equal(out.aiGenerated, false);
  assert.equal(out.sections.metrics.bySource.web.value, 50);
  assert.equal(out.sections.metrics.hasSourcedLeads, true);
  assert.equal(leadSourcePerformance([{ name: 'X' }]).sections.metrics.hasSourcedLeads, false);
});
