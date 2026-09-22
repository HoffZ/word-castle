<script>
import { loadScore, saveScore, POINTS_PER_ZOMBIE } from './services/scoreStorage.js';
import VocabularyStudyDialog from './components/vocabulary/VocabularyStudyDialog.vue';
import VocabularyView from './views/VocabularyView.vue';
import CastleGameView from './views/CastleGameView.vue';
import { loadBatches, saveBatches } from './services/vocabularyStorage.js';

export default {
  components: { VocabularyView, CastleGameView, VocabularyStudyDialog },
  data() {
    return {
      showStudy: false,
      totalScore: 0,
      scoreError: '',
      batches: [],
      screen: 'vocabulary',
      storageError: '',
      loadFailed: false,
      gameKey: 0,
    };
  },
  computed: {
    latestBatch() {
      return this.batches[this.batches.length - 1] || null;
    },
  },
  created() {
    try {
      this.totalScore = loadScore();
    } catch {
      this.scoreError = 'Vi fekk ikkje lese poenga. Dei lagra poenga er ikkje endra.';
    }
    try {
      this.batches = loadBatches();
      if (this.batches.length) this.screen = 'home';
    } catch {
      this.loadFailed = true;
      this.storageError =
        'Vi fekk ikkje opna dei lagra glosene. Last sida på nytt eller sjekk lagringa i nettlesaren. Dei lagra glosene er ikkje endra.';
    }
  },
  methods: {
    awardPoints(count) {
      this.totalScore += count * POINTS_PER_ZOMBIE;
      try {
        this.totalScore = saveScore(this.totalScore);
        this.scoreError = '';
      } catch {
        this.scoreError =
          'Poenga er med vidare her, men kunne ikkje lagrast. Sjekk lagringa i nettlesaren før du lukkar sida.';
      }
    },
    saveBatch(batch) {
      if (this.loadFailed) return;
      const updated = this.batches.some((item) => item.id === batch.id)
        ? this.batches.map((item) => (item.id === batch.id ? batch : item))
        : [...this.batches, batch];
      try {
        saveBatches(updated);
        this.batches = updated;
        this.storageError = '';
        this.screen = 'home';
      } catch {
        this.storageError =
          'Vi fekk ikkje lagra glosene. Skjemaet ditt er framleis her. Sjekk at nettlesaren tillèt lagring, og prøv igjen.';
      }
    },
    play() {
      this.gameKey += 1;
      this.screen = 'game';
    },
  },
};
</script>

<template>
  <div :class="['app-shell', { 'is-playing': screen === 'game' }]">
    <header class="site-header">
      <button class="brand" @click="screen = latestBatch ? 'home' : 'vocabulary'">
        <span class="brand-icon">♜</span> glose<span>borgen</span><span class="brand-dot">✦</span>
      </button>
      <nav aria-label="Hovudmeny">
        <button
          :class="{ active: screen === 'home' || screen === 'game' }"
          @click="screen = latestBatch ? 'home' : 'vocabulary'"
        >
          Eventyret
        </button>
        <button :class="{ active: screen === 'vocabulary' }" @click="screen = 'vocabulary'">
          Glosene mine
          <span class="nav-count">{{
            batches.reduce((sum, batch) => sum + batch.words.length, 0)
          }}</span>
        </button>
      </nav>
      <span class="header-note">Små ord. Stor magi.</span>
    </header>
    <main>
      <p v-if="scoreError" class="error-banner" role="alert">{{ scoreError }}</p>
      <p v-if="storageError" class="error-banner" role="alert">{{ storageError }}</p>
      <VocabularyView
        v-if="screen === 'vocabulary'"
        :batches="batches"
        :disabled="loadFailed"
        @save="saveBatch"
        @cancel="screen = 'home'"
      />
      <CastleGameView
        v-else-if="screen === 'game'"
        :key="gameKey"
        :batch="latestBatch"
        :batches="batches"
        :score="totalScore"
        @defeated="awardPoints"
        @exit="screen = 'home'"
        @replay="play"
      />
      <section v-else class="home-page">
        <div class="hero-copy">
          <p class="total-score">✦ {{ totalScore.toLocaleString('nn-NO') }} poeng totalt</p>
          <span class="eyebrow">LITT ØVING. EIT STORT EVENTYR.</span>
          <h1>Ord er di<br /><em>superkraft.</em></h1>
          <p>
            Ei borg å forsvare. Ein gjeng svolte zombiar.<br />Og éin modig glosehelt. Det er deg!
          </p>
          <button class="primary" @click="play">Forsvar borga <span>↗</span></button>
          <p class="microcopy">Ingen poeng forsvinn. Berre litt meir magi kvar gong.</p>
        </div>
        <div class="adventure-card">
          <div class="card-label"><span class="pill">DITT FØRSTE EVENTYR</span><span>✦</span></div>
          <div class="home-art">
            <span class="art-cloud cloud-one">☁</span><span class="art-cloud cloud-two">☁</span
            ><span class="art-star">✧</span><span class="home-castle">🏰</span
            ><span class="home-monster">🧟</span
            ><span class="speech-bubble">Er det hjerne til middag?</span>
            <div class="art-ground"></div>
          </div>
          <div class="adventure-description">
            <span class="eyebrow">01 / DET VAKLANDE KONGERIKET</span>
            <h2>Forsvar borga</h2>
            <p>Zombiane kjem. Lad kanona før dei forsyner seg av hjernen din.</p>
            <div class="card-bottom">
              <span
                >✎ {{ latestBatch.words.length }}
                {{ latestBatch.words.length === 1 ? 'glose' : 'gloser' }} å øve på</span
              ><span>100 poeng / glose</span>
            </div>
          </div>
        </div>
        <div class="weekly-strip">
          <span class="strip-icon">✎</span>
          <button class="weekly-study-link" aria-haspopup="dialog" @click="showStudy = true">
            <span class="eyebrow">VEKAS GLOSER · TRYKK FOR Å PUGGE</span>
            <strong>{{ latestBatch.name }}</strong>
            <p>
              {{
                latestBatch.words
                  .slice(0, 5)
                  .map((word) => word.norwegian)
                  .join(' · ')
              }}{{ latestBatch.words.length > 5 ? ' · …' : '' }}
            </p>
          </button>
          <button class="secondary" @click="screen = 'vocabulary'">Ordne gloser ↗</button>
        </div>
        <div class="how-it-works">
          <div>
            <span>01</span>
            <h3>Les på kanona</h3>
            <p>Ho treng eit engelsk ord.<br />Krut er visst ute av mote.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Lad med gloser</h3>
            <p>Skriv ordet på engelsk.<br />Send ein zombie på flygetur.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Få orda til å sitje</h3>
            <p>Svar rett på kvar glose tre gonger.<br />Hjernen tek ein liten sigersdans.</p>
          </div>
        </div>
      </section>
    </main>
    <VocabularyStudyDialog
      v-if="showStudy && latestBatch"
      :batch="latestBatch"
      @close="showStudy = false"
    />
    <footer>
      <span>Laga for små hovud med stor fantasi.</span
      ><span>✦ Litt modigare. Nokre gloser rikare.</span>
    </footer>
  </div>
</template>
