const test = require('node:test');
const assert = require('node:assert/strict');
const { RequestQueue } = require('../src/requestQueue');

test('queues WhatsApp requests ahead of future playlist items in request order', () => {
  const queue = new RequestQueue();

  assert.equal(queue.enqueueNext([{ title: 'A' }, { title: 'B' }]), 2);
  assert.equal(queue.size(), 2);
  assert.deepEqual(queue.takeNext(), { title: 'A' });
  assert.deepEqual(queue.takeNext(), { title: 'B' });
  assert.equal(queue.takeNext(), null);
});
