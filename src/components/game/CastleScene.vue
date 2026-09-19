<script>
export default {
  props: {
    word: String,
    zombies: Array,
    shot: Object,
    shotProgress: Number,
    impact: Object,
    paused: Boolean,
    bossMessage: String,
  },
};
</script>
<template>
  <div
    class="castle-scene zombie-scene"
    :class="{ 'scene-paused': paused }"
    role="img"
    :aria-label="`${zombies.length} zombiar nærmar seg borga. Kanona skal ladast med omsetjinga av ${word}.`"
  >
    <span class="scene-sun">✺</span><span class="scene-cloud one">☁</span
    ><span class="scene-cloud two">☁</span>
    <div class="hill hill-back"></div>
    <div class="hill hill-front"></div>
    <span class="castle">🏰</span><span class="castle-flag">INGEN HJERNAR<br />PÅ MENYEN.</span>
    <div class="ground-path"></div>
    <div class="cannon" :class="{ firing: shot }">
      <div class="cannon-label">
        <small>LAD MED ENGELSK:</small><strong>{{ word }}</strong>
      </div>
      <div class="cannon-barrel"></div>
      <div class="cannon-wheel">✦</div>
      <span v-if="shot" class="muzzle-flash">💥</span>
    </div>
    <div
      v-for="zombie in zombies"
      :key="zombie.id"
      class="zombie"
      :class="{ 'boss-zombie': zombie.boss }"
      :style="{ left: `${90 - zombie.position * 0.64}%` }"
    >
      <small v-if="zombie.boss && bossMessage" class="boss-speech">{{ bossMessage }}</small>
      <span>{{ zombie.boss || zombie.id % 2 ? '🧟' : '🧟‍♀️' }}</span
      ><i></i>
    </div>
    <template v-if="shot"
      ><div
        :key="shot.id"
        class="word-projectile"
        :style="{ left: `${26 + (64 - shot.targetPosition * 0.64) * shotProgress}%` }"
      >
        {{ shot.word }}
      </div>
    </template>
    <span v-if="impact" class="zombie-hit" :style="{ left: `${90 - impact.position * 0.64}%` }"
      >💫</span
    >
    <span class="scene-mushroom">🍄</span>
    <div v-if="paused" class="pause-overlay">
      <strong>Ei lita bollepause.</strong
      ><span>Zombiane leitar etter hjernen dei gløymde heime.</span>
    </div>
  </div>
</template>
