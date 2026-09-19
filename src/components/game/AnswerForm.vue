<script>
export default {
  props: { disabled: Boolean, wordId: String, attempt: Number },
  emits: ['answer'],
  data() {
    return { answer: '' };
  },
  watch: {
    wordId() {
      this.answer = '';
      this.focus();
    },
    attempt() {
      this.answer = '';
      this.focus();
    },
    disabled(value) {
      if (!value) this.focus();
    },
  },
  mounted() {
    this.focus();
  },
  methods: {
    focus() {
      this.$nextTick(() => this.$refs.answer?.focus({ preventScroll: true }));
    },
    submit() {
      if (this.answer.trim() && !this.disabled) this.$emit('answer', this.answer);
    },
  },
};
</script>
<template>
  <form class="answer-form" @submit.prevent="submit">
    <label for="magic-answer">Kva heiter ordet på engelsk?</label>
    <div>
      <input
        id="magic-answer"
        ref="answer"
        v-model="answer"
        :aria-disabled="disabled"
        placeholder="Skriv ordet på engelsk …"
        enterkeyhint="send"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
      /><button class="primary" :disabled="disabled || !answer.trim()">Skyt! <span>✦</span></button>
    </div>
    <small>Enter = PANG! Kanona et gloser til frukost.</small>
  </form>
</template>
