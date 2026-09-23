import test from 'node:test';
import assert from 'node:assert/strict';
import { letterSlots, practiceAnswer, shuffle } from '../src/game/practice.js';

test('practice teaches a single accepted translation instead of spelling alternatives', () => {
  assert.equal(practiceAnswer({ english: ' big ; large ' }), 'big');
  assert.equal(
    letterSlots({ english: 'cat; kitty' })
      .map((slot) => slot.letter)
      .join(''),
    'cat',
  );
});

test('repeated letters remain separate stones and punctuation is supplied', () => {
  const slots = letterSlots({ english: "little cat's" });
  const letters = slots.filter((slot) => !slot.fixed);
  assert.equal(letters.filter((slot) => slot.letter === 't').length, 3);
  assert.equal(new Set(letters.map((slot) => slot.id)).size, letters.length);
  assert.deepEqual(
    slots.filter((slot) => slot.fixed).map((slot) => slot.letter),
    [' ', "'"],
  );
});

test('shuffling preserves every stone without changing the source array', () => {
  const letters = letterSlots({ english: 'letter' });
  const original = structuredClone(letters);
  const shuffled = shuffle(letters, () => 0);
  assert.deepEqual(letters, original);
  assert.deepEqual(shuffled.map((slot) => slot.id).sort(), letters.map((slot) => slot.id).sort());
  assert.notDeepEqual(shuffled, letters);
});
