const STORAGE_KEY = 'word-castle.v1';

export function createId() {
  return crypto.randomUUID();
}

export function loadBatches() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (
    !Array.isArray(data) ||
    !data.every(
      (batch) =>
        typeof batch.id === 'string' &&
        typeof batch.name === 'string' &&
        Array.isArray(batch.words) &&
        batch.words.length > 0 &&
        batch.words.every(
          (word) =>
            typeof word.id === 'string' &&
            typeof word.norwegian === 'string' &&
            word.norwegian.trim() &&
            typeof word.english === 'string' &&
            word.english.trim(),
        ),
    )
  )
    throw new Error('Saved vocabulary could not be read.');
  return data;
}

export function saveBatches(batches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}
