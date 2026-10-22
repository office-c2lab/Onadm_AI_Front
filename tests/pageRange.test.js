import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPageRange, normalizePagination } from '../src/components/pagination/pageRange.js';

test('pagination stays in bounds at each edge and in the middle', () => {
  assert.deepEqual(buildPageRange(1, 10), [1, 2, 3, 4, 5]);
  assert.deepEqual(buildPageRange(6, 10), [4, 5, 6, 7, 8]);
  assert.deepEqual(buildPageRange(10, 10), [6, 7, 8, 9, 10]);
  assert.deepEqual(buildPageRange(2, 3), [1, 2, 3]);
});
test('filtered/deleted rows and malformed page inputs cannot create invalid links', () => {
  assert.deepEqual(normalizePagination(9, 2), { currentPage: 2, totalPages: 2 });
  assert.deepEqual(buildPageRange(9, 2), [1, 2]);
  assert.deepEqual(buildPageRange(1, 0), []);
  assert.deepEqual(buildPageRange(1, -4), []);
  assert.deepEqual(buildPageRange(NaN, Infinity), []);
  assert.deepEqual(buildPageRange(-5, 2.7), [1, 2]);
});
