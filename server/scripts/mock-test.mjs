// Checks the free-model switching in src/ai.js with fake Gemini / Workers AI replies (no network).
//   node scripts/mock-test.mjs
import assert from 'node:assert/strict';
import * as ai from '../src/ai.js';

const ctx = { cls: '12', subjectLabel: 'Physics', portionLabel: 'Electricity', chapter: 3, title: 'EMI', slides: [{ n: 1, text: 'Lenz law' }], currentSlide: 1 };
const reply = { action: 'answer', answer: 'ok', slide: null, cited_slides: [1], question_ids: [] };
const ask = (env) => ai.ask(env, { context: ctx, query: 'q', pastList: '' });
const fence = '`'.repeat(3);

// 1. Gemini answers (reply wrapped in a code fence is still read)
let sent;
globalThis.fetch = async (url, init) => {
  sent = JSON.parse(init.body);
  const text = `${fence}json\n${JSON.stringify(reply)}\n${fence}`;
  return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }] }), { status: 200 });
};
assert.equal((await ask({ GEMINI_API_KEY: 'k' })).answer, 'ok');
assert.ok(sent.generationConfig.responseJsonSchema);
console.log('1 gemini answers: ok');

// 2. Gemini rate-limited -> Workers AI
globalThis.fetch = async () => new Response('{}', { status: 429 });
const env = { GEMINI_API_KEY: 'k', AI: { run: async (m) => ({ response: { ...reply, answer: `from ${m}` } }) } };
assert.match((await ask(env)).answer, /^from @cf\//);
console.log('2 falls back to Workers AI: ok');

// 3. Both busy -> friendly 429
env.AI.run = async () => { throw new Error('daily limit'); };
await assert.rejects(ask(env), (e) => e.status === 429);
console.log('3 both busy -> 429: ok');

// 4. Wrong Gemini key -> setup error (not hidden by the fallback)
globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400 });
await assert.rejects(ask({ GEMINI_API_KEY: 'bad' }), (e) => e.status === 500 && /API key not valid/.test(e.message));
console.log('4 bad key reported: ok');

// 4b. Wrong Gemini key but Workers AI bound -> the backup still answers
assert.match((await ask({ GEMINI_API_KEY: 'bad', AI: { run: async (m) => ({ response: { ...reply, answer: `from ${m}` } }) } })).answer, /^from @cf\//);
console.log('4b bad key falls back to Workers AI: ok');

// 4c. Renamed Gemini model (400 without a key error) -> next Gemini model answers
{
  let calls = 0;
  globalThis.fetch = async () => (++calls === 1
    ? new Response(JSON.stringify({ error: { message: 'model does not support responseJsonSchema' } }), { status: 400 })
    : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(reply) }] } }] }), { status: 200 }));
  assert.equal((await ask({ GEMINI_API_KEY: 'k', GEMINI_MODEL: 'renamed-model-4c' })).answer, 'ok');
  console.log('4c model-specific 400 tries the next model: ok');
}

// 4d. Workers AI main model times out -> small fast model answers Ask
{
  globalThis.fetch = async () => new Response('{}', { status: 429 });
  const run = async (m) => (m.includes('70b') ? new Promise(() => {}) : { response: { ...reply, answer: `from ${m}` } });
  assert.match((await ask({ GEMINI_API_KEY: 'k', AI: { run } })).answer, /8b/);
  console.log('4d second Workers AI model answers: ok');
}

// 5. No Gemini key -> Workers AI only (string reply)
assert.equal((await ask({ AI: { run: async () => ({ response: JSON.stringify(reply) }) } })).answer, 'ok');
console.log('5 Workers AI only: ok');
