import { COURSE } from '/content/index.js';
import { DIAGRAMS } from '/content/diagrams.js';

/* ---------- utils ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)} год ${m % 60 ? (m % 60) + ' хв' : ''}`.trim() : `${m} хв`;

/* ---------- theme ---------- */
const savedTheme = LS.get('theme', null);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
function toggleTheme() {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; LS.set('theme', next);
}

/* ---------- state & sync ---------- */
const state = {
  code: LS.get('code', null),
  progress: LS.get('progress', { lessons: {}, tasks: {}, quizzes: {}, notes: {}, meta: {} }),
  online: true,
  pending: LS.get('pending', []),
  tab: 'overview',
};
for (const k of ['lessons', 'tasks', 'quizzes', 'notes', 'meta']) state.progress[k] ||= {};

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(state.code ? { 'X-Course-Code': state.code } : {}) };
  const res = await fetch('/api' + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return data;
}
function persistLocal() { LS.set('progress', state.progress); LS.set('pending', state.pending); }
function applyPatch(patch) {
  for (const k of Object.keys(patch)) {
    state.progress[k] ||= {};
    Object.assign(state.progress[k], patch[k]);
    for (const id of Object.keys(patch[k])) if (patch[k][id] === null) delete state.progress[k][id];
  }
}
function normalize(p) { p ||= {}; for (const k of ['lessons', 'tasks', 'quizzes', 'notes', 'meta']) p[k] ||= {}; return p; }
async function flushPending() {
  if (!state.code || !state.pending.length) return;
  const merged = {};
  for (const p of state.pending) for (const k of Object.keys(p)) merged[k] = { ...(merged[k] || {}), ...p[k] };
  try {
    const r = await api('/progress', { method: 'PATCH', body: { progress: merged } });
    state.pending = []; state.progress = normalize(r.progress); state.online = true; persistLocal();
  } catch (e) { state.online = false; }
  renderSyncDot();
}
async function save(patch) { applyPatch(patch); state.pending.push(patch); persistLocal(); await flushPending(); }
async function login(code) {
  const r = await api('/session', { method: 'POST', body: { code } });
  state.code = code; LS.set('code', code);
  const server = normalize(r.progress); const local = state.progress; const merged = normalize({});
  for (const k of Object.keys(merged)) merged[k] = { ...local[k], ...server[k] };
  state.progress = merged; state.pending = [{ ...local }]; persistLocal();
  await flushPending();
}
async function createCode(custom) { const r = await api('/session/new', { method: 'POST', body: { code: custom || '' } }); await login(r.code); return r.code; }
function logout() { state.code = null; LS.del('code'); state.pending = []; persistLocal(); render(); }

/* ---------- course helpers ---------- */
const allLessons = COURSE.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })));
const lessonById = Object.fromEntries(allLessons.map((l) => [l.id, l]));
const moduleById = Object.fromEntries(COURSE.modules.map((m) => [m.id, m]));
const isDone = (id) => !!state.progress.lessons[id]?.done;
const moduleStats = (m) => { const d = m.lessons.filter((l) => isDone(l.id)).length; return { done: d, total: m.lessons.length, pct: Math.round((100 * d) / m.lessons.length), minutes: m.lessons.reduce((n, l) => n + l.minutes, 0) }; };
const courseStats = () => { const d = allLessons.filter((l) => isDone(l.id)).length; return { done: d, total: allLessons.length, pct: Math.round((100 * d) / allLessons.length) }; };
const totalMinutes = allLessons.reduce((n, l) => n + l.minutes, 0);
const taskCount = () => allLessons.reduce((n, l) => n + (l.tasks?.length || 0), 0);
const tasksDone = () => Object.values(state.progress.tasks).filter((t) => t?.done).length;
const nextLesson = () => allLessons.find((l) => !isDone(l.id));

/* ---------- markdown ---------- */
marked.setOptions({ gfm: true, breaks: false });
function renderMd(md) {
  let html = marked.parse(md || '');
  html = html.replace(/(?:<p>)?\[\[diagram:([\w-]+)(?:\|([^\]]*))?\]\](?:<\/p>)?/g, (_, id, cap) => {
    const svg = DIAGRAMS[id];
    if (!svg) return `<div class="callout warn"><b>Схема</b><p>Схему «${esc(id)}» не знайдено.</p></div>`;
    return `<figure class="diagram">${svg}${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
  });
  html = html.replace(/<p>:::(tip|warn|idea|note)\s*([^<]*)<\/p>([\s\S]*?)<p>:::<\/p>/g, (_, kind, title, body) => {
    const labels = { tip: 'Порада', warn: 'Увага', idea: 'Ідея', note: 'Нотатка' };
    return `<div class="callout ${kind}"><b>${esc(title || labels[kind])}</b>${body}</div>`;
  });
  return html;
}

/* ---------- shared pieces ---------- */
function topbar({ title, sub, backHref, tab } = {}) {
  const cs = courseStats();
  return `<div class="topbar"><div class="in">
    ${backHref ? `<a class="back" href="${backHref}" aria-label="Назад">‹</a>` : `<a class="brand" href="#/">AI<b>Dev</b> Course</a>`}
    ${title ? `<div class="title">${esc(title)}${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>` : '<div class="title"></div>'}
    <nav class="nav">
      <a href="#/" class="${tab === 'home' ? 'active' : ''}">Курс</a>
      <a href="#/progress" class="${tab === 'progress' ? 'active' : ''}">Прогрес</a>
      <a href="#/sources" class="${tab === 'sources' ? 'active' : ''}">Джерела</a>
      <a href="#/account" class="${tab === 'account' ? 'active' : ''}">Код</a>
    </nav>
    <a class="ring" href="#/progress" style="--p:${cs.pct}" title="Прогрес курсу"><span>${cs.pct}%</span></a>
    <button class="theme" data-action="theme" aria-label="Перемкнути тему">◐</button>
  </div></div>`;
}

function lectureRow(l, idx, current) {
  return `<a class="lecture ${isDone(l.id) ? 'done' : ''} ${current ? 'current' : ''}" href="#/lesson/${l.id}">
    <div class="chk">✓</div><div class="ico">▶</div>
    <div class="t">${idx + 1}. ${esc(l.title)}<small>${(l.tasks || []).length} завд. · ${(l.quiz || []).length} пит.</small></div>
    <div class="dur">${l.minutes} хв</div></a>`;
}

function curriculum(openId, currentLessonId) {
  return `<div class="curr">${COURSE.modules.map((m, i) => { const s = moduleStats(m); return `
    <details class="section" ${m.id === openId ? 'open' : ''}>
      <summary><span class="chev">▼</span><div class="st"><b>Розділ ${i}: ${esc(m.title)}</b><span>${m.lessons.length} лекцій · ${fmtMin(s.minutes)}</span></div><div class="sp ${s.pct === 100 ? 'done' : ''}">${s.done}/${s.total}</div></summary>
      ${m.lessons.map((l, j) => lectureRow(l, j, l.id === currentLessonId)).join('')}
    </details>`; }).join('')}</div>`;
}

function continueCard() {
  const cs = courseStats(); const n = nextLesson();
  return `<div class="continue">
    <div class="lbl">${cs.done ? 'Продовжити навчання' : 'Почати навчання'}</div>
    ${n ? `<div class="name">${esc(n.title)}</div><div class="sub">Розділ ${COURSE.modules.indexOf(n.module)} · ${esc(n.module.title)} · ${n.minutes} хв</div>` : '<div class="name">Курс завершено 🎉</div><div class="sub">Час для капстоуну та плейбука.</div>'}
    <div class="progressbar ${cs.pct === 100 ? 'ok' : ''}"><i style="width:${cs.pct}%"></i></div>
    <div class="pct">${cs.pct}% завершено · ${cs.done}/${cs.total} лекцій · ${tasksDone()}/${taskCount()} завдань</div>
    <div style="margin-top:12px"><a class="btn primary block" href="#/lesson/${n ? n.id : allLessons[0].id}">${cs.done ? 'Продовжити' : 'Почати курс'}</a></div>
    ${!state.code ? `<div class="muted" style="margin-top:10px">Прогрес зберігається локально. <a href="#/account">Створи код</a>, щоб синхронізувати між пристроями.</div>` : ''}
  </div>`;
}

/* ---------- views ---------- */
function viewHome() {
  const n = nextLesson(); const cs = courseStats();
  return `${topbar({ tab: 'home' })}
  <div class="hero-band"><div class="wrap">
    <div class="crumbs">Розробка › ШІ-агенти › Інженерія</div>
    <h1>${esc(COURSE.title)}</h1>
    <p class="lead">${esc(COURSE.subtitle)}</p>
    <div class="rating"><span class="badge">АКТУАЛЬНО 2026</span><span class="stars">★★★★★</span><span>${COURSE.modules.length} розділів · ${allLessons.length} лекцій · ${taskCount()} завдань</span></div>
    <div class="meta"><span>Оновлено 09/2026</span><span>Українська</span><span>≈ ${fmtMin(totalMinutes)} теорії + практика</span></div>
    <div class="author">Автор: <a href="#/sources">за первинними джерелами Anthropic, OpenAI, GitHub, Cognition, LangChain, Thoughtworks…</a></div>
  </div></div>
  <div class="wrap landing">
    <div class="main">
      <div class="sec learn"><h2>Чого ви навчитеся</h2><ul>${COURSE.learn.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="sec"><h2>Зміст курсу</h2>
        <div class="curr-head"><span>${COURSE.modules.length} розділів · ${allLessons.length} лекцій · ≈ ${fmtMin(totalMinutes)}</span><span>${cs.done}/${cs.total} завершено</span></div>
        ${curriculum(n ? n.module.id : COURSE.modules[0].id)}
      </div>
      <div class="sec desc"><h2>Вимоги</h2><div class="md">${renderMd(COURSE.requirements)}</div></div>
      <div class="sec desc"><h2>Опис</h2><div class="md">${renderMd(COURSE.description)}</div></div>
      <div class="sec desc"><h2>Для кого цей курс</h2><div class="md">${renderMd(COURSE.audience)}</div></div>
      <div class="sec"><h2>Джерела</h2><div class="instructor"><div class="av">AI</div><div><b>Первинні матеріали 2025–2026</b><span>Інженерні пости Anthropic, OpenAI, Cognition, LangChain, Stripe, Thoughtworks; дослідження ETH Zürich, UC Berkeley, Google Research; документація Claude Code, Spec Kit, Kiro, OpenSpec; курси Anthropic Academy, DeepLearning.AI, Frontend Masters, Stanford CS146S. <a href="#/sources">Повний список →</a></span></div></div></div>
    </div>
    <aside class="side">${continueCard()}</aside>
  </div>`;
}

function viewModule(mid) {
  const m = moduleById[mid]; if (!m) return viewNotFound();
  const s = moduleStats(m); const idx = COURSE.modules.indexOf(m);
  return `${topbar({ title: `Розділ ${idx}`, sub: m.title, backHref: '#/', tab: 'home' })}
  <div class="wrap">
    <div class="section-hero"><div class="kicker">Розділ ${idx} · ${m.lessons.length} лекцій · ${fmtMin(s.minutes)}</div>
      <h1>${m.icon} ${esc(m.title)}</h1><p>${esc(m.subtitle)}</p>
      <div class="md">${renderMd(m.intro || '')}</div>
      <div class="progressbar ${s.pct === 100 ? 'ok' : ''}"><i style="width:${s.pct}%"></i></div>
      <div class="muted" style="margin:6px 0 14px">${s.done} з ${s.total} лекцій завершено</div>
    </div>
    <div class="curr"><details class="section" open><summary><span class="chev">▼</span><div class="st"><b>Лекції</b><span>${m.lessons.length} · ${fmtMin(s.minutes)}</span></div></summary>${m.lessons.map((l, j) => lectureRow(l, j)).join('')}</details></div>
    <div class="sec"><h2>Інші розділи</h2>${curriculum(null)}</div>
  </div>`;
}

function quizHtml(l, qi) {
  const q = l.quiz[qi]; const qid = `${l.id}-q${qi}`; const ans = state.progress.quizzes[qid];
  return `<div class="quiz" data-quiz="${qid}">
    <div class="q">${qi + 1}. ${esc(q.q)}</div>
    <div class="opts">${q.options.map((o, oi) => {
      let cls = '';
      if (ans != null) { if (oi === q.answer) cls = 'correct'; else if (oi === ans.picked) cls = 'wrong'; }
      return `<button class="opt ${cls}" data-action="quiz" data-qid="${qid}" data-li="${l.id}" data-qi="${qi}" data-oi="${oi}" ${ans != null ? 'disabled' : ''}>${esc(o)}</button>`;
    }).join('')}</div>
    ${ans != null ? `<div class="explain">${ans.picked === q.answer ? '✅ Правильно. ' : '❌ Неправильно. '}${esc(q.explain)}</div>` : ''}
  </div>`;
}

function taskHtml(t) {
  const p = state.progress.tasks[t.id] || {};
  return `<div class="task ${p.done ? 'done' : ''}" data-task="${t.id}">
    <div class="kind">${t.kind === 'reflect' ? 'Рефлексія' : t.kind === 'build' ? 'Практика · збудуй' : 'Практика'}</div>
    <h4>${esc(t.title)}</h4>
    <div class="md">${renderMd(t.md)}</div>
    <textarea placeholder="Твої нотатки, відповідь або посилання на результат…" data-answer="${t.id}">${esc(p.answer || '')}</textarea>
    <div class="actions">
      <button class="btn sm ${p.done ? 'ok' : 'primary'}" data-action="task-done" data-id="${t.id}">${p.done ? '✓ Виконано' : 'Позначити виконаним'}</button>
      <button class="btn sm ghost" data-action="task-save" data-id="${t.id}">Зберегти нотатки</button>
      <span class="saved">${p.ts ? 'збережено ' + new Date(p.ts).toLocaleDateString('uk-UA') : ''}</span>
    </div></div>`;
}

function viewLesson(lid) {
  const l = lessonById[lid]; if (!l) return viewNotFound();
  const m = l.module; const i = m.lessons.findIndex((x) => x.id === l.id); const mi = COURSE.modules.indexOf(m);
  const gi = allLessons.indexOf(lessonById[lid]);
  const prev = allLessons[gi - 1]; const next = allLessons[gi + 1];
  const done = isDone(l.id); const cs = courseStats();
  const tasks = l.tasks || []; const quiz = l.quiz || []; const sources = l.sources || [];
  const tDone = tasks.filter((t) => state.progress.tasks[t.id]?.done).length;
  const qDone = quiz.filter((_, qi) => state.progress.quizzes[`${l.id}-q${qi}`]).length;
  const tab = state.tab;
  const doneBtn = `<button class="done-toggle ${done ? 'on' : ''}" data-action="lesson-done" data-id="${l.id}"><span class="box">✓</span>${done ? 'Завершено' : 'Позначити як завершене'}</button>`;
  return `${topbar({ title: l.title, sub: `Розділ ${mi} · ${m.title}`, backHref: `#/module/${m.id}`, tab: 'home' })}
  <div class="player-bar"><div class="in"><span>Лекція ${gi + 1} з ${allLessons.length}</span><div class="progressbar"><i style="width:${cs.pct}%"></i></div><span>${cs.pct}%</span></div></div>
  <div class="wrap lesson-layout">
  <article class="lesson">
    <div class="kicker">Розділ ${mi} · Лекція ${i + 1}</div>
    <h1>${esc(l.title)}</h1>
    <div class="meta"><span>⏱ ${l.minutes} хв</span><span>${tasks.length} завдань</span><span>${quiz.length} питань</span></div>
    ${doneBtn}
    <div class="tabs" role="tablist">
      <button data-tab="overview" class="${tab === 'overview' ? 'active' : ''}">Огляд</button>
      ${tasks.length ? `<button data-tab="tasks" class="${tab === 'tasks' ? 'active' : ''}">Завдання<span class="n">${tDone}/${tasks.length}</span></button>` : ''}
      ${quiz.length ? `<button data-tab="quiz" class="${tab === 'quiz' ? 'active' : ''}">Тест<span class="n">${qDone}/${quiz.length}</span></button>` : ''}
      ${sources.length ? `<button data-tab="sources" class="${tab === 'sources' ? 'active' : ''}">Ресурси<span class="n">${sources.length}</span></button>` : ''}
    </div>
    <div class="pane ${tab === 'overview' ? 'active' : ''}" data-pane="overview"><div class="md">${renderMd(l.md)}</div>
      ${tasks.length ? `<div class="callout idea"><b>Далі</b><p>Виконай ${tasks.length} завдан${tasks.length === 1 ? 'ня' : 'ня'} у вкладці «Завдання» і пройди тест, потім познач лекцію завершеною.</p></div>` : ''}</div>
    <div class="pane ${tab === 'tasks' ? 'active' : ''}" data-pane="tasks">${tasks.map(taskHtml).join('') || '<div class="empty">Немає завдань</div>'}</div>
    <div class="pane ${tab === 'quiz' ? 'active' : ''}" data-pane="quiz">${quiz.map((_, qi) => quizHtml(l, qi)).join('') || '<div class="empty">Немає тесту</div>'}</div>
    <div class="pane ${tab === 'sources' ? 'active' : ''}" data-pane="sources"><ul class="sources">${sources.map((s) => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>${s.d ? `<small>${esc(s.d)}</small>` : ''}</li>`).join('')}</ul></div>
    <div class="complete-box"><button class="btn block ${done ? 'ok' : 'primary'}" data-action="lesson-done" data-id="${l.id}">${done ? '✓ Лекцію завершено (натисни, щоб скасувати)' : 'Завершити лекцію і продовжити'}</button></div>
    <div class="lesson-nav">
      ${prev ? `<a class="btn" href="#/lesson/${prev.id}">‹ Попередня</a>` : '<span></span>'}
      ${next ? `<a class="btn" href="#/lesson/${next.id}">Наступна ›</a>` : `<a class="btn" href="#/">До курсу</a>`}
    </div>
  </article>
  <aside class="lesson-side"><div class="sh">Зміст курсу</div>${curriculum(m.id, l.id)}</aside>
  </div>`;
}

function viewProgress() {
  const cs = courseStats();
  const quizzes = Object.values(state.progress.quizzes); const qOk = quizzes.filter((q) => q.correct).length;
  const started = state.progress.meta.started ? new Date(state.progress.meta.started).toLocaleDateString('uk-UA') : '—';
  const n = nextLesson();
  return `${topbar({ title: 'Мій прогрес', sub: state.code ? 'синхронізується з сервером' : 'локально в браузері', tab: 'progress' })}
  <div class="wrap">
    <div class="section-hero"><h1>Мій прогрес</h1>
      <div class="progressbar ${cs.pct === 100 ? 'ok' : ''}"><i style="width:${cs.pct}%"></i></div>
      <div class="pgrid">
        <div class="stat"><b>${cs.pct}%</b><span>курсу</span></div>
        <div class="stat"><b>${cs.done}/${cs.total}</b><span>лекцій</span></div>
        <div class="stat"><b>${tasksDone()}/${taskCount()}</b><span>завдань</span></div>
        <div class="stat"><b>${qOk}/${quizzes.length}</b><span>правильних відп.</span></div>
      </div>
      <div class="muted">Початок: ${started}</div>
    </div>
    ${continueCard()}
    <div class="sec"><h2>За розділами</h2><div class="plist">
      ${COURSE.modules.map((m, i) => { const s = moduleStats(m); return `<a class="prow" href="#/module/${m.id}"><b>${i}. ${esc(m.title)}</b><div class="progressbar ${s.pct === 100 ? 'ok' : ''}"><i style="width:${s.pct}%"></i></div><span>${s.done}/${s.total}</span></a>`; }).join('')}
    </div></div>
    <div class="sec"><h2>Експорт / імпорт</h2>
      <div class="row"><button class="btn" data-action="export">Експорт JSON</button><button class="btn" data-action="import">Імпорт JSON</button></div>
      <input type="file" id="importFile" accept="application/json" class="hidden"></div>
  </div>`;
}

function viewSources() {
  return `${topbar({ title: 'Джерела', sub: 'актуальні матеріали 2025–2026', tab: 'sources' })}
  <div class="wrap"><div class="section-hero"><h1>Джерела та зовнішні курси</h1><p>Первинні матеріали, на яких побудовано курс, і курси для поглиблення.</p></div>
  <div class="md">${renderMd(COURSE.sourcesMd)}</div></div>`;
}

function viewAccount() {
  return `${topbar({ title: 'Код доступу', sub: state.code ? 'увійшов' : 'не увійшов', tab: 'account' })}
  <div class="wrap"><div class="section-hero"><h1>Код доступу</h1><p>Без реєстрації: код — це твій ключ до прогресу. Збережи його, щоб продовжити на іншому пристрої.</p></div>
  ${state.code ? `
    <div class="card"><h3><span class="syncdot ${state.online ? 'on' : 'off'}" id="syncdot"></span>Твій код</h3>
      <div class="codebox">${esc(state.code)}</div>
      <p>${state.online ? 'Прогрес синхронізовано з сервером.' : 'Немає з’єднання — зміни збережено локально й буде надіслано пізніше.'}</p>
      <div class="row"><button class="btn" data-action="copy-code">Скопіювати</button><button class="btn ghost" data-action="logout">Вийти</button></div>
    </div>` : `
    <div class="card"><h3>Створити новий код</h3><p>Згенеруємо випадковий код. Або введи свій (мінімум 4 символи).</p>
      <input class="input" id="newCode" placeholder="свій код (необов’язково)" autocomplete="off">
      <div class="row" style="margin-top:8px"><button class="btn primary" data-action="create">Створити</button></div>
    </div>
    <div class="card"><h3>Увійти з кодом</h3><p>Якщо код уже є — введи його, і локальний прогрес об’єднається з серверним.</p>
      <input class="input" id="loginCode" placeholder="напр. k7pd-3mxw-q2rt" autocomplete="off" autocapitalize="none">
      <div class="row" style="margin-top:8px"><button class="btn primary" data-action="login">Увійти</button></div>
    </div>`}
  <div class="card"><h3>Про застосунок</h3><p>Прогрес зберігається у SQLite на сервері (Railway) і кешується в браузері. Код хешується — сервер не зберігає його відкритим. Не використовуй паролі від інших сервісів.</p></div></div>`;
}

const viewNotFound = () => `${topbar({ title: 'Не знайдено', backHref: '#/' })}<div class="wrap"><div class="empty">Сторінку не знайдено. <a href="#/">На головну</a></div></div>`;

/* ---------- router ---------- */
function route() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [_, a, b] = h.split('/');
  if (!a) return { view: viewHome(), tab: 'home' };
  if (a === 'module') return { view: viewModule(b), tab: 'home' };
  if (a === 'lesson') return { view: viewLesson(b), tab: 'home' };
  if (a === 'progress') return { view: viewProgress(), tab: 'progress' };
  if (a === 'sources') return { view: viewSources(), tab: 'sources' };
  if (a === 'account') return { view: viewAccount(), tab: 'account' };
  return { view: viewNotFound(), tab: '' };
}
let lastRoute = '';
function render(keepScroll = false) {
  const { view, tab } = route();
  const y = window.scrollY;
  app.innerHTML = view;
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  const r = location.hash.split('/').slice(0, 3).join('/');
  if (keepScroll || r === lastRoute) window.scrollTo({ top: y }); else window.scrollTo({ top: 0 });
  lastRoute = r;
}
function renderSyncDot() { const d = $('#syncdot'); if (d) d.className = `syncdot ${state.online ? 'on' : 'off'}`; }
function switchTab(name) {
  state.tab = name;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('active', p.dataset.pane === name));
}

/* ---------- actions ---------- */
app.addEventListener('click', async (e) => {
  const tb = e.target.closest('.tabs button'); if (tb) return switchTab(tb.dataset.tab);
  const btn = e.target.closest('[data-action]'); if (!btn) return;
  const act = btn.dataset.action; const id = btn.dataset.id;
  try {
    if (act === 'theme') toggleTheme();
    if (act === 'lesson-done') {
      const was = isDone(id);
      const patch = { lessons: { [id]: was ? null : { done: true, ts: Date.now() } } };
      if (!state.progress.meta.started) patch.meta = { started: Date.now() };
      await save(patch);
      const next = allLessons[allLessons.indexOf(lessonById[id]) + 1];
      if (!was && next && btn.classList.contains('btn')) { state.tab = 'overview'; location.hash = `#/lesson/${next.id}`; toast('Лекцію завершено ✓ Далі: ' + next.title); }
      else { render(true); toast(was ? 'Позначку знято' : 'Лекцію завершено ✓'); }
    }
    if (act === 'task-done' || act === 'task-save') {
      const ta = $(`[data-answer="${id}"]`); const cur = state.progress.tasks[id] || {};
      const done = act === 'task-done' ? !cur.done : !!cur.done;
      await save({ tasks: { [id]: { done, answer: ta?.value || '', ts: Date.now() } } });
      const el = $(`[data-task="${id}"]`); if (el) { el.classList.toggle('done', done); const b = $('[data-action="task-done"]', el); b.textContent = done ? '✓ Виконано' : 'Позначити виконаним'; b.className = `btn sm ${done ? 'ok' : 'primary'}`; $('.saved', el).textContent = 'збережено щойно'; }
      const lesson = lessonById[location.hash.split('/')[2]]; const n = $('.tabs button[data-tab="tasks"] .n');
      if (n && lesson?.tasks) n.textContent = `${lesson.tasks.filter((t) => state.progress.tasks[t.id]?.done).length}/${lesson.tasks.length}`;
      toast(act === 'task-done' ? (done ? 'Завдання виконано ✓' : 'Позначку знято') : 'Нотатки збережено');
    }
    if (act === 'quiz') {
      const { qid, li, qi, oi } = btn.dataset; const q = lessonById[li].quiz[+qi];
      await save({ quizzes: { [qid]: { picked: +oi, correct: +oi === q.answer, ts: Date.now() } } });
      const el = $(`[data-quiz="${qid}"]`); if (el) el.outerHTML = quizHtml(lessonById[li], +qi);
      const l = lessonById[li]; const n = $('.tabs button[data-tab="quiz"] .n');
      if (n) n.textContent = `${l.quiz.filter((_, k) => state.progress.quizzes[`${l.id}-q${k}`]).length}/${l.quiz.length}`;
    }
    if (act === 'create') {
      const custom = $('#newCode').value.trim(); btn.disabled = true;
      try { const code = await createCode(custom); render(); toast('Код створено: ' + code); }
      catch (err) { toast(err.status === 409 ? 'Такий код уже зайнятий' : 'Помилка: ' + err.message); btn.disabled = false; }
    }
    if (act === 'login') {
      const code = $('#loginCode').value.trim(); if (code.length < 4) return toast('Код надто короткий');
      btn.disabled = true;
      try { await login(code); render(); toast('Прогрес синхронізовано'); }
      catch (err) { toast(err.status === 404 ? 'Код не знайдено' : 'Помилка: ' + err.message); btn.disabled = false; }
    }
    if (act === 'logout') { logout(); toast('Вийшов. Прогрес лишився локально.'); }
    if (act === 'copy-code') { await navigator.clipboard?.writeText(state.code); toast('Скопійовано'); }
    if (act === 'export') {
      const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), progress: state.progress }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ai-dev-course-progress.json'; a.click();
    }
    if (act === 'import') {
      const inp = $('#importFile'); inp.onchange = async () => {
        const f = inp.files[0]; if (!f) return;
        try { const j = JSON.parse(await f.text()); const p = normalize(j.progress || j); await save(p); render(); toast('Імпортовано'); } catch { toast('Некоректний файл'); }
      }; inp.click();
    }
  } catch (err) { console.error(err); toast('Помилка: ' + err.message); }
});

window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/lesson/')) state.tab = 'overview'; render(); });
window.addEventListener('online', flushPending);

/* ---------- boot ---------- */
(async () => {
  render();
  if (state.code) {
    try { const r = await api('/progress'); const local = LS.get('progress', {}); for (const k of ['lessons', 'tasks', 'quizzes', 'notes', 'meta']) state.progress[k] = { ...(local[k] || {}), ...(r.progress[k] || {}) }; persistLocal(); state.online = true; await flushPending(); render(true); }
    catch (e) { if (e.status === 401) { logout(); toast('Код більше не дійсний'); } else { state.online = false; renderSyncDot(); } }
  }
})();
