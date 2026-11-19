(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- NAV ---------- */
const nav = $('#navbar'), burger = $('#burger'), menu = $('#mobileMenu');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
burger.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  burger.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.innerHTML = '<i class="ph ph-list"></i>'; }));
const navLinks = $$('.nav__links a');
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => { const s = $(a.getAttribute('href')); if (s) secObs.observe(s); });

/* ---------- REVEAL ---------- */
const revObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el, i) => {
  const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')) : [];
  el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 80 + 'ms';
  revObs.observe(el);
});

/* ---------- COUNTERS ---------- */
const cObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cObs.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
  const t0 = performance.now(), dur = reduce ? 1 : 1400;
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString('fr-FR') + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: .5 });
$$('[data-count]').forEach(el => cObs.observe(el));

/* hero live chip */
const hw = $('#heroWater'); let hv = 64;
setInterval(() => { hv += Math.random() > .5 ? 1 : -1; hv = Math.max(58, Math.min(70, hv)); hw.textContent = hv + '%'; }, 2500);

/* ---------- HOW IT WORKS (pinned) ---------- */
const track = $('#howTrack'), steps = $$('#steps .step'), layers = $$('.how__overlay [data-step]'), howImg = $('#howImg'), howBar = $('#howBar');
let curStep = -1;
function setStep(i) {
  if (i === curStep) return; curStep = i;
  steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  layers.forEach(l => l.classList.toggle('on', +l.dataset.step === i));
  const tf = ['scale(1.02)', 'scale(1.12) translate(-3%,2%)', 'scale(1.08) translate(2%,-2%)', 'scale(1)'];
  howImg.style.transform = tf[i];
  howImg.style.filter = i === 1 ? 'brightness(.75)' : i === 3 ? 'brightness(.6) saturate(.8)' : 'none';
}
function howScroll() {
  if (innerWidth <= 860) { if (curStep < 0) setStep(0); return; }
  const r = track.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
  howBar.style.width = (p * 100) + '%';
  setStep(Math.min(3, Math.floor(p * 4)));
}
addEventListener('scroll', howScroll, { passive: true }); addEventListener('resize', howScroll); howScroll();
// mobile: tap steps
steps.forEach((s, i) => s.addEventListener('click', () => { if (innerWidth <= 860) setStep(i); }));

/* ---------- ANATOMY ---------- */
const PARTS = [
  ['Sonde de sol', '4 mesures', "Plantée au cœur du terreau, elle mesure l'humidité, la conductivité (nutriments) et la température des racines toutes les 10 minutes."],
  ['Anneau lumineux', 'LED RVB', "Il résume l'état de la plante d'un coup d'œil et intègre le capteur de lumière (lux + UV). Il s'éteint automatiquement la nuit."],
  ['Fenêtre de niveau', 'verre dépoli', "Vérifiez le niveau du réservoir sans ouvrir l'application. Une alerte vous prévient quand il reste moins de 20 %."],
  ['Réservoir et micro-pompe', '0,6 à 2,5 L', "Le réservoir est séparé du terreau. La micro-pompe silencieuse délivre l'eau au millilitre près, au plus près des racines."],
  ['Batterie et USB-C', '6 mois', "Batterie lithium rechargeable en 2 h par le port USB-C caché sous le pot. La base étanche protège vos meubles."]
];
const partsEl = $('#parts'), hots = $$('.hotspot');
partsEl.innerHTML = PARTS.map((p, i) => `<li class="part" data-i="${i}"><button aria-expanded="false"><span class="n">${i + 1}</span>${p[0]}<span class="spec">${p[1]}</span></button><div class="desc"><p>${p[2]}</p></div></li>`).join('');
const partEls = $$('.part');
function setPart(i) {
  partEls.forEach((p, k) => { const on = k === i; p.classList.toggle('on', on); $('button', p).setAttribute('aria-expanded', on); });
  hots.forEach((h, k) => h.classList.toggle('on', k === i));
}
partEls.forEach((p, i) => $('button', p).addEventListener('click', () => setPart(p.classList.contains('on') ? -1 : i)));
hots.forEach(h => h.addEventListener('click', () => setPart(+h.dataset.part)));
setPart(0);

/* ---------- SIMULATOR ---------- */
const SPECIES = {
  monstera: { name: 'Monstera', icon: 'ph-leaf', decay: { water: 1.5, sun: 1.1, nutrients: .5 }, ideal: { water: [50, 80], sun: [40, 75], nutrients: [40, 80] } },
  cactus: { name: 'Cactus', icon: 'ph-cactus', decay: { water: .45, sun: 1.6, nutrients: .25 }, ideal: { water: [10, 35], sun: [70, 100], nutrients: [20, 55] } },
  fougere: { name: 'Fougère', icon: 'ph-plant', decay: { water: 2.4, sun: .8, nutrients: .6 }, ideal: { water: [65, 95], sun: [20, 50], nutrients: [40, 75] } },
  orchidee: { name: 'Orchidée', icon: 'ph-flower-lotus', decay: { water: 1.0, sun: 1.0, nutrients: .7 }, ideal: { water: [35, 60], sun: [45, 70], nutrients: [30, 60] } }
};
const ADD = { water: 20, sun: 15, nutrients: 25 };
const LABEL = { water: 'Hydratation', sun: 'Luminosité', nutrients: 'Nutriments' };
let sp = 'monstera', st, hour, day, speed = 1, paused = false, manual = 0, autoN = 0, lastWarn = {};
const ui = {
  hv: $('#health-value'), hb: $('#health-bar'), status: $('#plant-status-text'), plant: $('#animated-plant'),
  led: $('#ledRing'), log: $('#log'), clock: $('#clockText'), clockIcon: $('#clockIcon'), sky: $('#sky'), sun: $('#skySun'), fx: $('#fx'),
  mc: $('#manualCount'), ac: $('#autoCount'), auto: $('#autoMode'), soil: $('#soil')
};
const seg = $('#speciesSeg');
seg.innerHTML = Object.entries(SPECIES).map(([k, s]) => `<button role="radio" aria-checked="${k === sp}" data-sp="${k}"><i class="ph ${s.icon}"></i>${s.name}</button>`).join('');
$$('button', seg).forEach(b => b.addEventListener('click', () => { sp = b.dataset.sp; $$('button', seg).forEach(x => x.setAttribute('aria-checked', x === b)); reset(); }));
$$('#speedSeg button').forEach(b => b.addEventListener('click', () => { speed = +b.dataset.speed; $$('#speedSeg button').forEach(x => x.setAttribute('aria-checked', x === b)); restartLoop(); }));
$('#pauseBtn').addEventListener('click', e => { paused = !paused; e.currentTarget.innerHTML = paused ? '<i class="ph ph-play"></i>' : '<i class="ph ph-pause"></i>'; e.currentTarget.setAttribute('aria-label', paused ? 'Reprendre' : 'Pause'); });
$('#resetBtn').addEventListener('click', reset);
ui.auto.addEventListener('change', () => log(ui.auto.checked ? 'Mode Aura activé : arrosage automatique et alertes.' : 'Mode Aura désactivé : à vous de jouer.', 'auto'));

const pad = n => String(n).padStart(2, '0');
const stamp = () => `J${day} ${pad(hour)}h`;
function log(msg, cls = '') {
  const li = document.createElement('li'); li.className = cls;
  li.innerHTML = `<time>${stamp()}</time><span>${msg}</span>`;
  ui.log.prepend(li);
  while (ui.log.children.length > 8) ui.log.lastChild.remove();
}
function statHealth(k) {
  const [lo, hi] = SPECIES[sp].ideal[k], v = st[k];
  if (v >= lo && v <= hi) return 100;
  const d = v < lo ? lo - v : v - hi;
  return Math.max(0, 100 - d * (v > hi ? 3.2 : 2.4));
}
function health() { return Math.round((statHealth('water') + statHealth('sun') + statHealth('nutrients')) / 3); }

function reset() {
  const id = SPECIES[sp].ideal;
  st = {}; for (const k in id) st[k] = (id[k][0] + id[k][1]) / 2;
  hour = 8; day = 1; manual = 0; autoN = 0; lastWarn = {};
  ui.log.innerHTML = '';
  for (const k of ['water', 'sun', 'nutrients']) {
    const [lo, hi] = id[k], b = $('#' + k + '-band');
    b.style.left = lo + '%'; b.style.width = (hi - lo) + '%';
  }
  log(`Profil ${SPECIES[sp].name} chargé. Zones idéales calibrées.`, 'auto');
  render();
}
function burst(k) {
  const icon = { water: ['ph-drop', '#60a5fa'], sun: ['ph-sun', '#facc15'], nutrients: ['ph-sparkle', '#c084fc'] }[k];
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('i');
    el.className = 'ph-fill ' + icon[0]; el.style.color = icon[1];
    el.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    el.style.animationDelay = i * 70 + 'ms';
    ui.fx.appendChild(el); setTimeout(() => el.remove(), 1200);
  }
}
function care(k, isAuto = false, amount) {
  const before = st[k];
  st[k] = Math.min(100, st[k] + (amount ?? ADD[k]));
  burst(k);
  if (isAuto) { autoN++; log(`Aura a arrosé automatiquement (+${Math.round(st[k] - before)} %).`, 'auto'); }
  else {
    manual++;
    const hi = SPECIES[sp].ideal[k][1];
    if (st[k] > hi) log(`${LABEL[k]} trop élevée pour ${SPECIES[sp].name.toLowerCase()} : attention à l'excès.`, 'warn');
  }
  render();
}
$$('.action').forEach(b => b.addEventListener('click', () => care(b.dataset.act)));

function tick() {
  if (paused) return;
  hour++; if (hour >= 24) { hour = 0; day++; }
  const night = hour >= 20 || hour < 7;
  const d = SPECIES[sp].decay;
  st.water -= d.water * (.6 + Math.random() * .8);
  st.sun -= d.sun * (night ? 1.8 : .5) * (.6 + Math.random() * .8);
  if (!night && Math.random() < .25) st.sun += 1.2; // lumière naturelle
  st.nutrients -= d.nutrients * (.5 + Math.random());
  for (const k in st) st[k] = Math.max(0, Math.min(100, st[k]));

  const id = SPECIES[sp].ideal;
  if (ui.auto.checked) {
    if (st.water < id.water[0]) care('water', true, (id.water[0] + id.water[1]) / 2 - st.water);
    for (const k of ['sun', 'nutrients']) {
      if (st[k] < id[k][0] && (!lastWarn[k] || day * 24 + hour - lastWarn[k] > 10)) {
        lastWarn[k] = day * 24 + hour;
        log(k === 'sun' ? 'Conseil : rapprochez la plante de la fenêtre.' : 'Conseil : ajoutez une dose d\u2019engrais.', 'warn');
      }
    }
  }
  const h = health();
  if (h <= 30 && (!lastWarn.crit || day * 24 + hour - lastWarn.crit > 12)) { lastWarn.crit = day * 24 + hour; log('Alerte : santé critique !', 'bad'); }
  render();
}
let loop;
function restartLoop() { clearInterval(loop); loop = setInterval(tick, 1500 / speed); }

function render() {
  const h = health();
  ui.hv.textContent = h + '%';
  ui.hb.style.width = h + '%';
  ui.hb.className = 'fill fill--health' + (h <= 30 ? ' low' : h <= 60 ? ' mid' : '');
  for (const k of ['water', 'sun', 'nutrients']) {
    const v = st[k], [lo, hi] = SPECIES[sp].ideal[k];
    const t = $('#' + k + '-text'), b = $('#' + k + '-bar');
    t.textContent = Math.round(v) + '%';
    t.classList.toggle('over', v > hi);
    b.style.width = v + '%';
    const sh = statHealth(k);
    b.classList.toggle('low', sh <= 35); b.classList.toggle('mid', sh > 35 && sh < 100);
  }
  ui.plant.classList.remove('plant-happy', 'plant-droop', 'plant-yellow');
  const over = st.water > SPECIES[sp].ideal.water[1] + 8;
  let msg, cls, led;
  if (h > 75) { ui.plant.classList.add('plant-happy'); msg = 'Votre plante est en pleine forme.'; cls = 'ok'; led = '#34d399'; }
  else if (h > 35) { if (over) ui.plant.classList.add('plant-yellow'); msg = over ? 'Trop d\u2019eau : les racines manquent d\u2019air.' : 'La plante a besoin d\u2019un peu d\u2019attention.'; cls = 'warn'; led = '#fbbf24'; }
  else { ui.plant.classList.add('plant-droop'); msg = 'Alerte : santé critique !'; cls = 'bad'; led = '#f87171'; }
  ui.status.textContent = msg; ui.status.className = 'status status--' + cls;
  ui.led.setAttribute('stroke', led); ui.led.style.color = led;
  ui.soil.setAttribute('fill', st.water > 60 ? '#1f2937' : st.water > 30 ? '#3f3a35' : '#6b5a45');
  const night = hour >= 20 || hour < 7;
  ui.sky.classList.toggle('night', night);
  ui.sun.style.left = (night ? ((hour + 4) % 24) / 11 * 80 + 10 : (hour - 7) / 13 * 80 + 10) + '%';
  ui.clockIcon.className = 'ph ' + (night ? 'ph-moon' : 'ph-sun');
  ui.clock.textContent = `Jour ${day} · ${pad(hour)}:00`;
  ui.mc.textContent = manual; ui.ac.textContent = autoN;
}
reset(); restartLoop();

/* ---------- APP MOCKUP ---------- */
const ring = (v, c) => `<svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,.1)"/><circle cx="22" cy="22" r="18" stroke="${c}" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 18}" stroke-dashoffset="${2 * Math.PI * 18 * (1 - v / 100)}" transform="rotate(-90 22 22)"/><text x="22" y="26" text-anchor="middle" font-size="11" fill="#fff" font-family="Inter" font-weight="600">${v}</text></svg>`;
const MY = [
  ['Monstera', 'Salon', 94, '#34d399', 'Eau 64 %'], ['Pilea', 'Cuisine', 88, '#34d399', 'Eau 52 %'],
  ['Calathea', 'Chambre', 61, '#fbbf24', 'Trop de lumière'], ['Sansevieria', 'Bureau', 97, '#34d399', 'Eau 22 %']
];
$('#plantList').innerHTML = MY.map(p => `<button class="pcard" data-goto="hist">${ring(p[2], p[3])}<div><b>${p[0]}</b><small>${p[1]}</small></div><span class="pmeta">${p[4]}</span></button>`).join('');
const ptabs = $$('.ptabs button');
function tab(id) { ptabs.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id)); $$('.ppanel').forEach(p => p.hidden = p.dataset.panel !== id); if (id === 'hist') drawChart(curM); }
ptabs.forEach(b => b.addEventListener('click', () => tab(b.dataset.tab)));
$$('.pcard').forEach(b => b.addEventListener('click', () => tab('hist')));
const METRICS = {
  water: { data: [72, 66, 58, 51, 78, 70, 63], band: [50, 80], unit: '%', color: '#60a5fa', note: 'Arrosage automatique jeudi (+27 %). Humidité toujours dans la zone idéale.' },
  sun: { data: [45, 62, 70, 38, 55, 68, 60], band: [40, 75], unit: '%', color: '#facc15', note: 'Journée sombre mercredi. Moyenne de la semaine : 57 %.' },
  temp: { data: [21, 22, 22.5, 20, 19.5, 21, 22], band: [18, 27], unit: '°C', color: '#f472b6', note: 'Températures stables, aucun courant d\u2019air détecté.', min: 15, max: 30 }
};
let curM = 'water';
function drawChart(m) {
  curM = m; const M = METRICS[m], svg = $('#chart');
  const W = 280, H = 160, L = 26, R = 8, T = 10, B = 22, mn = M.min ?? 0, mx = M.max ?? 100;
  const x = i => L + i * (W - L - R) / 6, y = v => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const pts = M.data.map((v, i) => [x(i), y(v)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${x(6)} ${H - B} L${x(0)} ${H - B} Z`;
  svg.innerHTML = `
    <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${M.color}" stop-opacity=".35"/><stop offset="1" stop-color="${M.color}" stop-opacity="0"/></linearGradient></defs>
    <rect x="${L}" y="${y(M.band[1])}" width="${W - L - R}" height="${y(M.band[0]) - y(M.band[1])}" fill="rgba(52,211,153,.08)" stroke="rgba(52,211,153,.3)" stroke-dasharray="3 4"/>
    <text x="2" y="${y(mx) + 4}">${mx}</text><text x="2" y="${y(mn)}">${mn}</text>
    ${days.map((d, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${d}</text>`).join('')}
    <path d="${area}" fill="url(#ga)"/>
    <path d="${path}" fill="none" stroke="${M.color}" stroke-width="2.5" stroke-linejoin="round" class="cline"/>
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#07130b" stroke="${M.color}" stroke-width="2"><title>${days[i]} : ${M.data[i]} ${M.unit}</title></circle>`).join('')}`;
  const line = $('.cline', svg), len = line.getTotalLength();
  line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
  line.getBoundingClientRect();
  line.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)'; line.style.strokeDashoffset = 0;
  $('#chartNote').textContent = M.note;
}
$$('#metricSeg button').forEach(b => b.addEventListener('click', () => { $$('#metricSeg button').forEach(x => x.setAttribute('aria-pressed', x === b)); drawChart(b.dataset.m); }));

/* ---------- PLANT LIBRARY ---------- */
const PLANTS = [
  { n: 'Monstera deliciosa', l: 'Monstera deliciosa', i: 'ph-leaf', d: 'Facile', light: 'Indirecte', w: '1×/semaine', hum: '60 %', t: '18–27 °C', pet: false, soil: [50, 80], tip: "Laissez sécher les 3 premiers centimètres de terreau entre deux arrosages. Elle adore un tuteur en mousse pour grimper." },
  { n: 'Pothos', l: 'Epipremnum aureum', i: 'ph-leaf', d: 'Facile', light: 'Faible', w: '1×/semaine', hum: '50 %', t: '15–29 °C', pet: false, soil: [40, 70], tip: "Idéal pour débuter : il tolère la pénombre et signale la soif en ramollissant ses feuilles." },
  { n: 'Sansevieria', l: 'Dracaena trifasciata', i: 'ph-plant', d: 'Facile', light: 'Faible', w: '1×/3 semaines', hum: '40 %', t: '15–29 °C', pet: false, soil: [10, 35], tip: "Le pire ennemi de la langue de belle-mère, c'est l'excès d'eau. En hiver, un arrosage par mois suffit." },
  { n: 'Zamioculcas', l: 'Zamioculcas zamiifolia', i: 'ph-plant', d: 'Facile', light: 'Faible', w: '1×/2 semaines', hum: '40 %', t: '16–26 °C', pet: false, soil: [15, 40], tip: "Ses rhizomes stockent l'eau : il supporte l'oubli bien mieux que l'arrosage excessif." },
  { n: 'Pilea', l: 'Pilea peperomioides', i: 'ph-leaf', d: 'Facile', light: 'Indirecte', w: '1×/semaine', hum: '50 %', t: '15–25 °C', pet: true, soil: [35, 60], tip: "Tournez le pot d'un quart de tour chaque semaine pour garder une forme symétrique." },
  { n: 'Chlorophytum', l: 'Chlorophytum comosum', i: 'ph-plant', d: 'Facile', light: 'Indirecte', w: '1×/semaine', hum: '50 %', t: '13–27 °C', pet: true, soil: [40, 70], tip: "La plante araignée produit des rejets faciles à bouturer dans un verre d'eau." },
  { n: 'Calathea', l: 'Goeppertia orbifolia', i: 'ph-leaf', d: 'Exigeante', light: 'Indirecte', w: '2×/semaine', hum: '70 %', t: '18–26 °C', pet: true, soil: [60, 85], tip: "Elle préfère une eau peu calcaire et une humidité ambiante élevée. Pas de soleil direct sur ses feuilles." },
  { n: 'Ficus lyrata', l: 'Ficus lyrata', i: 'ph-tree', d: 'Modérée', light: 'Directe', w: '1×/semaine', hum: '50 %', t: '16–26 °C', pet: false, soil: [40, 65], tip: "Il déteste être déplacé : trouvez-lui une place lumineuse et n'y touchez plus." },
  { n: 'Fougère de Boston', l: 'Nephrolepis exaltata', i: 'ph-plant', d: 'Exigeante', light: 'Indirecte', w: '3×/semaine', hum: '75 %', t: '16–24 °C', pet: true, soil: [65, 95], tip: "Le terreau ne doit jamais sécher complètement. Parfaite pour une salle de bains lumineuse." },
  { n: 'Orchidée', l: 'Phalaenopsis', i: 'ph-flower-lotus', d: 'Modérée', light: 'Indirecte', w: '1×/10 jours', hum: '60 %', t: '18–28 °C', pet: true, soil: [35, 60], tip: "Arrosez quand les racines deviennent argentées. Une baisse de température la nuit favorise la floraison." },
  { n: 'Aloe vera', l: 'Aloe barbadensis', i: 'ph-plant', d: 'Facile', light: 'Directe', w: '1×/3 semaines', hum: '30 %', t: '13–27 °C', pet: false, soil: [10, 30], tip: "Un substrat très drainant et un maximum de soleil. Ses feuilles s'affinent si elle manque d'eau." },
  { n: 'Cactus', l: 'Echinocactus grusonii', i: 'ph-cactus', d: 'Facile', light: 'Directe', w: '1×/mois', hum: '30 %', t: '10–30 °C', pet: true, soil: [5, 25], tip: "Repos hivernal au frais et presque sans eau : c'est ce qui déclenche la floraison au printemps." },
  { n: 'Spathiphyllum', l: 'Spathiphyllum wallisii', i: 'ph-flower', d: 'Modérée', light: 'Faible', w: '1×/semaine', hum: '60 %', t: '18–27 °C', pet: false, soil: [50, 75], tip: "La fleur de lune s'affaisse spectaculairement quand elle a soif… et se redresse en quelques heures." },
  { n: 'Alocasia', l: 'Alocasia amazonica', i: 'ph-leaf', d: 'Exigeante', light: 'Indirecte', w: '2×/semaine', hum: '70 %', t: '18–28 °C', pet: false, soil: [55, 80], tip: "Sensible au froid et aux courants d'air. Elle peut entrer en dormance en hiver : réduisez alors l'eau." }
];
const F = { q: '', d: 'all', light: 'all', pet: false };
const grid = $('#plantsGrid'), count = $('#count');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderPlants() {
  const res = PLANTS.filter(p => (F.d === 'all' || p.d === F.d) && (F.light === 'all' || p.light === F.light) && (!F.pet || p.pet) && (!F.q || norm(p.n + ' ' + p.l).includes(norm(F.q))));
  count.textContent = `${res.length} profil${res.length > 1 ? 's' : ''} affiché${res.length > 1 ? 's' : ''} sur ${PLANTS.length}`;
  grid.innerHTML = res.length ? res.map((p, i) => `
    <button class="pl" data-i="${PLANTS.indexOf(p)}" style="animation-delay:${i * 40}ms">
      <div class="pl__top"><span class="pl__glyph"><i class="ph ${p.i}"></i></span><span class="diff diff--${p.d}">${p.d}</span></div>
      <div><h3>${p.n}</h3><em>${p.l}</em></div>
      <div class="pl__needs">
        <div><i class="ph ph-sun" style="color:#facc15"></i>Lumière<b>${p.light}</b></div>
        <div><i class="ph ph-drop" style="color:#60a5fa"></i>Eau<b>${p.w}</b></div>
        <div><i class="ph ph-cloud" style="color:#7dd3fc"></i>Air<b>${p.hum}</b></div>
      </div>
      <span class="pl__more">Voir les réglages Aura <i class="ph ph-arrow-right"></i></span>
    </button>`).join('') : `<div class="empty"><i class="ph ph-plant"></i>Aucune plante ne correspond à ces filtres.<br><button class="link" id="clearF" style="margin-top:.6rem">Réinitialiser les filtres</button></div>`;
  $$('.pl', grid).forEach(b => b.addEventListener('click', () => openPlant(PLANTS[+b.dataset.i])));
  const c = $('#clearF'); if (c) c.addEventListener('click', clearFilters);
}
function chipGroup(id, key) {
  $$('#' + id + ' .fchip').forEach(b => b.addEventListener('click', () => {
    F[key] = b.dataset.v; $$('#' + id + ' .fchip').forEach(x => x.setAttribute('aria-pressed', x === b)); renderPlants();
  }));
}
chipGroup('fDiff', 'd'); chipGroup('fLight', 'light');
$('#q').addEventListener('input', e => { F.q = e.target.value.trim(); renderPlants(); });
$('#fPet').addEventListener('change', e => { F.pet = e.target.checked; renderPlants(); });
function clearFilters() {
  F.q = ''; F.d = 'all'; F.light = 'all'; F.pet = false; $('#q').value = ''; $('#fPet').checked = false;
  ['fDiff', 'fLight'].forEach(id => $$('#' + id + ' .fchip').forEach((x, i) => x.setAttribute('aria-pressed', i === 0)));
  renderPlants();
}
renderPlants();

const modal = $('#plantModal');
function openPlant(p) {
  $('#modalBody').innerHTML = `
    <span class="diff diff--${p.d}">${p.d}</span>
    <h3>${p.n}</h3><em>${p.l}</em>
    <p class="tip">${p.tip}</p>
    <div class="mgrid">
      <div>Lumière<b>${p.light}</b></div><div>Arrosage<b>${p.w}</b></div>
      <div>Humidité de l'air<b>${p.hum}</b></div><div>Température<b>${p.t}</b></div>
      <div>Animaux<b>${p.pet ? 'Sans danger' : 'Toxique si ingérée'}</b></div><div>Taille Aura conseillée<b>${p.soil[0] < 30 ? 'Mini' : p.n.includes('Ficus') || p.n.includes('Monstera') ? 'Grand' : 'Original'}</b></div>
    </div>
    <div class="aura-set">
      <h4>Réglage Aura · humidité du sol</h4>
      <div class="track"><div class="band" style="left:${p.soil[0]}%;width:${p.soil[1] - p.soil[0]}%"></div><div class="fill fill--water" style="width:${(p.soil[0] + p.soil[1]) / 2}%"></div></div>
      <p style="font-size:.85rem;color:#9ca3af">Aura maintient le terreau entre <b style="color:#fff">${p.soil[0]} %</b> et <b style="color:#fff">${p.soil[1]} %</b>, et ajuste selon la saison.</p>
    </div>`;
  modal.showModal();
}
$('#modalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

/* ---------- VACATION ---------- */
const vd = $('#vacDays'), vp = $('#vacPlant'), vs = $('#vacSize'), vv = $('#vacVerdict');
function vac() {
  const days = +vd.value, ml = +vp.value * 10, cap = +vs.value * 1000;
  // ml/jour approximatif par taille : petit pot consomme moins
  const factor = { '0.6': .55, '1.2': 1, '2.5': 1.9 }[vs.value];
  const daily = ml * factor, need = daily * days, auton = Math.floor(cap / daily);
  $('#vacDaysOut').textContent = days + ' jours';
  const ok = auton >= days;
  vv.className = 'vac__verdict ' + (ok ? 'ok' : 'ko');
  vv.innerHTML = ok
    ? `<i class="ph-fill ph-check-circle"></i><div><b>C'est bon !</b> Besoin estimé : ${(need / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L. Autonomie : environ ${Math.min(auton, 60)} jours.</div>`
    : `<i class="ph-fill ph-warning-circle"></i><div><b>Réservoir un peu juste.</b> Autonomie d'environ ${auton} jours : passez à une taille au-dessus ou demandez à un proche un remplissage.</div>`;
}
[vd, vp, vs].forEach(el => el.addEventListener('input', vac)); vac();

/* ---------- CONFIGURATOR ---------- */
const SIZES = [
  { id: 'mini', n: 'Mini', d: 'Ø 14 cm · 0,6 L', p: 89 },
  { id: 'original', n: 'Original', d: 'Ø 20 cm · 1,2 L', p: 129 },
  { id: 'grand', n: 'Grand', d: 'Ø 28 cm · 2,5 L', p: 179 }
];
let cfg = { size: 'original', color: 'craie', colorName: 'Craie', qty: 1, caps: false };
$('#sizes').innerHTML = SIZES.map(s => `<button type="button" class="size" data-s="${s.id}" aria-pressed="${s.id === cfg.size}"><b>${s.n}</b><small>${s.d}</small><span>${s.p} €</span></button>`).join('');
$$('.size').forEach(b => b.addEventListener('click', () => { cfg.size = b.dataset.s; $$('.size').forEach(x => x.setAttribute('aria-pressed', x === b)); price(); }));
const cfgImg = $('#cfgImg');
$$('.sw').forEach(b => b.addEventListener('click', () => {
  cfg.color = b.dataset.c; cfg.colorName = b.dataset.n;
  $$('.sw').forEach(x => x.setAttribute('aria-pressed', x === b));
  $('#colorName').textContent = b.dataset.n;
  cfgImg.classList.add('swap');
  setTimeout(() => { cfgImg.src = `./assets/pot-${cfg.color}.webp`; cfgImg.alt = 'Aura teinte ' + b.dataset.n; cfgImg.onload = () => cfgImg.classList.remove('swap'); }, 220);
}));
['craie', 'sauge', 'charbon'].forEach(c => { const i = new Image(); i.src = `./assets/pot-${c}.webp`; });
$('#qMinus').addEventListener('click', () => { cfg.qty = Math.max(1, cfg.qty - 1); price(); });
$('#qPlus').addEventListener('click', () => { cfg.qty = Math.min(10, cfg.qty + 1); price(); });
$('#caps').addEventListener('change', e => { cfg.caps = e.target.checked; price(); });
const eur = v => v.toLocaleString('fr-FR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
function price() {
  const s = SIZES.find(x => x.id === cfg.size);
  let total = s.p * cfg.qty, note = '';
  if (cfg.qty >= 3) { total *= .85; note = 'Remise Trio appliquée : −15 % dès 3 pots.'; }
  else if (cfg.qty === 2) note = 'Ajoutez un pot pour profiter de −15 %.';
  if (cfg.caps) note += (note ? ' ' : '') + 'Capsules : 4,90 €/mois à partir de la livraison.';
  $('#qty').textContent = cfg.qty;
  $('#total').textContent = eur(Math.round(total * 100) / 100);
  $('#deposit').textContent = eur(19 * cfg.qty);
  $('#discountNote').textContent = note;
  return total;
}
price();
const form = $('#orderForm'), err = $('#formErr');
form.addEventListener('submit', e => {
  e.preventDefault();
  const fn = $('#fname'), em = $('#email');
  fn.classList.toggle('invalid', !fn.value.trim());
  const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
  em.classList.toggle('invalid', !okMail);
  if (!fn.value.trim()) { err.textContent = 'Indiquez votre prénom.'; fn.focus(); return; }
  if (!okMail) { err.textContent = 'Cette adresse e-mail ne semble pas valide.'; em.focus(); return; }
  err.textContent = '';
  const s = SIZES.find(x => x.id === cfg.size);
  $('#sName').textContent = fn.value.trim();
  $('#sDetail').textContent = `${cfg.qty} × Aura ${s.n} teinte ${cfg.colorName}${cfg.caps ? ' + capsules nutritives' : ''}. Un e-mail de confirmation sera envoyé à ${em.value.trim()}. Livraison estimée au printemps 2027.`;
  $('#sRef').textContent = 'AURA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  form.hidden = true; $('.config__visual').hidden = true; $('#success').hidden = false;
  $('#success').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
});
$('#again').addEventListener('click', () => { form.reset(); cfg.qty = 1; cfg.caps = false; price(); form.hidden = false; $('.config__visual').hidden = false; $('#success').hidden = true; });

/* ---------- FAQ (one open at a time) ---------- */
$$('#faqList details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('#faqList details').forEach(o => { if (o !== d) o.open = false; }); }));

/* ---------- NEWSLETTER ---------- */
$('#news').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#newsEmail').value.trim(), m = $('#newsMsg');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { m.style.color = '#f87171'; m.textContent = 'Adresse e-mail invalide.'; return; }
  m.style.color = ''; m.textContent = 'Merci, vous recevrez nos nouvelles botaniques.'; e.target.reset();
});
})();
