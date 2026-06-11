const PAL = [
  ["#1e3a5f","#c8f04a"], ["#1a3d2e","#a3e635"], ["#3d1f1f","#fca5a5"],
  ["#2d1f3d","#c084fc"], ["#3d2e00","#fcd34d"], ["#1f2d3d","#7dd3fc"],
  ["#2d2000","#fdba74"], ["#1f3d35","#5eead4"], ["#3d1f35","#f9a8d4"],
  ["#1f1f3d","#a5b4fc"], ["#2d1a00","#fbbf24"], ["#003d2d","#6ee7b7"],
];

function paletteFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % PAL.length;
  return PAL[Math.abs(h)];
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function avatar(person, size) {
  const [bg, fg] = paletteFor(person.name);
  const fs = size > 55 ? 24 : 14;
  const inner = person.photo
    ? `<img src="${person.photo}" alt="${person.name}" style="width:100%;height:100%;object-fit:cover;">`
    : `<span style="color:${fg};font-size:${fs}px;font-weight:600;">${initials(person.name)}</span>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;overflow:hidden;background:${bg};display:flex;align-items:center;justify-content:center;">${inner}</div>`;
}

function stackBadges(stack) {
  const labels = { aws: 'AWS', snowflake: 'Snowflake', databricks: 'Databricks', gcp: 'GCP' };
  return Object.keys(labels).map(k =>
    `<span class="sb${stack[k] ? ' on' : ''}">${labels[k]}</span>`
  ).join('');
}

// ── Routing ──────────────────────────────────────────────────────────────────

function go(id) {
  window.location.href = '?id=' + id;
}

function currentId() {
  return parseInt(new URLSearchParams(window.location.search).get('id') || '', 10);
}

function navigate(delta) {
  go((currentId() + delta + PEOPLE.length) % PEOPLE.length);
}

// ── Overview ─────────────────────────────────────────────────────────────────

const byCompany = (a, b) => a.company.localeCompare(b.company);

let filteredList = PEOPLE.slice().sort(byCompany);

function applyFilter(key, btn) {
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  filteredList = (key === 'all' ? PEOPLE.slice() : PEOPLE.filter(p => p[key])).sort(byCompany);
  renderOverview();
}

function truncate(text, wordLimit) {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '…';
}

function renderOverview() {
  document.getElementById('og').innerHTML = filteredList.map(person => {
    const id = PEOPLE.indexOf(person);
    const snippet = truncate(person.aiInitiatives, 20);
    return `
      <div class="oc${person.rel ? ' rel' : ''}" onclick="go(${id})">
        <div class="otop">
          ${avatar(person, 44)}
          <div class="onb">
            <div class="oname">${person.name}</div>
            <div class="oco">${person.company}</div>
          </div>
        </div>
        <div class="otit">${person.title}</div>
        <div class="sbadges">${stackBadges(person.stack || {})}</div>
        ${snippet ? `<div class="oai"><div class="oail">AI &amp; Governance</div>${snippet}</div>` : ''}
      </div>`;
  }).join('');
}

// ── Detail ────────────────────────────────────────────────────────────────────

function renderDetail(id) {
  const person = PEOPLE[id];
  document.title = `${person.name} — Bedrock SF Brief`;

  const pronoun = person.pronoun || 'he';
  const heShe = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const badges = [
    person.rel ? '<span class="brel">Existing Rel</span>' : '',
    person.mit ? '<span class="bmit">MIT</span>'         : '',
  ].join('');

  const relBanner = person.rel
    ? `<div class="relbanner"><b>★ Existing Relationship</b>${person.relNote ? ' — ' + person.relNote : ''}</div>`
    : '';

  const stats = [
    person.employees ? `${person.employees} employees` : '',
    person.revenue   ? `${person.revenue} revenue`     : '',
  ].filter(Boolean).join(' · ');

  const section = (title, html) =>
    `<div class="sec"><div class="stit">${title}</div>${html}</div>`;

  const bullets = arr =>
    `<ul class="bl">${arr.map(b => `<li>${b}</li>`).join('')}</ul>`;

  const prose = text =>
    text.split('\n\n').map(p => `<p class="dprosa">${p}</p>`).join('');

  const whoSection = person.whoTheyAre?.length
    ? section(`Who ${heShe} Is`, bullets(person.whoTheyAre)) : '';

  const aiSection = person.aiInitiatives
    ? section('AI, Governance &amp; Data Initiatives', `<div class="aibox">${prose(person.aiInitiatives)}</div>`) : '';

  const worldSection = person.worldRightNow
    ? section('Their World Right Now', `<div class="worldbox">${prose(person.worldRightNow)}</div>`) : '';

  const painSection = person.painPoints?.length
    ? section('Their Likely Pain Points', bullets(person.painPoints)) : '';

  document.getElementById('db').innerHTML = relBanner + `
    <div class="ch">
      ${avatar(person, 72)}
      <div class="di">
        <div class="dn">${person.name}</div>
        <div class="dt">${person.title}</div>
        <div class="dc">${person.company}</div>
        <div class="dbadges">${badges}${stackBadges(person.stack || {})}</div>
        ${stats ? `<div class="cstats">${stats}</div>` : ''}
        ${person.li ? `<a class="lil" href="${person.li}" target="_blank">LinkedIn ↗</a>` : ''}
      </div>
    </div>
    ${whoSection}${aiSection}${worldSection}${painSection}`;

  document.getElementById('np').textContent = `${id + 1} of ${PEOPLE.length}`;

  document.getElementById('dd').innerHTML = PEOPLE.map((_, i) =>
    `<div class="dot${i === id ? ' on' : ''}" onclick="go(${i})"></div>`
  ).join('');
}

// ── Swipe (mobile) ───────────────────────────────────────────────────────────

(function () {
  let startX = 0;
  const THRESHOLD = 50;
  const el = document.getElementById('dv');
  el.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < THRESHOLD) return;
    navigate(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// ── Init ──────────────────────────────────────────────────────────────────────

const idParam = new URLSearchParams(window.location.search).get('id');

if (idParam !== null && PEOPLE[+idParam]) {
  document.getElementById('ov').style.display   = 'none';
  document.getElementById('fbar').style.display = 'none';
  document.getElementById('dv').style.display   = 'block';
  renderDetail(+idParam);
} else {
  document.getElementById('dv').style.display = 'none';
  renderOverview();
}
