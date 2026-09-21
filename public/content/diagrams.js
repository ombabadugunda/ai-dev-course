// Declarative diagrams rendered into two layouts: wide (desktop, given coordinates) and narrow (mobile, vertical stack).
// Spec: { h, nodes:{id:{x,y,w,h,cls,lines,lh}}, edges:[{from,to,cls,label,d?}], notes:[{x,y,text,cls,anchor}], order?:[ids], mnotes?:[strings] }
// cls for nodes: '' | a | ok | warn | bad | p | t ; for edges: '' | a | ok | bad | dash

const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const defs = `<defs>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr"/></marker>
<marker id="ah-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr a"/></marker>
<marker id="ah-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr ok"/></marker>
<marker id="ah-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr bad"/></marker>
</defs>`;
const marker = (cls = '') => `url(#ah${cls.includes('a') && !cls.includes('bad') ? '-a' : cls.includes('ok') ? '-ok' : cls.includes('bad') ? '-bad' : ''})`;

// wrap a text line into pieces of at most `max` visible chars (entities count as 1)
function wrap(t, max) {
  const vis = (x) => x.replace(/&[a-z]+;/g, '_').length;
  if (vis(t) <= max) return [t];
  const out = []; let cur = '';
  for (const wd of t.split(' ')) {
    const cand = cur ? cur + ' ' + wd : wd;
    if (vis(cand) > max && cur) { out.push(cur); cur = wd; } else cur = cand;
  }
  if (cur) out.push(cur);
  return out;
}
// returns [{t, cls}] for a node; when `maxW` is given, long lines are wrapped to fit
function nodeLines(n, maxW) {
  const lines = Array.isArray(n.lines) ? n.lines : [n.lines];
  const res = [];
  lines.forEach((t, i) => {
    const cls = i === 0 && n.h0 !== false ? 'h' : 's';
    const parts = maxW ? wrap(t, Math.floor((maxW - 16) / (cls === 'h' ? 7.4 : 5.6))) : [t];
    for (const p of parts) res.push({ t: p, cls });
  });
  return res;
}
function nodeSvg(n, x, y, w, h, wrapTo) {
  const lines = nodeLines(n, wrapTo);
  const lh = n.lh || 14; const cy = y + h / 2 - ((lines.length - 1) * lh) / 2 + 4;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="box ${n.cls || ''}"/>` +
    lines.map((l, i) => `<text x="${x + w / 2}" y="${cy + i * lh}" text-anchor="middle" class="${l.cls}">${l.t}</text>`).join('');
}
const arrow = (d, cls = '') => `<path d="${d}" class="ln ${cls}" marker-end="${marker(cls)}"/>`;
const text = (x, y, t, cls = 's', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;

// ---- wide layout: use given coords; edges: explicit path `d` or auto between node sides
function edgePathWide(spec, e) {
  if (e.d) return e.d;
  const a = spec.nodes[e.from], b = spec.nodes[e.to];
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const dx = bc.x - ac.x, dy = bc.y - ac.y;
  let p1, p2;
  if (Math.abs(dx) > Math.abs(dy)) { p1 = { x: dx > 0 ? a.x + a.w : a.x, y: ac.y }; p2 = { x: dx > 0 ? b.x : b.x + b.w, y: bc.y }; }
  else { p1 = { x: ac.x, y: dy > 0 ? a.y + a.h : a.y }; p2 = { x: bc.x, y: dy > 0 ? b.y : b.y + b.h }; }
  const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  return Math.abs(dx) > Math.abs(dy) ? `M${p1.x} ${p1.y} C${mx} ${p1.y} ${mx} ${p2.y} ${p2.x} ${p2.y}` : `M${p1.x} ${p1.y} C${p1.x} ${my} ${p2.x} ${my} ${p2.x} ${p2.y}`;
}
function renderWide(spec) {
  let s = '';
  for (const [id, n] of Object.entries(spec.nodes)) s += nodeSvg(n, n.x, n.y, n.w, n.h);
  for (const e of spec.edges || []) { s += arrow(edgePathWide(spec, e), e.cls || ''); if (e.label && e.lx != null) s += text(e.lx, e.ly, e.label, 's'); }
  for (const t of spec.notes || []) s += text(t.x, t.y, t.text, t.cls || 's', t.anchor || 'middle');
  return `<svg viewBox="0 0 640 ${spec.h}" role="img">${defs}${s}</svg>`;
}

// ---- narrow layout: vertical stack, width 360
function renderNarrow(spec) {
  const W = 360, NX = 48, NW = 264, GAP = 30, TOP = 16;
  const order = spec.order || Object.entries(spec.nodes).sort((p, q) => (p[1].y - q[1].y) || (p[1].x - q[1].x)).map(([id]) => id);
  const pos = {}; let y = TOP;
  for (const id of order) { const n = spec.nodes[id]; const lines = nodeLines(n, NW); const h = Math.max(n.h, 18 + lines.length * (n.lh || 14)); pos[id] = { x: NX, y, w: NW, h }; y += h + GAP; }
  let s = '';
  for (const id of order) s += nodeSvg(spec.nodes[id], pos[id].x, pos[id].y, pos[id].w, pos[id].h, NW);
  let leftUsed = 0, rightUsed = 0;
  for (const e of spec.edges || []) {
    const a = pos[e.from], b = pos[e.to]; if (!a || !b) continue;
    const ia = order.indexOf(e.from), ib = order.indexOf(e.to); const cls = e.cls || '';
    let d, lx, ly, anchor = 'middle';
    if (ib === ia + 1) { const x = a.x + a.w / 2; d = `M${x} ${a.y + a.h} L${x} ${b.y}`; lx = x + 8; ly = (a.y + a.h + b.y) / 2 + 4; anchor = 'start'; }
    else if (ib > ia) { const off = 18 + rightUsed * 14; rightUsed++; const x0 = a.x + a.w, x1 = b.x + b.w; const xr = W - 8 - off; d = `M${x0} ${a.y + a.h / 2} C${xr} ${a.y + a.h / 2} ${xr} ${b.y + b.h / 2} ${x1 + 2} ${b.y + b.h / 2}`; lx = xr - 4; ly = (a.y + b.y) / 2 + a.h / 2; anchor = 'end'; }
    else { const off = 18 + leftUsed * 14; leftUsed++; const xl = 8 + off; d = `M${a.x} ${a.y + a.h / 2} C${xl} ${a.y + a.h / 2} ${xl} ${b.y + b.h / 2} ${b.x - 2} ${b.y + b.h / 2}`; lx = xl + 4; ly = (a.y + b.y) / 2 + a.h / 2; anchor = 'start'; }
    s += arrow(d, cls);
    if (e.label) s += text(lx, ly, e.label, 's', anchor);
  }
  const notes = spec.mnotes || (spec.notes || []).map((t) => t.text);
  for (const t of notes) for (const part of wrap(t, 58)) { y += 2; s += text(W / 2, y + 10, part, 's'); y += 16; }
  return `<svg viewBox="0 0 ${W} ${y + 10}" role="img">${defs}${s}</svg>`;
}

export function renderDiagram(id) {
  const spec = SPECS[id]; if (!spec) return null;
  return `<div class="d-wide">${renderWide(spec)}</div><div class="d-narrow">${renderNarrow(spec)}</div>`;
}

const N = (x, y, w, h, cls, lines, extra = {}) => ({ x, y, w, h, cls, lines, ...extra });

export const SPECS = {
  'agent-loop': {
    h: 250,
    nodes: {
      model: N(20, 95, 120, 60, 'a', ['Модель', 'міркує / планує']),
      call: N(260, 20, 120, 56, '', ['Виклик tool', 'bash, edit, read…']),
      env: N(500, 95, 120, 60, 't', ['Середовище', 'файли, тести, git']),
      result: N(260, 174, 120, 56, '', ['Результат tool', 'stdout, diff, помилка']),
    },
    edges: [
      { from: 'model', to: 'call', cls: 'a', label: '① думає', d: 'M140 110 C200 60 210 48 258 48', lx: 80, ly: 82 },
      { from: 'call', to: 'env', cls: 'a', label: '② діє', d: 'M380 48 C450 48 480 70 518 95', lx: 450, ly: 82 },
      { from: 'env', to: 'result', label: '③ спостерігає', d: 'M560 155 C540 200 450 202 382 202', lx: 450, ly: 230 },
      { from: 'result', to: 'model', label: '④ оновлює план', d: 'M260 202 C200 202 140 190 100 156', lx: 170, ly: 238 },
    ],
    notes: [{ x: 320, y: 130, text: 'контекстне вікно = вся історія циклу' }, { x: 320, y: 145, text: 'кожна ітерація додає токени' }],
    order: ['model', 'call', 'env', 'result'],
  },

  'context-budget': {
    h: 190,
    nodes: {
      sys: N(30, 30, 90, 46, 'a', ['system']), md: N(120, 30, 70, 46, 't', ['CLAUDE.md'], { h0: false }), tools: N(190, 30, 110, 46, 'p', ['tools/MCP'], { h0: false }),
      hist: N(300, 30, 200, 46, 'warn', ['історія + виводи tools'], { h0: false }), dumb: N(500, 30, 110, 46, 'bad', ['«dumb zone»']),
    },
    edges: [],
    notes: [
      { x: 320, y: 100, text: '← 0 %   заповнення контексту   100 % →' },
      { x: 320, y: 130, text: 'Кожен токен — це «бюджет уваги». Утримуй завантаження ~40–60 %,' },
      { x: 320, y: 146, text: 'решту віддавай під задачу, а не під шум.' },
      { x: 320, y: 172, text: 'Що ближче до кінця вікна — то нижча точність (context rot).' },
    ],
    mnotes: ['Порядок зверху вниз = заповнення 0 % → 100 %', 'Утримуй завантаження ~40–60 %', 'Ближче до кінця вікна точність падає (context rot)'],
  },

  'harness-guides-sensors': {
    h: 300,
    nodes: {
      guides: N(20, 20, 200, 78, 't', ['GUIDES (feedforward)', 'CLAUDE.md, типи, шаблони,', 'план, скаффолди, skills']),
      model: N(230, 115, 180, 70, 'a', ['МОДЕЛЬ', 'агент виконує задачу']),
      sensors: N(420, 20, 200, 78, 'p', ['SENSORS (feedback)', 'лінтери, тести, hooks,', 'review-агенти, моніторинг']),
      comp: N(20, 215, 290, 66, '', ['Обчислювальні (детерміновані)', 'швидкі, дешеві, надійні:', 'tsc, eslint, тести, codemods']),
      infer: N(330, 215, 290, 66, '', ['Інференційні (LLM)', 'гнучкі, імовірнісні, дорогі:', 'review-субагент, семантичні перевірки']),
    },
    edges: [
      { from: 'guides', to: 'model', cls: 'a', label: 'скеровують до дії', d: 'M120 98 C140 120 180 130 228 140', lx: 150, ly: 128 },
      { from: 'model', to: 'sensors', label: 'спостерігають після дії', d: 'M410 150 C450 140 480 120 520 98', lx: 500, ly: 128 },
    ],
    notes: [{ x: 320, y: 205, text: 'Кожен guide чи sensor буває одного з двох типів:' }],
    order: ['guides', 'model', 'sensors', 'comp', 'infer'],
    mnotes: ['Guides — до дії, sensors — після дії', 'Кожен елемент — обчислювальний або інференційний'],
  },

  'hooks-lifecycle': {
    h: 260,
    nodes: {
      s1: N(20, 20, 130, 44, 'a', ['SessionStart', 'init.sh, контекст']), s2: N(170, 20, 140, 44, '', ['UserPromptSubmit', 'валідація, доповнення']),
      s3: N(330, 20, 130, 44, 'warn', ['PreToolUse', 'дозволити / заблокувати']), s4: N(480, 20, 140, 44, 't', ['PostToolUse', 'форматер, лінтер']),
      s5: N(170, 110, 140, 44, '', ['SubagentStop', 'перевірка результату']), s6: N(330, 110, 130, 44, 'p', ['Stop', 'tsc + тести → exit 2']), s7: N(480, 110, 140, 44, '', ['PreCompact', 'зберегти прогрес']),
    },
    edges: [{ from: 's1', to: 's2' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' }, { from: 's4', to: 's6', d: 'M550 64 C550 90 420 90 395 108' }],
    notes: [
      { x: 320, y: 190, text: 'exit 0 → «немає заперечень» · exit 2 → блокує дію, stderr повертається моделі' },
      { x: 320, y: 208, text: 'JSON у stdout: permissionDecision allow | deny | ask, additionalContext' },
      { x: 320, y: 240, text: 'CLAUDE.md — порада. Hook — гарантія.', cls: 'h' },
    ],
    order: ['s1', 's2', 's3', 's4', 's6', 's5', 's7'],
    mnotes: ['exit 0 — немає заперечень; exit 2 — блок + stderr моделі', 'JSON у stdout: allow | deny | ask, additionalContext', 'CLAUDE.md — порада. Hook — гарантія.'],
  },

  'rpi-flow': {
    h: 240,
    nodes: {
      r: N(20, 40, 170, 70, 'a', ['1. Research', 'де що лежить, як працює', '→ research.md']),
      p: N(235, 40, 170, 70, 'p', ['2. Plan', 'кроки, файли, тести', '→ plan.md']),
      i: N(450, 40, 170, 70, 't', ['3. Implement', 'код за планом', '→ PR + evidence']),
    },
    edges: [{ from: 'r', to: 'p', cls: 'a', label: 'compact', lx: 212, ly: 62 }, { from: 'p', to: 'i', cls: 'a', label: 'compact', lx: 427, ly: 62 }],
    notes: [
      { x: 105, y: 135, text: '👤 review #1', cls: 'h' }, { x: 320, y: 135, text: '👤 review #2', cls: 'h' }, { x: 535, y: 135, text: '👤 review #3', cls: 'h' },
      { x: 105, y: 152, text: 'найвищий важіль' }, { x: 320, y: 152, text: 'один рядок плану =' }, { x: 535, y: 152, text: 'найнижчий важіль' }, { x: 320, y: 167, text: 'сотні рядків коду' },
      { x: 320, y: 210, text: 'Свіжий контекст на кожній фазі. Артефакти (.md) — пам’ять, що переживає скидання контексту.' },
    ],
    mnotes: ['Людський review після кожної фази: research → план → код', 'Важіль review найвищий на research, найнижчий на коді', 'Свіжий контекст на кожній фазі; .md-артефакти переживають скидання'],
  },

  'ralph-loop': {
    h: 250,
    nodes: {
      prompt: N(20, 90, 150, 60, 'a', ['PROMPT.md / PRD', 'декларативна ціль']),
      agent: N(240, 30, 160, 56, '', ['Свіжий агент', 'нове контекстне вікно']),
      tests: N(470, 90, 150, 60, 'p', ['Тести / feature_list', 'умова завершення']),
      state: N(240, 165, 160, 56, 't', ['progress.md + git', 'зовнішній стан']),
    },
    edges: [
      { from: 'prompt', to: 'agent', cls: 'a', d: 'M170 110 C200 90 210 60 238 58' }, { from: 'agent', to: 'tests', d: 'M400 58 C440 60 460 80 500 90' },
      { from: 'tests', to: 'state', d: 'M545 150 C540 190 460 195 402 193' }, { from: 'state', to: 'prompt', d: 'M240 193 C200 195 180 170 140 150' },
    ],
    notes: [{ x: 320, y: 125, text: 'while :; do cat PROMPT.md | agent; done', cls: 'h' }, { x: 320, y: 240, text: 'Один цикл = одна фіча: читає прогрес → обирає наступне → робить → комітить → оновлює прогрес.' }],
    order: ['prompt', 'agent', 'tests', 'state'],
    mnotes: ['while :; do cat PROMPT.md | agent; done', 'Один цикл = одна фіча; стан живе у файлах, не в чаті'],
  },

  'long-running': {
    h: 280,
    nodes: {
      init: N(20, 20, 180, 60, 'a', ['Initializer agent', 'init.sh, feature_list.json,', 'progress.txt, перший commit']),
      sess: N(230, 20, 180, 60, '', ['Сесія N', 'pwd → git log → progress', '→ init.sh → smoke test']),
      feat: N(440, 20, 180, 60, 't', ['Одна фіча', 'реалізує → перевіряє E2E', '→ commit → progress']),
      list: N(20, 160, 600, 100, '', ['feature_list.json', '{ "category": "auth", "description": "…", "steps": ["…"], "passes": false }', 'правило: не можна видаляти чи редагувати тести/фічі — лише переводити passes у true', 'кожна сесія завершується у чистому, mergeable стані'], { lh: 18 }),
    },
    edges: [{ from: 'init', to: 'sess' }, { from: 'sess', to: 'feat' }, { from: 'feat', to: 'sess', cls: 'a', label: 'наступна сесія (новий контекст)', d: 'M530 80 C530 130 320 130 320 80', lx: 420, ly: 118 }],
    notes: [],
    order: ['init', 'sess', 'feat', 'list'],
  },

  'sdd-lifecycle': {
    h: 290,
    nodes: {
      c: N(20, 20, 600, 46, 'a', ['0. Constitution / steering — принципи, стек, команди, межі (один раз, еволюціонує повільно)']),
      s1: N(20, 90, 135, 60, '', ['1. Clarify', 'інтерв’ю, припущення,', '[NEEDS CLARIFICATION]']),
      s2: N(175, 90, 135, 60, 't', ['2. Specify', 'ЩО і ЧОМУ: stories,', 'EARS / Given-When-Then']),
      s3: N(330, 90, 135, 60, 'p', ['3. Plan', 'ЯК: архітектура,', 'дані, контракти']),
      s4: N(485, 90, 135, 60, '', ['4. Tasks', 'атомарні, з ID вимог,', 'шляхами, [P]']),
      s5: N(485, 180, 135, 60, 't', ['5. Implement', 'свіжий контекст,', 'test-first, evidence']),
      s6: N(330, 180, 135, 60, 'warn', ['6. Verify', 'analyze/checklist,', 'adversarial review']),
      s7: N(175, 180, 135, 60, 'a', ['7. Reconcile', 'spec ↔ code diff,', 'archive, replan']),
    },
    edges: [{ from: 's1', to: 's2' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' }, { from: 's4', to: 's5' }, { from: 's5', to: 's6' }, { from: 's6', to: 's7' }, { from: 's7', to: 's1', cls: 'a', d: 'M175 210 C100 210 60 200 60 152' }],
    notes: [{ x: 320, y: 270, text: '👤 human gate після кожного артефакту · масштабуй церемонію під розмір задачі' }],
    order: ['c', 's1', 's2', 's3', 's4', 's5', 's6', 's7'],
    mnotes: ['Human gate після кожного артефакту', 'Масштабуй церемонію під розмір задачі'],
  },

  'spec-levels': {
    h: 220,
    nodes: {
      l1: N(20, 30, 180, 80, '', ['Spec-first', 'spec породжує код,', 'далі не підтримується', '(Kiro, Spec Kit за замовч.)']),
      l2: N(230, 30, 180, 80, 't', ['Spec-anchored', 'spec живе поруч із кодом,', 'реконсиляція після змін', '(OpenSpec, BMAD)']),
      l3: N(440, 30, 180, 80, 'p', ['Spec-as-source', 'людина редагує лише spec,', 'код — генерований артефакт', '(Tessl, візія)']),
    },
    edges: [{ from: 'l1', to: 'l2' }, { from: 'l2', to: 'l3' }],
    notes: [{ x: 320, y: 140, text: 'зростає: витрати на review · ризик дрейфу · вимоги до детермінізму' }, { x: 320, y: 170, text: 'Рекомендація 2026: spec-anchored для більшості команд', cls: 'h' }, { x: 320, y: 190, text: '(Thoughtworks Radar тримає SDD у «Assess»)' }],
    mnotes: ['Згори вниз зростають: review, ризик дрейфу, вимоги до детермінізму', 'Рекомендація 2026: spec-anchored', 'Thoughtworks Radar тримає SDD у «Assess»'],
  },

  'ears': {
    h: 230,
    nodes: {
      u: N(20, 20, 290, 40, 'a', ['Ubiquitous — The system SHALL …']), e: N(330, 20, 290, 40, 't', ['Event — WHEN &lt;подія&gt; the system SHALL …']),
      s: N(20, 75, 290, 40, 'p', ['State — WHILE &lt;стан&gt; the system SHALL …']), w: N(330, 75, 290, 40, 'warn', ['Unwanted — IF &lt;умова&gt; THEN the system SHALL …']),
      o: N(20, 130, 600, 40, '', ['Optional — WHERE &lt;фіча увімкнена&gt; the system SHALL …']),
    },
    edges: [],
    notes: [{ x: 320, y: 200, text: '1 вимога → 1 тест. Домовна мова, без стеку. Кожна має ID (FR-012) для трасування у commit/PR.' }],
    mnotes: ['1 вимога → 1 тест. Домовна мова, без стеку.', 'Кожна вимога має ID (FR-012) для трасування'],
  },

  'orchestrator-worker': {
    h: 300,
    nodes: {
      lead: N(230, 20, 180, 60, 'a', ['Lead / Orchestrator', 'план, декомпозиція,', 'синтез (сильна модель)']),
      w1: N(20, 140, 140, 64, 't', ['Worker 1', 'свіжий контекст', 'read-only tools']), w2: N(180, 140, 140, 64, 't', ['Worker 2', 'свіжий контекст', 'read-only tools']), w3: N(340, 140, 140, 64, 't', ['Worker 3', 'свіжий контекст', 'read-only tools']),
      v: N(500, 140, 120, 64, 'p', ['Verifier', 'лише критерії', '+ артефакт']),
    },
    edges: [
      { from: 'lead', to: 'w1', cls: 'a', d: 'M290 80 C200 100 120 110 90 138' }, { from: 'lead', to: 'w2', cls: 'a', d: 'M310 80 C280 100 260 110 250 138' }, { from: 'lead', to: 'w3', cls: 'a', d: 'M340 80 C380 100 400 110 410 138' },
      { from: 'w1', to: 'lead', label: 'summary ↑', d: 'M110 204 C150 240 280 250 300 240 C320 230 300 100 300 82', lx: 110, ly: 232 },
    ],
    notes: [{ x: 320, y: 262, text: 'бриф воркера: ціль · формат відповіді · які tools · межі · чого НЕ робити' }, { x: 320, y: 280, text: 'воркери повертають стислий підсумок (1–2k токенів) або посилання на артефакт' }],
    order: ['lead', 'w1', 'w2', 'w3', 'v'],
    mnotes: ['Бриф воркера: ціль · формат · tools · межі · чого НЕ робити', 'Воркери повертають стислий підсумок, не сирі дампи'],
  },

  'single-writer': {
    h: 260,
    nodes: {
      res: N(20, 20, 160, 56, 't', ['Researcher', 'читає кодову базу']), plan: N(20, 170, 160, 56, 't', ['Planner', 'сильніша модель']),
      writer: N(230, 90, 180, 70, 'a', ['WRITER', 'єдиний, хто змінює код', 'повний контекст задачі']),
      rev: N(460, 20, 160, 56, 'p', ['Reviewer', 'чистий контекст, ≠ автор']), ver: N(460, 170, 160, 56, 'p', ['Verifier', 'запускає тести']),
    },
    edges: [{ from: 'res', to: 'writer' }, { from: 'plan', to: 'writer' }, { from: 'writer', to: 'rev', cls: 'a' }, { from: 'writer', to: 'ver', cls: 'a' }],
    notes: [{ x: 320, y: 245, text: '«Читання паралелиться, запис — ні». Паралельні письменники → конфліктні неявні рішення.' }],
    order: ['res', 'plan', 'writer', 'rev', 'ver'],
    mnotes: ['«Читання паралелиться, запис — ні»', 'Паралельні письменники → конфліктні неявні рішення'],
  },

  'manager-vs-handoff': {
    h: 250,
    nodes: {
      m: N(90, 40, 140, 50, 'a', ['Manager', 'тримає розмову']), ma: N(20, 150, 90, 44, 't', ['A', 'як tool']), mb: N(120, 150, 90, 44, 't', ['B', 'як tool']), mc: N(220, 150, 90, 44, 't', ['C', 'як tool']),
      tr: N(350, 100, 80, 44, 'p', ['Triage']), bi: N(450, 40, 80, 44, 'p', ['Billing']), su: N(450, 160, 80, 44, 'p', ['Support']), re: N(550, 100, 80, 44, 'p', ['Refund']),
    },
    edges: [
      { from: 'm', to: 'ma', d: 'M130 90 L70 148' }, { from: 'm', to: 'mb', d: 'M160 90 L165 148' }, { from: 'm', to: 'mc', d: 'M195 90 L260 148' },
      { from: 'tr', to: 'bi', d: 'M430 112 L450 70' }, { from: 'tr', to: 'su', d: 'M430 132 L450 175' }, { from: 'bi', to: 're', d: 'M530 62 L555 100' }, { from: 'su', to: 're', d: 'M530 180 L555 144' }, { from: 'bi', to: 'su', cls: 'bad', d: 'M490 84 L490 158' },
    ],
    notes: [{ x: 160, y: 22, text: 'Manager / agents-as-tools', cls: 'h' }, { x: 160, y: 225, text: 'контроль, аудит, простий трейс' }, { x: 480, y: 22, text: 'Handoffs / swarm', cls: 'h' }, { x: 490, y: 225, text: 'менше викликів, але ризик «пінг-понгу»' }, { x: 490, y: 240, text: '→ handoff_count ≤ 3' }],
    order: ['m', 'ma', 'mb', 'mc', 'tr', 'bi', 'su', 're'],
    mnotes: ['Зверху: Manager / agents-as-tools — контроль, аудит, простий трейс', 'Знизу: Handoffs / swarm — менше викликів, але ризик «пінг-понгу»', 'Пунктир Billing↔Support — пінг-понг; ліки: handoff_count ≤ 3'],
  },

  'mast': {
    h: 250,
    nodes: {
      c1: N(20, 20, 190, 120, 'bad', ['Спец/дизайн — 44 %', 'порушення спеки задачі 12 %', 'повторення кроків 16 %', 'не знає умови зупинки 12 %', 'втрата історії 3 %'], { lh: 17 }),
      c2: N(225, 20, 190, 120, 'warn', ['Міжагентна неузгодж. — 32 %', 'reasoning ≠ action 13 %', 'збочення з задачі 7 %', 'не питає уточнень 7 %', 'ігнорує інпут іншого 2 %'], { lh: 17 }),
      c3: N(430, 20, 190, 120, 'p', ['Верифікація — 24 %', 'некоректна перевірка 9 %', 'відсутня перевірка 8 %', 'передчасне завершення 6 %'], { lh: 17 }),
    },
    edges: [],
    notes: [{ x: 320, y: 170, text: 'MAST (Cemri et al., NeurIPS 2025): 1 600+ трейсів, 7 фреймворків, κ = 0.88' }, { x: 320, y: 190, text: 'Висновок: збої — проблеми організаційного дизайну, а не лише «слабкої моделі».' }, { x: 320, y: 222, text: 'Ліки: явні ролі й умови зупинки · структурований протокол · виконувана верифікація', cls: 'h' }],
    mnotes: ['MAST (NeurIPS 2025): 1 600+ трейсів, 7 фреймворків', 'Збої — проблеми організаційного дизайну', 'Ліки: ролі й умови зупинки · протокол · виконувана верифікація'],
  },

  'topology-task': {
    h: 230,
    nodes: {
      ok: N(20, 30, 290, 70, 'ok', ['Декомпозована / паралельна задача', 'централізований оркестратор: до +81 %', 'помилки ×4.4 (vs ×17 у незалежних)']),
      bad: N(330, 30, 290, 70, 'bad', ['Строго послідовна задача', 'будь-який мультиагент: −39…−70 %', 'координація дробить міркування']),
    },
    edges: [],
    notes: [{ x: 320, y: 130, text: 'Google Research / MIT, «Towards a Science of Scaling Agent Systems» (2025–26)' }, { x: 320, y: 160, text: 'Обирай топологію за властивостями задачі:', cls: 'h' }, { x: 320, y: 180, text: 'декомпозованість · послідовні залежності · кількість tools' }, { x: 320, y: 210, text: 'а не за принципом «більше агентів = краще»' }],
    mnotes: ['Google Research / MIT, 2025–26', 'Обирай топологію за властивостями задачі', 'декомпозованість · залежності · кількість tools'],
  },

  'evals-loop': {
    h: 240,
    nodes: {
      tr: N(20, 30, 130, 56, 'a', ['Трейси', 'логи, tool calls']), ea: N(180, 30, 130, 56, '', ['Error analysis', 'open → axial coding']),
      j: N(340, 30, 130, 56, 'p', ['LLM-as-judge', 'валідований на людях']), ci: N(500, 30, 120, 56, 't', ['CI regression', 'на кожну зміну']),
      ch: N(180, 130, 290, 56, 'warn', ['Зміни harness / промпту / топології', 'одна змінна за раз, A/B на 20+ задачах']),
    },
    edges: [{ from: 'tr', to: 'ea' }, { from: 'ea', to: 'j' }, { from: 'j', to: 'ci' }, { from: 'ci', to: 'ch', d: 'M560 86 C560 120 500 158 472 158' }, { from: 'ch', to: 'tr', cls: 'a', d: 'M180 158 C120 158 85 120 85 88' }],
    notes: [{ x: 320, y: 220, text: 'Оцінюй кінцевий стан для відкритих задач і траєкторію (milestones) — для процесу' }],
    order: ['tr', 'ea', 'j', 'ci', 'ch'],
    mnotes: ['Кінцевий стан — для відкритих задач; траєкторія — для процесу'],
  },

  'security-layers': {
    h: 260,
    nodes: {
      th: N(20, 20, 600, 40, 'bad', ['Загрози: prompt injection (issue/PR/web/MCP-опис) · tool abuse · ексфільтрація · supply chain']),
      iso: N(20, 80, 190, 60, 'a', ['Ізоляція', 'sandbox FS + мережа,', 'allowlist доменів']),
      lp: N(225, 80, 190, 60, 't', ['Найменші привілеї', 'tool allowlists, read-only', 'субагенти, scoped MCP']),
      gate: N(430, 80, 190, 60, 'p', ['Детерміновані ґейти', 'PreToolUse hooks, CI,', 'захищені директорії']),
      inp: N(20, 160, 290, 60, '', ['Недовірений вхід', 'повідомлення між агентами = дані,', 'не інструкції; сканування виводу']),
      hum: N(330, 160, 290, 60, '', ['Людина у контурі', 'для незворотних дій: push, deploy,', 'платежі, видалення']),
    },
    edges: [],
    notes: [{ x: 320, y: 245, text: 'Втома від permission-prompts → люди ставлять «так» не читаючи. Заміняй промпти структурою.' }],
    mnotes: ['Загрози зверху, шари захисту нижче, людина — для незворотного', 'Заміняй permission-prompts структурою'],
  },

  'delegation-options': {
    h: 250,
    nodes: {
      sub: N(20, 20, 190, 100, 'a', ['Subagent', 'повертає результат у батька', 'свіжий контекст, дешевше', 'фонові, вкладеність ≤3', 'для: пошук, тести, review'], { lh: 16 }),
      team: N(225, 20, 190, 100, 'p', ['Agent Team', 'повні сесії + task list', '+ mailbox, самокоординація', '~7× токенів', 'для: паралельний review, дебати'], { lh: 16 }),
      wt: N(430, 20, 190, 100, 't', ['Worktree', 'ізоляція файлів/гілки', '.claude/worktrees/&lt;name&gt;', 'isolation: worktree', 'для: паралельні фічі'], { lh: 16 }),
    },
    edges: [],
    notes: [{ x: 320, y: 150, text: 'Комбінуй: team → кожен teammate у своєму worktree → subagents для верифікації' }, { x: 320, y: 185, text: 'Правила: 3–5 teammates · 5–6 задач на кожного · жодних двох агентів в одному файлі', cls: 'h' }, { x: 320, y: 210, text: 'починай з read-only задач · quality gates через hooks (exit 2 = відхилити з фідбеком)' }],
    mnotes: ['Комбінуй: team → worktree на teammate → subagents для верифікації', '3–5 teammates · 5–6 задач на кожного', 'Жодних двох агентів в одному файлі'],
  },

  'ladder': {
    h: 230,
    nodes: {
      l1: N(20, 130, 180, 70, 'warn', ['1. Vibe coding', 'промпт → код → «працює?»', 'нема тестів, нема spec']),
      l2: N(230, 80, 180, 70, 't', ['2. Vibe engineering', 'plan mode, CLAUDE.md,', 'review, тести, hooks']),
      l3: N(440, 30, 180, 70, 'a', ['3. Agentic engineering', 'spec, harness, субагенти,', 'evals, sandbox, метрики']),
    },
    edges: [{ from: 'l1', to: 'l2', cls: 'a', d: 'M200 165 L228 130' }, { from: 'l2', to: 'l3', cls: 'a', d: 'M410 115 L438 80' }],
    notes: [{ x: 320, y: 220, text: 'Той самий інструмент — різна дисципліна. Курс веде з рівня 1 на рівень 3.' }],
    order: ['l1', 'l2', 'l3'],
  },

  'claude-md': {
    h: 260,
    nodes: {
      md: N(20, 20, 280, 220, 'a', ['CLAUDE.md / AGENTS.md (&lt; 60–100 рядків)', '', '• команди з прапорцями (build/test/lint)', '• нестандартні конвенції', '• межі: always / ask / never', '• «не роби X, бо Y, натомість Z»', '• @-імпорти глибших доків', '', 'НЕ: огляд репо, те, що видно з коду,', 'стандартні практики, файл-за-файлом'], { lh: 19 }),
      d1: N(340, 20, 280, 60, '', ['docs/design-docs/', 'архітектура, ADR']), d2: N(340, 95, 280, 60, '', ['docs/exec-plans/', 'активні та завершені плани']), d3: N(340, 170, 280, 60, '', ['docs/references/, .claude/rules/', 'LLM-оптимізовані довідки, path-scoped']),
    },
    edges: [{ from: 'md', to: 'd1', cls: 'a', d: 'M300 60 L338 50' }, { from: 'md', to: 'd2', cls: 'a', d: 'M300 120 L338 125' }, { from: 'md', to: 'd3', cls: 'a', d: 'M300 180 L338 200' }],
    notes: [],
    order: ['md', 'd1', 'd2', 'd3'],
  },
};

export const DIAGRAMS = new Proxy({}, { get: (_, id) => renderDiagram(id) });
