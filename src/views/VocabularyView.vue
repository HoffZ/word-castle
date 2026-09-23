<script>
import VocabularyForm from '../components/vocabulary/VocabularyForm.vue';
export default {
  components: { VocabularyForm },
  props: { batches: { type: Array, required: true }, disabled: Boolean },
  emits: ['save', 'cancel'],
  data() {
    return { editing: null, formKey: 0 };
  },
  methods: {
    edit(batch) {
      this.editing = batch;
      this.formKey += 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    newBatch() {
      this.editing = null;
      this.formKey += 1;
    },
  },
};
</script>
<template>
  <section class="vocabulary-page">
    <div class="page-heading">
      <span class="eyebrow">GLOSEVERKSTADEN</span>
      <h1>Små gloser.<br /><em>Stor borgmagi.</em></h1>
      <p>
        {{
          batches.length
            ? 'Den nyaste samlinga blir brukt i spelet. Dei gamle glosene ligg trygt her.'
            : 'Alle trollmenn byrjar ein stad. Legg inn vekas gloser for å opne det første eventyret ditt.'
        }}
      </p>
    </div>
    <div class="workshop-layout">
      <VocabularyForm
        :key="formKey"
        :batch="editing"
        :disabled="disabled"
        :can-cancel="batches.length > 0"
        @save="$emit('save', $event)"
        @cancel="$emit('cancel')"
      />
      <aside>
        <div class="tip-card">
          <span class="tip-emoji">🧙</span>
          <h3>Ei helsing frå trollmannen</h3>
          <p>
            «Eg blanda ein gong sheep og ship. Kapteinen vart ikkje blid då eg kom om bord med ein
            sau.»
          </p>
          <p class="muted">
            Feil er ein del av magien. Kvar glose får ein augneblink i rampelyset.
          </p>
        </div>
        <div class="collection-heading">
          <h3>Samlingane dine</h3>
          <button v-if="editing" class="text-button" @click="newBatch">+ Ny samling</button>
        </div>
        <p v-if="!batches.length" class="empty-note">
          Glosehylla di ventar.<br />Det gjer eit mistenkjeleg svolte troll òg.
        </p>
        <button
          v-for="(batch, index) in [...batches].reverse()"
          :key="batch.id"
          class="collection-item"
          @click="edit(batch)"
        >
          <span
            ><strong>{{ batch.name }}</strong
            ><small
              >{{ batch.words.length }} {{ batch.words.length === 1 ? 'glose' : 'gloser' }} · Trykk
              for å endre</small
            ></span
          ><span v-if="index === 0" class="pill">DENNE VEKA</span><span v-else>✎</span>
        </button>
      </aside>
    </div>
  </section>
</template>
