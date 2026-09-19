<script>
import VictoryConfetti from './VictoryConfetti.vue';
export default {
  components: { VictoryConfetti },
  props: { score: Number, count: Number, won: Boolean },
  emits: ['replay', 'exit'],
};
</script>
<template>
  <section class="round-summary panel">
    <VictoryConfetti v-if="won" />
    <span class="summary-art">{{ won ? '🏰 🎉' : '🧟 🏰' }}</span>
    <span class="eyebrow">{{
      won ? 'Borga er redda! Hjernane òg!' : 'Zombiane kom heilt fram!'
    }}</span>
    <h1>{{ won ? 'Heilt kanon!' : 'GAME OVER' }}</h1>
    <p v-if="won">
      Du svarte rett på {{ count === 1 ? 'glosa di' : `alle dei ${count} glosene` }} tre gonger.<br />Og
      sjefszombien? Han flaug heim utan bukser. For ein siger!
    </p>
    <p v-else>
      Zombiane tok borga og åt opp alle vaflane.<br />Prøv igjen — denne gongen skal dei få gloser
      til frukost!
    </p>
    <div class="summary-score">✦ {{ score.toLocaleString('nn-NO') }} <span>poeng totalt</span></div>
    <button class="primary" @click="$emit('replay')">
      {{ won ? 'Eitt åtak til ↗' : 'Prøv igjen ↗' }}
    </button>
    <button class="text-button" @click="$emit('exit')">Tilbake til borga</button>
  </section>
</template>
