<script>
export default {
  props: {
    score: Number,
    completed: Number,
    total: Number,
    paused: Boolean,
    soundEnabled: Boolean,
  },
  emits: ['pause', 'sound', 'exit'],
};
</script>
<template>
  <div class="game-hud">
    <div>
      <span class="eyebrow">POENG TOTALT</span
      ><strong>✦ {{ score.toLocaleString('nn-NO') }}</strong>
    </div>
    <div class="progress-stat">
      <span class="eyebrow">GLOSER SOM SIT</span
      ><strong
        >{{ completed }} <small>/ {{ total }} rette svar</small></strong
      ><progress :value="completed" :max="total" aria-label="Framgang i runden"></progress>
    </div>
    <button
      class="secondary sound-toggle"
      :aria-pressed="soundEnabled"
      :aria-label="soundEnabled ? 'Slå av lyden' : 'Slå på lyden'"
      @click="$emit('sound')"
    >
      {{ soundEnabled ? '🔊 Lyd på' : '🔇 Lyd av' }}
    </button>
    <div class="round-actions">
      <button class="secondary" @click="$emit('pause')">
        {{ paused ? '▶ Hald fram' : 'Ⅱ Pause' }}
      </button>
      <button class="secondary" @click="$emit('exit')">Avbryt</button>
    </div>
  </div>
</template>
