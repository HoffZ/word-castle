export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

// Teach one accepted translation; the battle still accepts every alternative.
export function practiceAnswer(word) {
  return (
    word.english
      .split(';')
      .map((answer) => answer.trim())
      .find(Boolean) || ''
  );
}

export function letterSlots(word) {
  return Array.from(practiceAnswer(word)).map((letter, id) => ({
    id,
    letter,
    fixed: !/[\p{L}\p{N}]/u.test(letter),
  }));
}
