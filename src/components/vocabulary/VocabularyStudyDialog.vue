<script>
export default {
  props: { batch: { type: Object, required: true } },
  emits: ['close'],
  mounted() {
    this.$refs.dialog.showModal();
  },
  beforeUnmount() {
    this.$refs.dialog.close();
  },
  methods: {
    close() {
      this.$refs.dialog.close();
    },
    closeOnBackdrop(event) {
      if (event.target !== this.$refs.dialog) return;
      const bounds = this.$refs.dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        this.close();
    },
  },
};
</script>
<template>
  <dialog
    ref="dialog"
    class="study-dialog"
    aria-labelledby="study-title"
    @close="$emit('close')"
    @click="closeOnBackdrop"
  >
    <header class="study-heading">
      <div>
        <span class="eyebrow">VEKAS GLOSER</span>
        <h2 id="study-title">{{ batch.name }}</h2>
      </div>
      <button class="secondary" autofocus @click="close">Lukk ✕</button>
    </header>
    <p class="study-intro">Pugg i fred. Zombiane er opptekne med å leite etter reine sokkar.</p>
    <table class="study-table">
      <thead>
        <tr>
          <th scope="col">Norsk</th>
          <th scope="col">Engelsk</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="word in batch.words" :key="word.id">
          <td>{{ word.norwegian }}</td>
          <td lang="en">{{ word.english }}</td>
        </tr>
      </tbody>
    </table>
    <p class="study-note">Fleire svar skilde med semikolon er alle rette.</p>
  </dialog>
</template>
