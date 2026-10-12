const assert = require('node:assert/strict');
const bank = require('../src/questions.json');
const { drawRound, shuffle } = require('../src/quiz-core.js');
function seeded(seed) { let state = seed; return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; }; }
for (const difficulty of ['easy', 'hard']) {
  const seen = new Set();
  const placements = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const round = drawRound(bank, difficulty, seeded(seed));
    assert.equal(round.length, 10);
    assert.equal(new Set(round.map(q => q.id)).size, 10);
    const works = new Map();
    for (const q of round) {
      assert.equal(q.difficulty, difficulty);
      works.set(q.work, (works.get(q.work) || 0) + 1);
      assert(works.get(q.work) <= 2);
      assert.equal(q.options.filter(o => o.correct).length, 1);
      const source = bank.find(item => item.id === q.id);
      assert.equal(q.options.find(o => o.correct).text, source.options[source.answer]);
      assert.deepEqual(q.options.map(o => o.text).sort(), [...source.options].sort());
      seen.add(q.id); placements.add(q.options.findIndex(o => o.correct));
    }
  }
  assert.equal(seen.size, 30, 'Every question must be reachable');
  assert.equal(placements.size, 4, 'Answers should appear in every position');
}
assert.throws(() => drawRound(bank, 'unknown'));
assert.throws(() => drawRound(bank.slice(0, 2), 'easy'));
assert.deepEqual(shuffle([]), []);
assert.equal(bank.find(q => q.id === 'H03').options[0], '强相互作用');
assert.equal(bank.find(q => q.id === 'H20').options[0], '航行距离');
assert.equal(bank.find(q => q.id === 'E29').options[0], '距离');
assert.equal(bank.filter(q => q.difficulty === 'easy' && q.spoiler).length, 0);
console.log('Passed: 600 seeded rounds, difficulty isolation, no duplicates, topic cap, all 60 questions reachable, answer preservation and shuffled placement');
