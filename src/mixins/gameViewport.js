// Mobile keyboards resize the visual viewport, not always the CSS layout viewport.
export default {
  data() {
    return { viewportHeight: window.innerHeight, viewportTop: 0 };
  },
  computed: {
    gameViewportStyle() {
      return {
        '--game-viewport-height': `${this.viewportHeight}px`,
        '--game-viewport-top': `${this.viewportTop}px`,
      };
    },
  },
  mounted() {
    this.updateGameViewport();
    window.addEventListener('resize', this.updateGameViewport);
    window.visualViewport?.addEventListener('resize', this.updateGameViewport);
    window.visualViewport?.addEventListener('scroll', this.updateGameViewport);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateGameViewport);
    window.visualViewport?.removeEventListener('resize', this.updateGameViewport);
    window.visualViewport?.removeEventListener('scroll', this.updateGameViewport);
  },
  methods: {
    updateGameViewport() {
      const viewport = window.visualViewport;
      // Preserve normal browser panning and zooming when the user zooms manually.
      if (viewport && Math.abs(viewport.scale - 1) > 0.05) return;
      this.viewportHeight = viewport?.height ?? window.innerHeight;
      this.viewportTop = viewport?.offsetTop ?? 0;
    },
  },
};
