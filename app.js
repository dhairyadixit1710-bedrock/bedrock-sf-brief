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
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;overflow:hidden;background:${bg};display:flex;align-items:center;justify-content:center;">
    <span style="color:${fg};font-size:${fs}px;font-weight:600;">${initials(person.name)}</span>
  </div>`;
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

let filteredList = PEOPLE.slice();

function applyFilter(key, btn) {
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  filteredList = key === 'all' ? PEOPLE.slice() : PEOPLE.filter(p => p[key]);
  renderOverview();
}

function renderOverview() {
  document.getElementById('og').innerHTML = filteredList.map(person => {
    const id = PEOPLE.indexOf(person);
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
        ${person.ai ? `<div class="oai"><div class="oail">Talking Points</div>${person.ai}</div>` : ''}
      </div>`;
  }).join('');
}

// ── Detail ────────────────────────────────────────────────────────────────────

function renderDetail(id) {
  const person = PEOPLE[id];
  document.title = `${person.name} — Bedrock SF Brief`;

  const badges = [
    person.rel ? '<span class="brel">Existing Rel</span>' : '',
    person.mit ? '<span class="bmit">MIT</span>'         : '',
  ].join('');

  const relBanner = person.rel
    ? `<div class="relbanner"><b>★ Existing Relationship</b>${person.relNote ? ' — ' + person.relNote : ''}</div>`
    : '';

  const talkingPoints = person.ai
    ? `<div class="sec">
        <div class="stit">Talking Points</div>
        <div class="aibox"><div class="ail2">AI Insight</div>${person.ai}</div>
      </div>`
    : '';

  const background = person.background?.length
    ? `<div class="sec">
        <div class="stit">Background</div>
        <ul class="bl">${person.background.map(b => `<li>${b}</li>`).join('')}</ul>
      </div>`
    : '';

  const connections = person.connections?.length
    ? `<div class="sec">
        <div class="stit">Connections</div>
        ${person.connections.map(c => `
          <div class="cc">
            <div class="cw"><div class="cdot"></div>${c.who}</div>
            <div class="cy">${c.how}</div>
          </div>`).join('')}
      </div>`
    : '';

  document.getElementById('db').innerHTML = relBanner + `
    <div class="ch">
      ${avatar(person, 72)}
      <div class="di">
        <div class="dn">${person.name}</div>
        <div class="dt">${person.title}</div>
        <div class="dc">${person.company}</div>
        <div class="dbadges">${badges}${stackBadges(person.stack || {})}</div>
        ${person.li ? `<a class="lil" href="${person.li}" target="_blank">LinkedIn ↗</a>` : ''}
      </div>
    </div>
    ${talkingPoints}${background}${connections}`;

  document.getElementById('np').textContent = `${id + 1} of ${PEOPLE.length}`;

  document.getElementById('dd').innerHTML = PEOPLE.map((_, i) =>
    `<div class="dot${i === id ? ' on' : ''}" onclick="go(${i})"></div>`
  ).join('');
}

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
