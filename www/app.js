const D = document, $ = s => D.querySelector(s);
let S = JSON.parse(localStorage.getItem('dj') || 'null') ||
  { tasks: [], font: 'newsreader', n: 0, welcomed: 0, rest: '', force: 'auto', notif: 0 };
const save = () => localStorage.setItem('dj', JSON.stringify(S));
const FONTS = [
  { id: 'newsreader', name: 'Newsreader', kind: 'Serif', fam: 'Newsreader', body: 'Hanken Grotesk', fb: 'Georgia,serif', r: 14, s: 1 },
  { id: 'hanken', name: 'Hanken Grotesk', kind: 'Grotesque', fam: 'Hanken Grotesk', fb: 'sans-serif', r: 8, s: 1 },
  { id: 'nunito', name: 'Nunito', kind: 'Rounded', fam: 'Nunito', fb: 'sans-serif', r: 26, s: 1 },
  { id: 'space', name: 'Space Mono', kind: 'Mono', fam: 'Space Mono', fb: 'monospace', r: 3, s: .92 },
  { id: 'caveat', name: 'Caveat', kind: 'Handwritten', fam: 'Caveat', fb: 'cursive', r: 20, s: 1.18 }
];
const CLOSE = 48 * 36e5, now = Date.now, day = t => new Date(t).toDateString();
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const act = () => S.tasks.filter(t => !t.done).sort((a, b) => a.due - b.due);
const close = () => act().filter(t => t.due - now() < CLOSE);
// 1 no tasks, 2 pending/plenty of time, 3 deadline close, 4 rest (done today, nothing close)
const state = () => S.force !== 'auto' ? +S.force : close().length ? 3 : S.rest === day(now()) ? 4 : act().length ? 2 : 1;
const p = n => String(n).padStart(2, '0');
const dhm = ms => { const m = Math.floor(Math.max(0, ms) / 6e4); return [Math.floor(m / 1440), Math.floor(m % 1440 / 60), m % 60]; };
const left = ms => { if (ms <= 0) return 'Overdue'; const [d, h, m] = dhm(ms); return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`; };
const when = t => new Date(t).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ICON = { today: '<path d="M5 4h14v16H5zM5 9h14"/>', goals: '<path d="M4 7h16M4 12h16M4 17h10"/>', set: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>' };
const ic = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${ICON[k]}</svg>`;
const row = t => `<div class="row" data-a="go" data-v="detail" data-id="${t.id}"><div><small>${esc(t.cat)}</small><h3>${esc(t.title)}</h3></div><span class="chip ${t.due - now() < CLOSE ? 'hot' : ''}">${left(t.due - now())}</span></div>`;
let V = { n: 'today' };

const views = {
  welcome: () => `<section class="hero c"><h1>DJ</h1><p>Your goals and long-term events, watched over quietly. Allow notifications so DJ can remind you before deadlines, even when the app is closed.</p><button class="btn" data-a="perm">Allow notifications</button><button class="lnk" data-a="skip">Not now</button></section>`,
  today: () => {
    const s = state(), a = act(), c = close();
    if (s === 1) return `<h1>Nothing on your plate.</h1><p class="mut">Add a goal or event and DJ will keep watch.</p><button class="btn" data-a="go" data-v="add">Add a goal or event</button>`;
    if (s === 2) return `<h1>Do these now.</h1><p class="mut">Starting early keeps later lighter.</p>${a.slice(0, 5).map(row).join('')}<button class="fab" data-a="go" data-v="add">+</button>`;
    if (s === 3) {
      const t = c[0] || a[0]; if (!t) return '<h1>Countdown</h1><p class="mut">Preview needs a task.</p>';
      const [d, h, m] = dhm(t.due - now());
      return `<section class="hero"><small>${esc(t.cat)} · nearest deadline</small><h2>${esc(t.title)}</h2><div class="cd"><div>${p(d)}<small>days</small></div><div>${p(h)}<small>hours</small></div><div>${p(m)}<small>min</small></div></div><button class="btn" data-a="go" data-v="detail" data-id="${t.id}">Start now →</button></section>${(c.length ? c : a).slice(1, 6).map(row).join('')}<button class="fab" data-a="go" data-v="add">+</button>`;
    }
    const n = a[0];
    return `<h1>All clear nearby.</h1><p class="mut">Relax for the rest of the day.</p>${n ? `<div class="row"><div><small>Coming up</small><h3>${esc(n.title)}</h3></div><span class="chip">${left(n.due - now())}</span></div>` : ''}`;
  },
  goals: () => {
    const a = act(), d = S.tasks.filter(t => t.done);
    return `<h1>All goals</h1>${a.length ? a.map(row).join('') : '<p class="mut">No active goals.</p>'}${d.length ? `<h3 class="sec">Done</h3>${d.map(t => `<div class="row dn"><h3>${esc(t.title)}</h3><span class="chip">✓</span></div>`).join('')}` : ''}<button class="fab" data-a="go" data-v="add">+</button>`;
  },
  add: () => `<button class="lnk" data-a="go" data-v="today">← Back</button><h1>New goal or event</h1><label>Title<input id="ti"></label><label>Category<select id="ca">${['Study', 'Career', 'Personal', 'Health', 'Other'].map(c => `<option>${c}</option>`).join('')}</select></label><label>Deadline<input id="du" type="datetime-local"></label><label>Notes<textarea id="no" rows="3"></textarea></label><label class="tg"><input id="rm" type="checkbox" checked> Remind me</label><button class="btn" data-a="save">Save</button>`,
  detail: () => {
    const t = S.tasks.find(x => x.id === V.id); if (!t) return '';
    const pc = Math.min(100, Math.max(0, (now() - t.created) / (t.due - t.created) * 100));
    return `<button class="lnk" data-a="go" data-v="today">← Back</button><small>${esc(t.cat)}</small><h1>${esc(t.title)}</h1><div class="hero"><small>${t.done ? 'Completed' : 'Time remaining'}</small><h2>${t.done ? '✓ Done' : left(t.due - now())}</h2><div class="bar"><i style="width:${t.done ? 100 : pc}%"></i></div><small>Due ${when(t.due)}</small></div>${t.notes ? `<p>${esc(t.notes)}</p>` : ''}${t.done ? '' : `<button class="btn" data-a="done" data-id="${t.id}">Mark complete</button>`}<button class="lnk" data-a="del" data-id="${t.id}">Delete</button>`;
  },
  settings: () => `<h1>Settings</h1><h3 class="sec">Font</h3>${FONTS.map(f => `<div class="row ${f.id === S.font ? 'sel' : ''}" data-a="font" data-v="${f.id}" style="font-family:'${f.fam}',${f.fb}"><div><small>${f.kind}</small><h3>${f.name}</h3><span>Small steps, finished on time.</span></div></div>`).join('')}<h3 class="sec">Notifications</h3><button class="btn" data-a="perm">${S.notif ? 'Notifications on ✓' : 'Allow notifications'}</button><h3 class="sec">Theme</h3><select id="fo">${[['auto', 'Automatic'], [1, 'Preview: No tasks'], [2, 'Preview: Ahead'], [3, 'Preview: Countdown'], [4, 'Preview: Rest']].map(([v, n]) => `<option value="${v}" ${String(S.force) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select>`
};

function applyFont() {
  const f = FONTS.find(x => x.id === S.font) || FONTS[0], st = D.body.style;
  st.setProperty('--f', `'${f.fam}',${f.fb}`); st.setProperty('--fb', `'${f.body || f.fam}',${f.fb}`);
  st.setProperty('--r', f.r + 'px'); st.setProperty('--fs', f.s);
}
function render() {
  D.body.dataset.state = state(); applyFont();
  const v = S.welcomed ? V.n : 'welcome';
  $('#app').innerHTML = views[v]();
  $('#nav').innerHTML = ['today', 'goals', 'settings'].includes(v)
    ? [['today', 'Today'], ['goals', 'Goals'], ['settings', 'Settings']].map(([k, n]) => `<a data-a="go" data-v="${k}" class="${v === k ? 'on' : ''}">${ic(k === 'settings' ? 'set' : k)}${n}</a>`).join('') : '';
}

const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
async function perm() {
  const L = LN(); if (!L) { alert('Notifications work in the installed Android app.'); return; }
  try { S.notif = (await L.requestPermissions()).display === 'granted' ? 1 : 0; } catch (e) { S.notif = 0; }
}
async function sched() {
  const L = LN(); if (!L || !S.notif) return;
  try {
    const pend = await L.getPending();
    if (pend.notifications.length) await L.cancel({ notifications: pend.notifications });
    const out = [{ id: 1, title: 'DJ-task manager', body: 'Check what needs you today.', schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true } }];
    act().filter(t => t.rm).forEach(t => [[864e5, 'tomorrow'], [36e5, 'in 1 hour'], [0, 'now']].forEach(([o, w], i) => {
      const at = t.due - o; if (at > now()) out.push({ id: t.id * 10 + i + 10, title: t.title, body: 'Due ' + w, schedule: { at: new Date(at), allowWhileIdle: true } });
    }));
    await L.schedule({ notifications: out });
  } catch (e) { }
}

D.addEventListener('click', async e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const { a, v, id } = el.dataset;
  if (a === 'go') V = { n: v, id: +id };
  else if (a === 'font') S.font = v;
  else if (a === 'skip') S.welcomed = 1;
  else if (a === 'perm') { await perm(); S.welcomed = 1; }
  else if (a === 'done') {
    const t = S.tasks.find(x => x.id == id); t.done = 1; t.doneAt = now();
    if (!close().length) S.rest = day(now()); // nothing close left: rest for the day
    V = { n: 'today' };
  } else if (a === 'del') { S.tasks = S.tasks.filter(x => x.id != id); V = { n: 'today' }; }
  else if (a === 'save') {
    const ti = $('#ti').value.trim(), du = new Date($('#du').value).getTime();
    if (!ti || isNaN(du)) return alert('Add a title and a deadline.');
    S.tasks.push({ id: ++S.n, title: ti, cat: $('#ca').value, due: du, notes: $('#no').value, rm: $('#rm').checked, created: now() });
    V = { n: 'today' };
  }
  save(); if (['save', 'done', 'del', 'perm'].includes(a)) sched(); render();
});
D.addEventListener('change', e => { if (e.target.id === 'fo') { S.force = e.target.value; save(); render(); } });
setInterval(() => { if (S.welcomed && ['today', 'goals', 'detail'].includes(V.n)) render(); }, 30000);
D.addEventListener('visibilitychange', () => { if (!D.hidden && ['today', 'goals', 'detail'].includes(V.n)) render(); });
render(); sched();
