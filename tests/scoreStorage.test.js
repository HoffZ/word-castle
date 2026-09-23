import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScore, saveScore, POINTS_PER_WORD } from '../src/services/scoreStorage.js';

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
  };
}

test('points accumulate across rounds and reloads', () => {
  const storage = memoryStorage();
  assert.equal(loadScore(storage), 0);
  saveScore(loadScore(storage) + 3 * POINTS_PER_WORD, storage);
  assert.equal(loadScore(storage), 300);
  saveScore(loadScore(storage) + 2 * POINTS_PER_WORD, storage);
  assert.equal(loadScore(storage), 500);
  assert.equal(saveScore(0, storage), 500);
  assert.equal(loadScore(storage), 500);
});

test('invalid saved points are preserved rather than reset', () => {
  const storage = memoryStorage('damaged');
  assert.throws(() => loadScore(storage));
  assert.throws(() => saveScore(100, storage));
  assert.equal(storage.getItem(), 'damaged');
});

test('storage failures are reported to the caller', () => {
  const storage = {
    getItem: () => '100',
    setItem: () => {
      throw new Error('Storage full');
    },
  };
  assert.throws(() => saveScore(200, storage), /Storage full/);
});
