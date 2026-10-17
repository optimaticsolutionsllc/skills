import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cosineSimilarity, rankedClips } from '../src/math.ts';
test('same vector has similarity 1', () => assert.ok(Math.abs(cosineSimilarity([1, 2, 3, 4], [1, 2, 3, 4]) - 1) < 1e-12));
test('unrelated unit axes score 0', () => assert.equal(cosineSimilarity([1, 0, 0, 0], [0, 1, 0, 0]), 0));
test('zero vector avoids NaN', () => assert.equal(cosineSimilarity([0, 0, 0, 0], [1, 0, 0, 0]), 0));
test('closest clip ranks first', () => {
  const q = { vector: [1, 0, 0, 0] };
  const matches = rankedClips(q, [{ id: 'not', vector: [0, 1, 0, 0] }, { id: 'yes', vector: [1, 0.1, 0, 0] }]);
  assert.equal(matches[0].clip.id, 'yes');
});