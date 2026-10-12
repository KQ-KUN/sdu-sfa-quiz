import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const bank = JSON.parse(fs.readFileSync(path.join(root, 'src/questions.json'), 'utf8'));
const ids = new Set();
for (const q of bank) {
  if (typeof q.id !== 'string' || ids.has(q.id)) throw new Error('Missing or repeated question ID');
  ids.add(q.id);
  if (!['easy', 'hard'].includes(q.difficulty) || !q.work || !q.prompt || !q.explanation) throw new Error(`Missing fields: ${q.id}`);
  if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.some(o => typeof o !== 'string' || !o.trim())) throw new Error(`Invalid options: ${q.id}`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) throw new Error(`Invalid answer: ${q.id}`);
  if (typeof q.spoiler !== 'boolean' || !q.source?.name || !/^https:\/\//.test(q.source?.url || '')) throw new Error(`Invalid source: ${q.id}`);
}
for (const difficulty of ['easy', 'hard']) {
  if (bank.filter(q => q.difficulty === difficulty).length !== 30) throw new Error('Expected 30 questions per difficulty');
}
function data(name, mime) {
  return `data:${mime};base64,${fs.readFileSync(path.join(root, 'assets', name)).toString('base64')}`;
}
const assets = { logo: data('logo.png', 'image/png'), mascot: data('mascot.jpg', 'image/jpeg') };
const config = { qr: data('recruitment-qr.jpg', 'image/jpeg'), group: '698414186', crop: true };
let template = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');
for (const [marker, value] of [['__ASSETS__', assets], ['__CONFIG__', config], ['__QUESTIONS__', bank]]) {
  template = template.replace(marker, JSON.stringify(value).replace(/</g, '\\u003c'));
}
template = template.replace('__CORE__', () => fs.readFileSync(path.join(root, 'src/quiz-core.js'), 'utf8'));
if (/__(ASSETS|CONFIG|QUESTIONS|CORE)__/.test(template)) throw new Error('Unfilled template');
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/index.html'), template);
fs.writeFileSync(path.join(root, 'SDU-SFA-quiz.html'), template);
fs.writeFileSync(path.join(root, 'docs/.nojekyll'), '');
let catalog = '# 科幻招新题库\n\n共 60 题，简单、困难各 30 题。每轮随机抽 10 题，同一作品最多 2 题。带“剧情题”的题目涉及关键情节。题目与解析自行编写；会徽、社娘和群二维码由社团提供。\n';
for (const difficulty of ['easy', 'hard']) {
  catalog += `\n## ${difficulty === 'easy' ? '简单' : '困难'}\n`;
  for (const q of bank.filter(q => q.difficulty === difficulty)) {
    catalog += `\n### ${q.id} ${q.prompt}${q.spoiler ? '（剧情题）' : ''}\n\n${q.options.map((option, i) => `${'ABCD'[i]}. ${option}`).join('\n\n')}\n\n答案：${'ABCD'[q.answer]} · ${q.options[q.answer]}\n\n${q.explanation}\n\n依据：[${q.source.name}](${q.source.url})\n`;
  }
}
fs.writeFileSync(path.join(root, '题库与参考来源.md'), catalog);
console.log(`Built docs/index.html (${Buffer.byteLength(template)} bytes); ${bank.length} questions`);
