<script>
import { createId } from '../../services/vocabularyStorage.js';
const blankRow = () => ({ id: createId(), norwegian: '', english: '' });

export default {
  props: { batch: { type: Object, default: null }, disabled: Boolean, canCancel: Boolean },
  emits: ['save', 'cancel'],
  data() {
    return { name: '', rows: [], error: '' };
  },
  watch: {
    batch: {
      immediate: true,
      handler() {
        this.resetForm();
      },
    },
  },
  methods: {
    resetForm() {
      this.name = this.batch?.name || '';
      this.rows = this.batch ? this.batch.words.map((word) => ({ ...word })) : [];
      while (this.rows.length < 10) this.rows.push(blankRow());
      this.error = '';
    },
    addRow() {
      this.rows.push(blankRow());
    },
    submit() {
      const used = this.rows.filter((row) => row.norwegian.trim() || row.english.trim());
      if (!used.length) {
        this.error = 'Legg til minst éi glose med omsetjing for å starte eventyret.';
        return;
      }
      if (
        used.some(
          (row) => !row.norwegian.trim() || !row.english.split(';').some((word) => word.trim()),
        )
      ) {
        this.error = 'Kvar utfylt rad må ha både eit norsk ord og ei engelsk omsetjing.';
        return;
      }
      this.error = '';
      this.$emit('save', {
        id: this.batch?.id || createId(),
        name: this.name.trim() || `Glosesamling ${new Date().toLocaleDateString('nn-NO')}`,
        createdAt: this.batch?.createdAt || new Date().toISOString(),
        words: used.map((row) => ({
          ...row,
          norwegian: row.norwegian.trim(),
          english: row.english
            .split(';')
            .map((word) => word.trim())
            .filter(Boolean)
            .join('; '),
        })),
      });
    },
  },
};
</script>

<template>
  <form class="vocabulary-form panel" @submit.prevent="submit">
    <div class="form-title">
      <h2>{{ batch ? 'Puss på glosemagien' : 'Pakk med vekas glosemagi' }}</h2>
      <span class="pill">NORSK → ENGELSK</span>
    </div>
    <label class="field-label" for="batch-name">Namn på samlinga</label>
    <input
      id="batch-name"
      v-model="name"
      placeholder="Til dømes: Veke 38 · Dyr og andre raringar"
      maxlength="100"
    />
    <p class="form-help">
      Éi glose eller ti? Begge delar er flott. La radene du ikkje treng, stå tomme. Bruk semikolon
      mellom alternative svar, til dømes «big; large».
    </p>
    <div class="word-table-heading">
      <span>#</span><span>Norsk ord</span><span>Engelsk omsetjing</span>
    </div>
    <div v-for="(row, index) in rows" :key="row.id" class="word-row">
      <span>{{ String(index + 1).padStart(2, '0') }}</span
      ><input
        v-model="row.norwegian"
        :aria-label="`Norsk ord ${index + 1}`"
        :placeholder="index === 0 ? 'Til dømes: katt' : 'Norsk ord'"
        autocomplete="off"
      /><input
        v-model="row.english"
        :aria-label="`Engelsk omsetjing ${index + 1}`"
        :placeholder="index === 0 ? 'Til dømes: cat' : 'Engelsk omsetjing'"
        autocomplete="off"
      />
    </div>
    <button type="button" class="text-button" @click="addRow">+ Legg til ei glose til</button>
    <p v-if="error" class="error-banner" role="alert">{{ error }}</p>
    <div class="form-actions">
      <button v-if="canCancel" type="button" class="secondary" @click="$emit('cancel')">
        Avbryt</button
      ><button class="primary" :disabled="disabled">
        {{ batch ? 'Lagre endringar' : 'Lagre vekas gloser' }} <span>↗</span>
      </button>
    </div>
  </form>
</template>
