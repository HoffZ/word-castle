<script>
import DragTile from './DragTile.vue';
import { shuffle, practiceAnswer } from '../../game/practice.js';
export default {
  components: { DragTile },
  props: { words: { type: Array, required: true } },
  emits: ['complete', 'solved'],
  data() {
    return {
      cards: shuffle(this.words),
      matched: [],
      selected: null,
      feedback: 'Finn rett port til kvar ordkasse. Borgvakta har rota med pakkane!',
    };
  },
  methods: {
    practiceAnswer,
    place(sourceId, targetId) {
      const source = this.words.find((word) => word.id === sourceId);
      const target = this.words.find((word) => word.id === targetId);
      if (!source || !target || this.matched.includes(targetId)) return;
      if (practiceAnswer(source).toLowerCase() !== practiceAnswer(target).toLowerCase()) {
        this.feedback = `Nesten! «${practiceAnswer(source)}» tyder «${source.norwegian}». Prøv den porten.`;
        return;
      }
      // Identical English labels are interchangeable, even across different translations.
      this.cards = this.cards.filter((word) => word.id !== sourceId);
      this.matched.push(targetId);
      this.$emit('solved');
      this.selected = null;
      this.feedback = `Rett! ${target.norwegian} = ${practiceAnswer(target)}. Borgvakta jublar!`;
      if (this.matched.length === this.words.length) this.$emit('complete');
    },
  },
};
</script>
<template>
  <div class="matching-game">
    <p class="practice-feedback" role="status">{{ feedback }}</p>
    <p class="practice-instruction">
      Dra ei engelsk ordkasse til rett norsk port. Du kan òg trykkja på kassa og så på porten.
    </p>
    <div class="matching-columns">
      <section class="word-supply" aria-label="Engelske ordkasser">
        <h2>📦 Ordkassene</h2>
        <DragTile
          v-for="word in cards"
          :key="word.id"
          :label="practiceAnswer(word)"
          :selected="selected === word.id"
          @select="selected = word.id"
          @drop="place(word.id, $event)"
        />
      </section>
      <section class="castle-gates" aria-label="Norske borgportar">
        <h2>🏰 Borgportane</h2>
        <button
          v-for="word in words"
          :key="word.id"
          class="castle-gate"
          :class="{ filled: matched.includes(word.id) }"
          :data-drop-target="word.id"
          :disabled="matched.includes(word.id)"
          @click="place(selected, word.id)"
        >
          <strong>{{ word.norwegian }}</strong>
          <span v-if="matched.includes(word.id)" lang="en">✓ {{ practiceAnswer(word) }}</span>
          <span v-else>Slepp ordet her</span>
        </button>
      </section>
    </div>
    <p class="practice-count">
      {{ matched.length }} av {{ words.length }} portar har fått rett pakke
    </p>
  </div>
</template>
