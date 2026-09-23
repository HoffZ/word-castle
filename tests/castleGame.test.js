import test from 'node:test';
import assert from 'node:assert/strict';
import { isCorrectAnswer, nextWord, REQUIRED_WINS } from '../src/game/castleGame.js';

const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
test('answers accept case, outer spaces, repeated spaces and explicit alternatives', () => {
  assert.equal(isCorrectAnswer('  LARGE ', 'big; large'), true);
  assert.equal(isCorrectAnswer('ice   cream', 'ice cream'), true);
  assert.equal(isCorrectAnswer('cat', 'cats'), false);
  assert.equal(isCorrectAnswer('hund', 'dog'), false);
});
test('a round practises every word exactly once before finishing', () => {
  const progress = {};
  let previous;
  for (let turn = 0; turn < words.length * REQUIRED_WINS; turn++) {
    const word = nextWord(words, progress, previous, () => 0);
    assert.ok(word);
    if (previous) assert.notEqual(word.id, previous);
    progress[word.id] = (progress[word.id] || 0) + 1;
    previous = word.id;
  }
  assert.deepEqual(progress, { a: 1, b: 1, c: 1 });
  assert.equal(nextWord(words, progress, previous), null);
});
test('one-word homework works and completed words cannot return', () => {
  assert.equal(nextWord([words[0]], { a: 0 }, 'a').id, 'a');
  assert.equal(nextWord([words[0]], { a: 1 }, 'a'), null);
  assert.equal(nextWord(words, { a: 1, b: 1, c: 0 }, 'c').id, 'c');
});

test('the first zombie arrives immediately and takes a full minute to reach the castle', async () => {
  const { createAttack, advanceAttack } = await import('../src/game/castleGame.js');
  const attack = createAttack();
  assert.equal(attack.zombies.length, 1);
  advanceAttack(attack, 29);
  assert.equal(attack.zombies.length, 1);
  advanceAttack(attack, 1);
  assert.deepEqual(attack.zombies, [
    { id: 1, bornAt: 0 },
    { id: 2, bornAt: 30 },
  ]);
  assert.equal(advanceAttack(attack, 29), false);
  assert.equal(advanceAttack(attack, 1), true);
});

test('the nearest zombie is removed and an empty battlefield is refilled immediately', async () => {
  const { createAttack, advanceAttack, shootNearest, ensureZombie } =
    await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 30);
  attack.zombies.reverse();
  assert.equal(shootNearest(attack).id, 1);
  ensureZombie(attack);
  assert.equal(attack.zombies.length, 1);
  shootNearest(attack);
  ensureZombie(attack);
  assert.deepEqual(attack.zombies, [{ id: 3, bornAt: 30 }]);
  assert.equal(attack.nextSpawn, 60);
});

test('three early unassisted hits increase difficulty without moving existing zombies', async () => {
  const { createAttack, advanceAttack, adjustDifficulty } =
    await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 36);
  const progress = (attack.time - attack.zombies[0].bornAt) / attack.approachSeconds;
  adjustDifficulty(attack, 10);
  adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 30);
  adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 29);
  assert.equal(attack.approachSeconds, 59);
  assert.ok(
    Math.abs((attack.time - attack.zombies[0].bornAt) / attack.approachSeconds - progress) < 1e-10,
  );
  assert.ok(Math.abs(attack.nextSpawn - (36 + (24 * 29) / 30)) < 1e-10);
  adjustDifficulty(attack, 10, 2);
  assert.equal(attack.spawnInterval, 30);
  assert.equal(attack.approachSeconds, 60);
});

test('difficulty stays bounded and starts gently each round', async () => {
  const { createAttack, adjustDifficulty } = await import('../src/game/castleGame.js');
  const attack = createAttack();
  for (let hit = 0; hit < 150; hit++) adjustDifficulty(attack, 10, 1);
  assert.equal(attack.spawnInterval, 30);
  for (let hit = 0; hit < 150; hit++) adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 5);
  assert.equal(attack.approachSeconds, 20);
  for (let hit = 0; hit < 60; hit++) adjustDifficulty(attack, 80);
  assert.equal(attack.spawnInterval, 30);
  assert.equal(attack.approachSeconds, 60);
  assert.equal(createAttack().spawnInterval, 30);
});
