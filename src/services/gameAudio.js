import bossHitUrl from '../sounds/boss/boss-hit.mp3?url';

const HIT_SOUND_URLS = Object.values(
  import.meta.glob('../sounds/ouch/*.{mp3,wav,ogg,m4a}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);

const SPAWN_SOUND_URLS = Object.values(
  import.meta.glob('../sounds/spawn/*.{mp3,wav,ogg,m4a}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
);

const SOUND_KEY = 'word-castle.sound';

export function loadSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

// Mix bundled recordings with locally generated effects without synthetic speech.
export function createGameAudio(enabled = true) {
  let context;
  let active = enabled;
  let disposed = false;
  let generation = 0;
  const sources = new Set();
  const recordingBuffers = new Map();
  let preloadPromise;

  function preloadRecordings(audio) {
    preloadPromise ||= Promise.all(
      [...HIT_SOUND_URLS, ...SPAWN_SOUND_URLS, bossHitUrl].map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) return;
          const buffer = await audio.decodeAudioData(await response.arrayBuffer());
          if (!disposed) recordingBuffers.set(url, buffer);
        } catch {
          // Skip recordings that cannot be loaded; other effects remain available.
        }
      }),
    );
    return preloadPromise;
  }

  function stop() {
    generation += 1;
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        /* A finished source may already be stopped. */
      }
    }
    sources.clear();
  }

  async function ready() {
    const currentGeneration = generation;
    if (!active || disposed) return null;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context ||= new AudioContext();
      if (context.state === 'suspended') await context.resume();
      return active && !disposed && generation === currentGeneration && context.state === 'running'
        ? context
        : null;
    } catch {
      return null;
    }
  }

  function playSource(audio, source, volume, duration, delay = 0, recorded = false) {
    const gain = audio.createGain();
    const now = audio.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    if (recorded) gain.gain.setValueAtTime(volume, now + Math.max(0.008, duration - 0.03));
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(gain);
    gain.connect(audio.destination);
    sources.add(source);
    source.onended = () => {
      sources.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start(now);
    source.stop(now + duration);
  }

  async function playRecording(url, volume) {
    const requestedGeneration = generation;
    const audio = await ready();
    if (!audio || !url) return;
    await preloadRecordings(audio);
    // A pause, mute or exit cancels playback that was waiting for decoding.
    if (!active || disposed || requestedGeneration !== generation) return;
    const buffer = recordingBuffers.get(url);
    if (!buffer) return;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    playSource(audio, source, volume, buffer.duration, 0, true);
  }

  return {
    bossHit() {
      return playRecording(bossHitUrl, 0.65);
    },
    spawn() {
      const url = SPAWN_SOUND_URLS[Math.floor(Math.random() * SPAWN_SOUND_URLS.length)];
      return playRecording(url, 0.4);
    },
    async unlock() {
      // Decode recordings early so impact playback never waits for a download.
      const audio = await ready();
      if (audio) await preloadRecordings(audio);
    },
    async cannon() {
      // Called by the submit gesture, which unlocks browser audio playback.
      const audio = await ready();
      if (!audio) return;
      const boom = audio.createOscillator();
      boom.frequency.setValueAtTime(150, audio.currentTime);
      boom.frequency.exponentialRampToValueAtTime(35, audio.currentTime + 0.4);
      playSource(audio, boom, 0.38, 0.5);

      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.24), audio.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index++) {
        samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
      }
      const crack = audio.createBufferSource();
      crack.buffer = buffer;
      playSource(audio, crack, 0.18, 0.24);
    },
    hit() {
      const url = HIT_SOUND_URLS[Math.floor(Math.random() * HIT_SOUND_URLS.length)];
      return playRecording(url, 0.65);
    },
    async bossDeath() {
      if (!active || disposed) return;
      const audio = await ready();
      if (!audio) return;
      // An exaggerated rising shriek that wobbles down into a silly squeak.
      const howl = audio.createOscillator();
      howl.type = 'sawtooth';
      const now = audio.currentTime;
      howl.frequency.setValueAtTime(170, now);
      howl.frequency.exponentialRampToValueAtTime(850, now + 0.25);
      howl.frequency.linearRampToValueAtTime(470, now + 0.5);
      howl.frequency.linearRampToValueAtTime(1000, now + 0.7);
      howl.frequency.exponentialRampToValueAtTime(65, now + 1.4);
      playSource(audio, howl, 0.09, 1.5);
    },
    async gameOver() {
      const audio = await ready();
      if (!audio) return;
      // A short descending "wah-wah", ending in a comically drooping note.
      [293.66, 261.63, 220, 146.83].forEach((frequency, index) => {
        const note = audio.createOscillator();
        note.type = 'triangle';
        const delay = index * 0.23;
        const start = audio.currentTime + delay;
        const duration = index === 3 ? 0.7 : 0.28;
        note.frequency.setValueAtTime(frequency, start);
        note.frequency.exponentialRampToValueAtTime(
          frequency * (index === 3 ? 0.55 : 0.94),
          start + duration,
        );
        playSource(audio, note, 0.16, duration, delay);
      });
    },
    async victory() {
      const audio = await ready();
      if (!audio) return;
      // A rising major arpeggio, a final chord, and little confetti pops.
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
        const note = audio.createOscillator();
        note.type = 'triangle';
        note.frequency.value = frequency;
        playSource(audio, note, 0.12, 0.35, index * 0.12);
      });
      [523.25, 659.25, 783.99].forEach((frequency) => {
        const note = audio.createOscillator();
        note.type = 'triangle';
        note.frequency.value = frequency;
        playSource(audio, note, 0.07, 0.85, 0.8);
      });
      for (let index = 0; index < 8; index++) {
        const pop = audio.createOscillator();
        const start = audio.currentTime + index * 0.13;
        pop.frequency.setValueAtTime(700 + Math.random() * 500, start);
        pop.frequency.exponentialRampToValueAtTime(120, start + 0.07);
        playSource(audio, pop, 0.05, 0.08, index * 0.13);
      }
    },
    setEnabled(value) {
      active = value;
      if (!active) stop();
      else
        ready().then((audio) => {
          if (audio) preloadRecordings(audio);
        });
      try {
        localStorage.setItem(SOUND_KEY, value ? 'on' : 'off');
      } catch {
        /* Sound still works without storage. */
      }
    },
    stop,
    dispose() {
      disposed = true;
      stop();
      recordingBuffers.clear();
      context?.close().catch(() => {});
    },
  };
}
