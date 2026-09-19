import test from 'node:test';
import assert from 'node:assert/strict';
import { bossVocabulary, pickBossWord, damageBoss, BOSS_HEALTH } from '../src/game/bossFight.js';

const current = { id: 'current', words: [{ id: 'cat', norwegian: 'katt', english: 'cat' }] };
const older = { id: 'older', words: [{ id: 'dog', norwegian: 'hund', english: 'dog' }] };
test('boss uses earlier collections exclusively when available', () => {
  assert.deepEqual(bossVocabulary([older, current], current), older.words);
});
test('boss falls back to current homework without older words', () => {
  assert.deepEqual(bossVocabulary([current], current), current.words);
  assert.deepEqual(bossVocabulary([{ id: 'empty', words: [] }, current], current), current.words);
});
test('boss word selection avoids consecutive repeats when possible and supports one word', () => {
  assert.equal(pickBossWord([...older.words, ...current.words], 'dog', () => 0).id, 'cat');
  assert.equal(pickBossWord(current.words, 'cat').id, 'cat');
});
test('boss survives two hits and dies on exactly the third', () => {
  let health = BOSS_HEALTH;
  health = damageBoss(health);
  assert.equal(health, 2);
  health = damageBoss(health);
  assert.equal(health, 1);
  health = damageBoss(health);
  assert.equal(health, 0);
  assert.equal(damageBoss(health), 0);
});
