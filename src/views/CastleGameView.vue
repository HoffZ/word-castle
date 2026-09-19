<script>
import { createGameAudio, loadSoundEnabled } from '../services/gameAudio.js';
import GameHud from '../components/game/GameHud.vue';
import CastleScene from '../components/game/CastleScene.vue';
import AnswerForm from '../components/game/AnswerForm.vue';
import RoundSummary from '../components/game/RoundSummary.vue';
import VictoryConfetti from '../components/game/VictoryConfetti.vue';
import {
  REQUIRED_WINS,
  APPROACH_SECONDS,
  isCorrectAnswer,
  nextWord,
  createAttack,
  advanceAttack,
  shootNearest,
} from '../game/castleGame.js';
import {
  BOSS_HEALTH,
  CELEBRATION_SECONDS,
  bossVocabulary,
  pickBossWord,
  damageBoss,
} from '../game/bossFight.js';

export default {
  components: { GameHud, CastleScene, AnswerForm, RoundSummary, VictoryConfetti },
  props: {
    batch: { type: Object, required: true },
    batches: { type: Array, required: true },
    score: { type: Number, required: true },
  },
  emits: ['exit', 'replay', 'defeated'],
  data() {
    return {
      soundEnabled: loadSoundEnabled(),
      progress: {},
      currentWord: null,
      mistakes: 0,
      hint: false,
      paused: false,
      outcome: null,
      phase: 'weekly',
      celebrationTime: 0,
      bossHealth: BOSS_HEALTH,
      bossBornAt: 0,
      bossMessage: '',
      bossMessageUntil: 0,
      attack: createAttack(),
      shot: null,
      impact: null,
      feedback: 'Lad kanona med engelske ord. Zombiane har gløymt bordskikken!',
      attempt: 0,
      frame: null,
      lastTime: null,
    };
  },
  computed: {
    completed() {
      return Object.values(this.progress).reduce((sum, count) => sum + count, 0);
    },
    total() {
      return this.batch.words.length * REQUIRED_WINS;
    },
    bossWords() {
      return bossVocabulary(this.batches, this.batch);
    },
    hasOlderWords() {
      return this.batches.some((batch) => batch.id !== this.batch.id && batch.words.length);
    },
    waiting() {
      return (
        this.phase === 'celebration' || (this.phase === 'weekly' && !this.attack.zombies.length)
      );
    },
    spawnCountdown() {
      return Math.ceil(this.attack.nextSpawn - this.attack.time);
    },
    bossPosition() {
      return ((this.attack.time - this.bossBornAt) / APPROACH_SECONDS) * 100;
    },
    visibleZombies() {
      if (this.phase === 'celebration') return [];
      if (this.phase === 'boss')
        return this.bossHealth > 0 ? [{ id: 'boss', boss: true, position: this.bossPosition }] : [];
      const approaching = this.attack.zombies.map((zombie) => ({
        ...zombie,
        position: ((this.attack.time - zombie.bornAt) / APPROACH_SECONDS) * 100,
      }));
      return this.shot ? [...approaching, ...this.shot.visibleTargets] : approaching;
    },
    shotProgress() {
      return this.shot ? Math.min(1, (this.attack.time - this.shot.startedAt) / 0.45) : 0;
    },
    phaseHint() {
      if (this.phase === 'boss')
        return this.hasOlderWords
          ? 'Bossen krev gloser frå tidlegare veker. Tre treff!'
          : 'Me brukar vekas gloser mot bossen òg. Tre treff!';
      if (this.phase === 'celebration') return 'Nyt applausen! Ein litt for stor gjest er på veg …';
      return this.waiting
        ? `Neste zombie om ${this.spawnCountdown} sekund. Gjer deg klar!`
        : 'Ny zombie kvart 10. sekund. 20 sekund til borga!';
    },
  },
  created() {
    this.gameAudio = createGameAudio(this.soundEnabled);
  },
  mounted() {
    this.gameAudio.unlock();
    this.chooseWord();
    this.frame = requestAnimationFrame(this.tick);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },
  beforeUnmount() {
    this.gameAudio.dispose();
    cancelAnimationFrame(this.frame);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },
  methods: {
    chooseWord() {
      this.currentWord =
        this.phase === 'boss'
          ? pickBossWord(this.bossWords, this.currentWord?.id)
          : nextWord(this.batch.words, this.progress, this.currentWord?.id);
      this.mistakes = 0;
      this.hint = false;
      this.attempt += 1;
    },
    startCelebration() {
      this.phase = 'celebration';
      this.celebrationTime = 0;
      this.attack.zombies = [];
      this.hint = false;
      this.impact = null;
      this.feedback = 'Alle vekas gloser tre gonger! Hjernen din fortener ståande applaus.';
      this.gameAudio.victory();
    },
    startBoss() {
      this.phase = 'boss';
      this.bossBornAt = this.attack.time;
      this.bossHealth = BOSS_HEALTH;
      this.bossMessage = 'Eg åt visst litt for mykje graut.';
      this.bossMessageUntil = this.attack.time + 3;
      this.feedback = 'Sjefszombien er her! Tre gloser sender han heim i pysjen.';
      this.chooseWord();
    },
    lose() {
      this.gameAudio.stop();
      this.outcome = 'lost';
      this.gameAudio.gameOver();
    },
    finishShot() {
      this.impact = { position: this.shot.targetPosition, startedAt: this.attack.time };
      this.shot = null;
      if (this.phase === 'boss') {
        this.bossHealth = damageBoss(this.bossHealth);
        if (this.bossHealth === 0) {
          this.$emit('defeated', 1);
          this.gameAudio.bossDeath();
          this.outcome = 'won';
        } else {
          this.bossMessage = 'Uff og huff!';
          this.bossMessageUntil = this.attack.time + 2;
          this.gameAudio.hit('Uff og huff!');
          this.chooseWord();
        }
      } else {
        this.$emit('defeated', 1);
        this.gameAudio.hit();
        if (this.completed === this.total) this.startCelebration();
      }
    },
    tick(time) {
      const elapsed = this.lastTime === null ? 0 : Math.max(0, (time - this.lastTime) / 1000);
      this.lastTime = time;
      if (!this.paused && !this.outcome) {
        if (this.phase === 'celebration') {
          this.celebrationTime += elapsed;
          if (this.celebrationTime >= CELEBRATION_SECONDS) this.startBoss();
        } else {
          if (this.phase === 'boss') {
            this.attack.time += elapsed;
            // Hold the boss at the cannonball's target until impact, just like normal targets.
            if (this.shot) this.bossBornAt += elapsed;
            if (this.bossPosition >= 100) this.lose();
          } else if (this.completed === this.total && this.shot) {
            // Let the last weekly shot land before clearing the battlefield.
            this.attack.time += elapsed;
          } else if (advanceAttack(this.attack, elapsed)) this.lose();
          if (this.impact && this.attack.time - this.impact.startedAt >= 0.3) this.impact = null;
          if (this.bossMessage && this.attack.time >= this.bossMessageUntil) this.bossMessage = '';
          if (!this.outcome && this.shot && this.shotProgress >= 1) this.finishShot();
        }
      }
      if (!this.outcome) this.frame = requestAnimationFrame(this.tick);
    },
    submitAnswer(answer) {
      if (this.paused || this.shot || this.outcome || this.waiting) return;
      if (isCorrectAnswer(answer, this.currentWord.english)) {
        this.gameAudio.cannon();
        const target =
          this.phase === 'boss'
            ? { id: 'boss', bornAt: this.bossBornAt }
            : shootNearest(this.attack);
        const position = ((this.attack.time - target.bornAt) / APPROACH_SECONDS) * 100;
        this.shot = {
          id: `${target.id}-${this.attempt}`,
          word: answer.trim(),
          startedAt: this.attack.time,
          targetPosition: position,
          visibleTargets: [{ ...target, position }],
        };
        this.feedback = 'PANG! Eit engelsk ord rett i fleisen.';
        if (this.phase === 'weekly') {
          this.progress[this.currentWord.id] = (this.progress[this.currentWord.id] || 0) + 1;
          if (this.completed !== this.total) this.chooseWord();
        }
      } else {
        this.mistakes += 1;
        this.hint = this.mistakes >= 2;
        this.feedback = this.hint
          ? 'Skriv av fasiten. Kanona er like nøgd!'
          : 'Ikkje heilt. Prøv igjen! Kanona har trua på deg.';
        this.attempt += 1;
      }
    },
    onVisibilityChange() {
      if (document.hidden) {
        this.paused = true;
        this.gameAudio.stop();
      }
      this.lastTime = null;
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.gameAudio.setEnabled(this.soundEnabled);
    },
    togglePause() {
      this.paused = !this.paused;
      if (this.paused) this.gameAudio.stop();
      this.lastTime = null;
    },
  },
};
</script>
<template>
  <RoundSummary
    v-if="outcome"
    :won="outcome === 'won'"
    :score="score"
    :count="batch.words.length"
    @replay="$emit('replay')"
    @exit="$emit('exit')"
  />
  <section v-else class="game-page">
    <div class="game-title">
      <h1>
        {{ phase === 'boss' ? 'Sjefszombien!' : 'Forsvar borga' }}
        <span class="title-spark">🧟</span>
      </h1>
      <span class="pill">{{ batch.name }} · 3 RETTE PER GLOSE</span>
    </div>
    <div v-if="phase === 'celebration'" class="weekly-celebration" role="status">
      <VictoryConfetti /><strong>🎉 Vekas gloser er i boks!</strong
      ><span>Tre rette på kvar glose. Heilt kanon! No kjem sjefszombien …</span>
    </div>
    <div v-if="phase === 'boss'" class="boss-status" role="status">
      <strong>SJEF SZOMBERT</strong
      ><span :aria-label="`${bossHealth} av 3 liv att`"
        >{{ '♥'.repeat(bossHealth) }}{{ '♡'.repeat(3 - bossHealth) }}</span
      ><small>{{ phaseHint }}</small>
    </div>
    <div class="game-board panel">
      <GameHud
        :score="score"
        :completed="completed"
        :total="total"
        :paused="paused"
        :sound-enabled="soundEnabled"
        @sound="toggleSound"
        @pause="togglePause"
        @exit="$emit('exit')"
      />
      <CastleScene
        :word="currentWord?.norwegian"
        :zombies="visibleZombies"
        :shot="shot"
        :shot-progress="shotProgress"
        :impact="impact"
        :paused="paused"
        :boss-message="bossMessage"
      />
      <div class="game-controls">
        <div class="loading-instructions">
          <div v-if="hint" class="answer-hint" role="alert">
            <span>FASIT — SKRIV DETTE:</span
            ><strong lang="en">{{ currentWord.english.split(';')[0].trim() }}</strong>
          </div>
          <p v-else class="feedback" role="status">{{ feedback }}</p>
          <small>{{ phaseHint }}</small>
        </div>
        <AnswerForm
          :disabled="paused || Boolean(shot) || waiting"
          :word-id="currentWord?.id"
          :attempt="attempt"
          @answer="submitAnswer"
        />
      </div>
    </div>
    <div class="practice-list" aria-label="Gloseframgang">
      <div
        v-for="word in batch.words"
        :key="word.id"
        class="practice-word"
        :class="{ current: currentWord?.id === word.id }"
      >
        <span>{{ word.norwegian }}</span
        ><span :aria-label="`${progress[word.id] || 0} av 3 rette`"
          ><i
            v-for="number in 3"
            :key="number"
            :class="{ earned: (progress[word.id] || 0) >= number }"
          ></i
        ></span>
      </div>
    </div>
  </section>
</template>
