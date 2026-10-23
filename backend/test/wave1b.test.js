'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const { createTaskStore, toCsv, LOCATION_COLUMNS } = require('../wave1b/core');
test('tasks are owner-scoped with create/list/update', () => { const s = createTaskStore(); const t = s.create('u1', { title: 'Follow up lead', notes: 'n' }); assert.equal(s.list('u1').length, 1); assert.equal(s.list('u2').length, 0); assert.equal(s.update('u2', t.id, { status: 'done' }), null); assert.equal(s.update('u1', t.id, { status: 'done' }).status, 'done'); });
test('lead csv preserves 0 and false', () => { const csv = toCsv([{ name: 'A,B', email: 'a@x.io', status: 0, source: false }], LOCATION_COLUMNS.slice(0, 4)); assert.match(csv, /"A,B",a@x\.io,0,false/); });
