(function (root) {
  'use strict';
  const ROUND_SIZE = 10;
  const WORK_LIMIT = 2;
  function shuffle(items, rng = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function drawRound(bank, difficulty, rng = Math.random) {
    if (!['easy', 'hard'].includes(difficulty)) throw new Error('Unknown difficulty');
    const candidates = shuffle(bank.filter(q => q.difficulty === difficulty), rng);
    const counts = new Map();
    const selected = [];
    for (const question of candidates) {
      const count = counts.get(question.work) || 0;
      if (count >= WORK_LIMIT) continue;
      counts.set(question.work, count + 1);
      selected.push({
        ...question,
        options: shuffle(question.options.map((text, i) => ({ text, correct: i === question.answer })), rng)
      });
      if (selected.length === ROUND_SIZE) break;
    }
    if (selected.length !== ROUND_SIZE) throw new Error('Not enough distinct questions for a round');
    return selected;
  }
  const api = Object.freeze({ ROUND_SIZE, WORK_LIMIT, shuffle, drawRound });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SFAQuiz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
