<script>
import DragTile from './DragTile.vue';
import { shuffle, letterSlots } from '../../game/practice.js';
export default {
  components: { DragTile },
  props: { words: { type: Array, required: true } },
  emits: ['complete', 'solved'],
  data() {
    return { index: 0, tiles: [], placed: {}, selected: null, feedback: '', hint: false };
  },
  computed: {
    word() {
      return this.words[this.index];
    },
    slots() {
      return letterSlots(this.word);
    },
    solved() {
      return this.slots.every((slot) => slot.fixed || this.placed[slot.id] !== undefined);
    },
    available() {
      return this.tiles.filter((tile) => !Object.values(this.placed).includes(tile.id));
    },
  },
  created() {
    this.prepare();
  },
  methods: {
    prepare() {
      this.placed = {};
      this.selected = null;
      this.hint = false;
      this.tiles = shuffle(this.slots.filter((slot) => !slot.fixed));
      this.feedback = 'Bygg eit magisk ord i borgmuren. Ta den tida du treng!';
    },
    place(tileId, slotId) {
      if (tileId === null || this.solved) return;
      const tile = this.available.find((item) => item.id === tileId);
      const slot = this.slots.find((item) => item.id === Number(slotId));
      if (!tile || !slot || slot.fixed || this.placed[slot.id] !== undefined) return;
      if (tile.letter !== slot.letter) {
        this.feedback = `Godt forsøk! På plass ${slot.id + 1} skal det stå «${slot.letter}».`;
        return;
      }
      this.placed[slot.id] = tile.id;
      this.selected = null;
      if (this.solved) this.$emit('solved');
      this.feedback = this.solved
        ? 'Ordet er bygt! Ein solid murstein for hjernen.'
        : 'Rett plass! Borgmuren vert sterkare.';
    },
    next() {
      if (!this.solved) return;
      if (this.index === this.words.length - 1) this.$emit('complete');
      else {
        this.index += 1;
        this.prepare();
      }
    },
  },
};
</script>
<template>
  <div class="letter-game">
    <p class="practice-count">Glose {{ index + 1 }} av {{ words.length }}</p>
    <h2 class="word-prompt">🏰 {{ word.norwegian }}</h2>
    <p class="practice-instruction">
      Dra bokstavsteinane til rett plass i muren. Eller trykk på ein bokstav og så på eit felt.
    </p>
    <div class="letter-wall" aria-label="Plassar for bokstavane">
      <template v-for="slot in slots" :key="`${index}-${slot.id}`">
        <span v-if="slot.fixed" class="fixed-letter">{{ slot.letter }}</span>
        <button
          v-else
          class="letter-slot"
          :class="{ filled: placed[slot.id] !== undefined }"
          :data-drop-target="String(slot.id)"
          :disabled="placed[slot.id] !== undefined"
          :aria-label="`Plass ${slot.id + 1}${placed[slot.id] !== undefined ? ': ' + slot.letter : ''}`"
          @click="place(selected, slot.id)"
        >
          <span v-if="placed[slot.id] !== undefined" lang="en">{{ slot.letter }}</span>
          <span v-else-if="hint" class="letter-hint" lang="en">{{ slot.letter }}</span>
          <span v-else aria-hidden="true">·</span>
        </button>
      </template>
    </div>
    <div class="letter-supply" aria-label="Bokstavsteinar">
      <DragTile
        v-for="tile in available"
        :key="`${index}-${tile.id}`"
        :label="tile.letter"
        :selected="selected === tile.id"
        @select="selected = tile.id"
        @drop="place(tile.id, $event)"
      />
    </div>
    <p class="practice-feedback" role="status">{{ feedback }}</p>
    <button v-if="!solved" class="secondary" @click="hint = !hint">
      {{ hint ? 'Gøym hjelpa' : 'Vis meg eit hint' }}
    </button>
    <button v-else class="primary" @click="next">
      {{ index === words.length - 1 ? 'Muren er ferdig! ↗' : 'Neste glose ↗' }}
    </button>
  </div>
</template>
