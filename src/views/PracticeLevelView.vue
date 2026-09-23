<script>
import WordMatching from '../components/practice/WordMatching.vue';
import LetterBuilding from '../components/practice/LetterBuilding.vue';
import VictoryConfetti from '../components/game/VictoryConfetti.vue';
import { createGameAudio, loadSoundEnabled } from '../services/gameAudio.js';
export default {
  components: { WordMatching, LetterBuilding, VictoryConfetti },
  props: { level: Number, batch: Object, score: Number },
  emits: ['next', 'exit', 'solved'],
  data() {
    return { complete: false, soundEnabled: loadSoundEnabled() };
  },
  created() {
    this.audio = createGameAudio(this.soundEnabled);
  },
  beforeUnmount() {
    this.audio.dispose();
  },
  methods: {
    finish() {
      this.complete = true;
      this.audio.victory();
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.audio.setEnabled(this.soundEnabled);
    },
  },
};
</script>
<template>
  <section class="practice-page panel" @pointerdown="audio.unlock()" @keydown="audio.unlock()">
    <header class="practice-header">
      <span class="pill">NIVÅ {{ level }} AV 3 · {{ batch.name }}</span>
      <div>
        <strong>✦ {{ score.toLocaleString('nn-NO') }} poeng</strong>
        <button class="secondary" :aria-pressed="soundEnabled" @click="toggleSound">
          {{ soundEnabled ? '🔊 Lyd på' : '🔇 Lyd av' }}
        </button>
        <button class="secondary" @click="$emit('exit')">Avbryt</button>
      </div>
    </header>
    <div v-if="complete" class="practice-celebration">
      <VictoryConfetti />
      <span class="summary-art">🏰 🎉</span>
      <h1>Du klarte det!</h1>
      <p>
        {{
          level === 1
            ? 'Alle ordkassene fann rett port. Borgvakta dansar i rustninga!'
            : 'Alle orda er bygde. Borgmuren er sterkare enn ein tre dagar gammal vaffel!'
        }}
      </p>
      <button class="primary" @click="$emit('next')">
        {{ level === 1 ? 'Til nivå 2: Bygg orda ↗' : 'Til nivå 3: Forsvar borga ↗' }}
      </button>
    </div>
    <template v-else>
      <h1>{{ level === 1 ? 'Finn rett borgport' : 'Bygg ordmuren' }}</h1>
      <p class="practice-subtitle">Ingen klokke. Berre deg, orda og ei litt tullete borg.</p>
      <WordMatching
        v-if="level === 1"
        :words="batch.words"
        @complete="finish"
        @solved="$emit('solved')"
      />
      <LetterBuilding v-else :words="batch.words" @complete="finish" @solved="$emit('solved')" />
    </template>
  </section>
</template>
