<script>
export default {
  props: { label: String, selected: Boolean },
  emits: ['select', 'drop'],
  data() {
    return { pointer: null, origin: null, position: null, dragged: false, suppressClick: false };
  },
  methods: {
    start(event) {
      if (!event.isPrimary || event.button !== 0) return;
      this.pointer = event.pointerId;
      this.origin = { x: event.clientX, y: event.clientY };
      this.dragged = false;
      this.suppressClick = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    move(event) {
      if (event.pointerId !== this.pointer) return;
      if (Math.hypot(event.clientX - this.origin.x, event.clientY - this.origin.y) > 5)
        this.dragged = true;
      if (this.dragged) this.position = { x: event.clientX, y: event.clientY };
    },
    finish(event) {
      if (event.pointerId !== this.pointer) return;
      if (this.dragged) {
        const target = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest('[data-drop-target]');
        this.suppressClick = true;
        if (target && !target.disabled) this.$emit('drop', target.dataset.dropTarget);
      }
      this.cancel();
    },
    cancel() {
      this.pointer = null;
      this.position = null;
    },
    select() {
      if (!this.suppressClick) this.$emit('select');
      this.suppressClick = false;
    },
  },
};
</script>
<template>
  <button
    class="word-tile"
    :class="{ selected }"
    :aria-pressed="selected"
    lang="en"
    @pointerdown="start"
    @pointermove="move"
    @pointerup="finish"
    @pointercancel="cancel"
    @lostpointercapture="cancel"
    @click="select"
  >
    {{ label }}
  </button>
  <Teleport to="body">
    <span
      v-if="position"
      class="tile-ghost"
      aria-hidden="true"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      >{{ label }}</span
    >
  </Teleport>
</template>
