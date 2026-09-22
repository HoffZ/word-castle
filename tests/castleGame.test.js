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
test('a round practises every word exactly three times before finishing', () => {
  const progress = {};
  let previous;
  for (let turn = 0; turn < words.length * REQUIRED_WINS; turn++) {
    const word = nextWord(words, progress, previous, () => 0);
    assert.ok(word);
    if (previous) assert.notEqual(word.id, previous);
    progress[word.id] = (progress[word.id] || 0) + 1;
    previous = word.id;
  }
  assert.deepEqual(progress, { a: 3, b: 3, c: 3 });
  assert.equal(nextWord(words, progress, previous), null);
});
test('one-word homework works and completed words cannot return', () => {
  assert.equal(nextWord([words[0]], { a: 2 }, 'a').id, 'a');
  assert.equal(nextWord([words[0]], { a: 3 }, 'a'), null);
  assert.equal(nextWord(words, { a: 3, b: 3, c: 2 }, 'c').id, 'c');
});

test('zombies spawn every fifteen seconds and reach the castle at thirty seconds', async () => {
  const { createAttack, advanceAttack } = await import('../src/game/castleGame.js');
  const attack = createAttack();
  assert.equal(attack.zombies.length, 1);
  assert.equal(advanceAttack(attack, 15), false);
  assert.equal(attack.zombies.length, 2);
  assert.equal(advanceAttack(attack, 14.99), false);
  assert.equal(advanceAttack(attack, 0.01), true);
});

test('the cannon removes the nearest zombie while later zombies keep approaching', async () => {
  const { createAttack, advanceAttack, shootNearest } = await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 15);
  attack.zombies.reverse();
  assert.equal(shootNearest(attack).id, 1);
  assert.equal(advanceAttack(attack, 15), false);
  assert.equal(attack.zombies.length, 2);
  assert.equal(advanceAttack(attack, 15), true);
});

test('the last defeated zombie is replaced immediately without changing the spawn schedule', async () => {
  const { createAttack, advanceAttack, shootNearest, ensureZombie } =
    await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 3);
  shootNearest(attack);
  ensureZombie(attack);
  assert.deepEqual(attack.zombies, [{ id: 2, bornAt: 3 }]);
  assert.equal(attack.nextSpawn, 15);
  ensureZombie(attack);
  assert.equal(attack.zombies.length, 1);
  advanceAttack(attack, 12);
  assert.deepEqual(attack.zombies, [
    { id: 2, bornAt: 3 },
    { id: 3, bornAt: 15 },
  ]);
  shootNearest(attack);
  ensureZombie(attack);
  assert.deepEqual(attack.zombies, [{ id: 3, bornAt: 15 }]);
});

test('three early hits gently accelerate the next spawn without spawning instantly', async () => {
  const { createAttack, advanceAttack, adjustDifficulty } =
    await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 2);
  adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 15);
  adjustDifficulty(attack, 20);
  assert.equal(attack.spawnInterval, 15);
  adjustDifficulty(attack, 20);
  assert.equal(attack.spawnInterval, 14);
  assert.ok(Math.abs(attack.nextSpawn - (2 + (13 * 14) / 15)) < 0.00001);
  assert.equal(attack.zombies.length, 1);
});

test('difficulty respects limits, breaks early streaks and resets for a new round', async () => {
  const { createAttack, adjustDifficulty } = await import('../src/game/castleGame.js');
  const attack = createAttack();
  adjustDifficulty(attack, 10);
  adjustDifficulty(attack, 50);
  adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 15);
  for (let hit = 0; hit < 30; hit++) adjustDifficulty(attack, 10);
  assert.equal(attack.spawnInterval, 5);
  adjustDifficulty(attack, 80);
  assert.equal(attack.spawnInterval, 6);
  assert.equal(attack.earlyHits, 0);
  for (let hit = 0; hit < 20; hit++) adjustDifficulty(attack, 90);
  assert.equal(attack.spawnInterval, 15);
  assert.equal(createAttack().spawnInterval, 15);
});

test('speed changes preserve zombie positions and assisted answers ease the challenge', async () => {
  const { createAttack, advanceAttack, adjustDifficulty } =
    await import('../src/game/castleGame.js');
  const attack = createAttack();
  advanceAttack(attack, 6);
  const before = (attack.time - attack.zombies[0].bornAt) / attack.approachSeconds;
  for (let hit = 0; hit < 3; hit++) adjustDifficulty(attack, 10);
  assert.equal(attack.approachSeconds, 29);
  assert.equal(attack.spawnInterval, 14);
  assert.ok(
    Math.abs((attack.time - attack.zombies[0].bornAt) / attack.approachSeconds - before) < 1e-10,
  );
  adjustDifficulty(attack, 10, 2);
  assert.equal(attack.approachSeconds, 30);
  assert.equal(attack.spawnInterval, 15);
  for (let hit = 0; hit < 40; hit++) adjustDifficulty(attack, 10, 1);
  assert.equal(attack.approachSeconds, 30);
  assert.equal(attack.spawnInterval, 15);
  for (let hit = 0; hit < 90; hit++) adjustDifficulty(attack, 10);
  assert.equal(attack.approachSeconds, 20);
  assert.equal(attack.spawnInterval, 5);
  assert.equal(createAttack().approachSeconds, 30);
});
