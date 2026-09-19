<script>
export default {
  data() {
    return {
      pieces: Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: index % 2 ? '8%' : '92%',
        x: `${(index % 2 ? 1 : -1) * (10 + Math.random() * 75)}vw`,
        y: `${-45 - Math.random() * 65}vh`,
        delay: `${Math.random() * 0.8}s`,
        color: ['#e88b52', '#70906a', '#ecc94b', '#9b82cf', '#5db9cd'][index % 5],
        rotation: `${Math.random() * 1000 - 500}deg`,
      })),
    };
  },
};
</script>
<template>
  <div class="confetti" aria-hidden="true">
    <i
      v-for="piece in pieces"
      :key="piece.id"
      :style="{
        left: piece.left,
        background: piece.color,
        '--x': piece.x,
        '--y': piece.y,
        '--spin': piece.rotation,
        animationDelay: piece.delay,
      }"
    ></i>
  </div>
</template>
