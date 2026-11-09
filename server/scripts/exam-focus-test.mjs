// Live IOE / IOM focus test: runs a quiz for every subject, +2 group and grade against the real server
// and checks that every question belongs to an exam the class sits, on an official syllabus unit.
//   AI_SERVER=https://… AI_ACCESS_CODE=… node scripts/exam-focus-test.mjs [count]
import { examsFor, unitsFor } from '../src/syllabus.js';

const URL_ = process.env.AI_SERVER;
const CODE = process.env.AI_ACCESS_CODE;
const COUNT = Number(process.argv[2]) || 10;
if (!URL_ || !CODE) { console.error('set AI_SERVER and AI_ACCESS_CODE'); process.exit(1); }

const s = (...t) => t.map((text, i) => ({ n: i + 1, text }));
const CASES = [
  ['physics', 'PHY', '11', 'Kinematics', s('Equations of motion: v = u + at, s = ut + ½at², v² = u² + 2as.', 'Projectile motion: range R = u² sin 2θ / g, maximum height H = u² sin²θ / 2g, time of flight 2u sin θ / g.', 'Relative velocity and motion graphs: slope of v–t graph is acceleration, area is displacement.')],
  ['physics', 'PHY', '12', 'Electromagnetic induction', s("Faraday's law e = −dΦ/dt, Lenz's law, flux Φ = BA cos θ.", 'Motional emf e = Blv, AC generator e = NBAω sin ωt.', 'Self inductance e = −L di/dt, energy ½LI², transformer Vs/Vp = Ns/Np.')],
  ['physics', 'BIO', '11', 'Thermodynamics', s('First law ΔQ = ΔU + ΔW. Work done by gas W = PΔV.', 'Isothermal PV = constant, adiabatic PVᵞ = constant, molar heat capacities Cp − Cv = R.', 'Heat engine efficiency η = 1 − T₂/T₁, Carnot cycle, second law, refrigerator COP.')],
  ['physics', 'BIO', '12', 'Photoelectric effect and atomic physics', s('Photon energy E = hf, photoelectric equation hf = φ + ½mv²max, stopping potential eV₀ = ½mv²max, threshold frequency.', 'de Broglie wavelength λ = h/p, Bohr model rₙ ∝ n², Eₙ = −13.6/n² eV, hydrogen spectral series.', 'X-rays, Moseley law, radioactivity: half life T½ = 0.693/λ, N = N₀e^(−λt).')],
  ['chemistry', 'PHY', '11', 'Mole concept and stoichiometry', s('Mole = 6.022 × 10²³ particles; molar mass; molar volume 22.4 L at STP.', 'Empirical and molecular formula, percentage composition.', 'Limiting reagent, percentage yield, molarity, normality, equivalent weight.')],
  ['chemistry', 'BIO', '12', 'Electrochemistry', s('Electrolysis, Faraday laws m = ZIt, Z = E/96500.', 'Galvanic cell, standard electrode potential, E°cell = E°cathode − E°anode, Nernst equation.', 'Conductance, molar conductivity, Kohlrausch law, corrosion.')],
  ['chemistry', 'BIO', '11', 'Chemical bonding', s('Ionic and covalent bonds, Fajans rules, polarity and dipole moment.', 'VSEPR theory: shapes of BeCl₂, BF₃, CH₄, NH₃, H₂O, PCl₅, SF₆.', 'Hybridisation sp, sp², sp³, sp³d, sp³d²; hydrogen bonding; bond order from MO theory.')],
  ['mathematics', 'PHY', '11', 'Quadratic equations and complex numbers', s('Quadratic ax² + bx + c = 0: roots, discriminant, sum −b/a, product c/a, nature of roots.', 'Complex numbers: modulus, argument, conjugate, polar form, De Moivre theorem, cube roots of unity ω.', 'Forming equations with given roots, symmetric functions of roots.')],
  ['mathematics', 'PHY', '12', 'Integration', s('Standard integrals, integration by substitution and by parts.', 'Definite integrals and their properties, ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a − x) dx.', 'Area under curves and between two curves.')],
  ['biology', 'BIO', '11', 'Cell biology', s('Cell theory; prokaryotic and eukaryotic cells.', 'Cell organelles: mitochondria, chloroplast, ribosome, endoplasmic reticulum, Golgi body, lysosome, nucleus.', 'Cell division: mitosis and meiosis, stages, crossing over, significance.')],
  ['biology', 'BIO', '12', 'Genetics', s('Mendel laws, monohybrid 3:1 and dihybrid 9:3:3:1 ratios, test cross.', 'Incomplete dominance, codominance, multiple alleles, ABO blood groups, linkage and crossing over.', 'Sex determination, sex-linked inheritance, haemophilia and colour blindness, mutation.')],
  ['english', 'PHY', '12', 'Grammar: tense, voice and narration', s('Sequence of tenses and subject–verb agreement.', 'Active and passive voice; direct and indirect speech.', 'Conditionals, gerunds, infinitives and participles.')],
];

let failures = 0;
for (const [subject, group, cls, title, slides] of CASES) {
  const allowed = examsFor(subject, group);
  const context = { cls, group, subject, subjectLabel: subject, portion: null, portionLabel: title, chapter: 1, title, currentSlide: 1, slides };
  const t0 = Date.now();
  const res = await fetch(`${URL_}/quiz`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-access-code': CODE }, body: JSON.stringify({ context, count: COUNT }) });
  const j = await res.json().catch(() => ({}));
  const secs = Math.round((Date.now() - t0) / 1000);
  const items = j.items || [];
  const problems = [];
  if (res.status !== 200) problems.push(`HTTP ${res.status} ${j.error || ''}`);
  if (items.length < COUNT) problems.push(`only ${items.length}/${COUNT} questions`);
  const byExam = {};
  for (const q of items) {
    const exam = q.kind === 'practice' ? q.style : q.exam;
    byExam[exam] = (byExam[exam] || 0) + 1;
    if (!allowed.includes(exam)) problems.push(`not an exam this class sits: ${exam} | ${String(q.question).slice(0, 50)}`);
    if (q.kind === 'practice') {
      const units = unitsFor(subject, exam);
      if (units.length && !units.includes(q.unit)) problems.push(`off-syllabus unit "${q.unit}" for ${exam}`);
      if (q.grade && q.grade !== cls) problems.push(`grade ${q.grade} in a Class ${cls} quiz`);
    }
  }
  const practice = items.filter((q) => q.kind === 'practice').length;
  if (allowed.length > 1 && practice >= 4 && allowed.some((e) => !byExam[e])) problems.push(`missing ${allowed.filter((e) => !byExam[e]).join(', ')}`);
  if (problems.length) failures++;
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${subject.padEnd(11)} ${group} ${cls}  ${String(secs).padStart(3)}s  ${items.length} items (${items.length - practice} bank)  ${JSON.stringify(byExam)}${problems.length ? `\n      ${problems.slice(0, 4).join('\n      ')}` : ''}`);
  await new Promise((r) => setTimeout(r, 5000)); // stay under the free tier's per-minute limit
}

// A subject no entrance exam tests gets no quiz.
const neg = await fetch(`${URL_}/quiz`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-access-code': CODE }, body: JSON.stringify({ context: { cls: '11', group: 'PHY', subject: 'nepali', slides: s('व्याकरण') }, count: 5 }) });
console.log(`${neg.status === 400 ? 'ok  ' : 'FAIL'} nepali (no entrance exam) → HTTP ${neg.status}`);
if (neg.status !== 400) failures++;
console.log(`\n${CASES.length + 1 - failures}/${CASES.length + 1} passed`);
process.exitCode = failures ? 1 : 0;
