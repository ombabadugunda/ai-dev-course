// Inline SVG diagrams. Styled via CSS classes in app.css (.box, .ln, .arr, text).
const defs = `<defs>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr"/></marker>
<marker id="ah-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr a"/></marker>
<marker id="ah-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr ok"/></marker>
<marker id="ah-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr bad"/></marker>
</defs>`;
const box = (x, y, w, h, cls, lines, opts = {}) => {
  const ls = Array.isArray(lines) ? lines : [lines];
  const lh = opts.lh || 14; const cy = y + h / 2 - ((ls.length - 1) * lh) / 2 + 4;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx ?? 10}" class="box ${cls || ''}"/>` +
    ls.map((t, i) => `<text x="${x + w / 2}" y="${cy + i * lh}" text-anchor="middle" class="${i === 0 && opts.h !== false ? 'h' : 's'}">${t}</text>`).join('');
};
const arrow = (d, cls = '') => `<path d="${d}" class="ln ${cls}" marker-end="url(#ah${cls.includes('a') ? '-a' : cls.includes('ok') ? '-ok' : cls.includes('bad') ? '-bad' : ''})"/>`;
const label = (x, y, t, cls = 's', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;
const svg = (h, body) => `<svg viewBox="0 0 640 ${h}" role="img">${defs}${body}</svg>`;

export const DIAGRAMS = {
  // 1. Agentic loop
  'agent-loop': svg(250, `
    ${box(20, 95, 120, 60, 'a', ['Модель', 'міркує / планує'])}
    ${box(260, 20, 120, 56, '', ['Виклик tool', 'bash, edit, read…'])}
    ${box(500, 95, 120, 60, 't', ['Середовище', 'файли, тести, git'])}
    ${box(260, 174, 120, 56, '', ['Результат tool', 'stdout, diff, помилка'])}
    ${arrow('M140 110 C200 60 210 48 258 48', 'a')}
    ${arrow('M380 48 C450 48 480 70 518 95', 'a')}
    ${arrow('M560 155 C540 200 450 202 382 202')}
    ${arrow('M260 202 C200 202 140 190 100 156')}
    ${label(320, 130, 'контекстне вікно = вся історія циклу', 's')}
    ${label(320, 145, 'кожна ітерація додає токени', 's')}
    ${label(80, 82, '① думає', 's')}${label(450, 82, '② діє', 's')}${label(450, 230, '③ спостерігає', 's')}${label(170, 238, '④ оновлює план', 's')}
  `),

  // 2. Context budget / rot
  'context-budget': svg(230, `
    <rect x="30" y="30" width="580" height="46" rx="8" class="box"/>
    <rect x="30" y="30" width="90" height="46" rx="8" class="box a"/>
    <rect x="120" y="30" width="70" height="46" class="box t"/>
    <rect x="190" y="30" width="110" height="46" class="box p"/>
    <rect x="300" y="30" width="200" height="46" class="box warn"/>
    <rect x="500" y="30" width="110" height="46" rx="8" class="box bad"/>
    ${label(75, 58, 'system', 'h')}${label(155, 58, 'CLAUDE.md', 's')}${label(245, 58, 'tools/MCP', 's')}${label(400, 58, 'історія + виводи tools', 's')}${label(555, 58, '«dumb zone»', 'h')}
    ${label(320, 100, '← 0%                                   заповнення контексту                                   100% →', 's')}
    <path d="M40 200 C200 195 380 170 600 120" class="ln bad"/>
    <path d="M40 200 L600 200" class="ln dash"/>
    ${label(560, 112, 'падіння точності', 's')}${label(60, 215, 'якість відповідей', 's', 'start')}
    ${label(320, 150, 'Кожен токен — це «бюджет уваги». Утримуй завантаження ~40–60 %,', 's')}
    ${label(320, 165, 'решту віддавай під задачу, а не під шум.', 's')}
  `),

  // 3. Harness: guides & sensors
  'harness-guides-sensors': svg(300, `
    ${box(230, 115, 180, 70, 'a', ['МОДЕЛЬ', 'агент виконує задачу'])}
    ${box(20, 20, 200, 78, 't', ['GUIDES (feedforward)', 'CLAUDE.md, типи, шаблони,', 'план, скаффолди, skills'])}
    ${box(420, 20, 200, 78, 'p', ['SENSORS (feedback)', 'лінтери, тести, hooks,', 'review-агенти, моніторинг'])}
    ${arrow('M120 98 C140 120 180 130 228 140', 'a')}
    ${arrow('M410 150 C450 140 480 120 520 98')}
    ${label(150, 128, 'скеровують до дії', 's')}${label(500, 128, 'спостерігають після дії', 's')}
    ${box(20, 215, 290, 66, '', ['Обчислювальні (детерміновані)', 'швидкі, дешеві, надійні:', 'tsc, eslint, тести, codemods'])}
    ${box(330, 215, 290, 66, '', ['Інференційні (LLM)', 'гнучкі, імовірнісні, дорогі:', 'review-субагент, семантичні перевірки'])}
    ${label(320, 205, 'Кожен guide чи sensor буває одного з двох типів:', 's')}
  `),

  // 4. Hooks lifecycle
  'hooks-lifecycle': svg(260, `
    ${box(20, 20, 130, 44, 'a', ['SessionStart', 'init.sh, контекст'])}
    ${box(170, 20, 140, 44, '', ['UserPromptSubmit', 'валідація, доповнення'])}
    ${box(330, 20, 130, 44, 'warn', ['PreToolUse', 'дозволити / заблокувати'])}
    ${box(480, 20, 140, 44, 't', ['PostToolUse', 'форматер, лінтер'])}
    ${arrow('M150 42 L168 42')}${arrow('M310 42 L328 42')}${arrow('M460 42 L478 42')}
    ${box(330, 110, 130, 44, 'p', ['Stop', 'tsc + тести → exit 2'])}
    ${box(170, 110, 140, 44, '', ['SubagentStop', 'перевірка результату'])}
    ${box(480, 110, 140, 44, '', ['PreCompact', 'зберегти прогрес'])}
    ${arrow('M550 64 C550 90 420 90 395 108')}
    ${label(320, 190, 'exit 0 → «немає заперечень»   ·   exit 2 → блокує дію, stderr повертається моделі', 's')}
    ${label(320, 208, 'JSON у stdout: permissionDecision allow | deny | ask, additionalContext', 's')}
    ${label(320, 240, 'CLAUDE.md — порада. Hook — гарантія.', 'h')}
  `),

  // 5. Research → Plan → Implement with compaction
  'rpi-flow': svg(240, `
    ${box(20, 40, 170, 70, 'a', ['1. Research', 'де що лежить, як працює', '→ research.md'])}
    ${box(235, 40, 170, 70, 'p', ['2. Plan', 'кроки, файли, тести', '→ plan.md'])}
    ${box(450, 40, 170, 70, 't', ['3. Implement', 'код за планом', '→ PR + evidence'])}
    ${arrow('M190 75 L233 75', 'a')}${arrow('M405 75 L448 75', 'a')}
    ${label(212, 62, 'compact', 's')}${label(427, 62, 'compact', 's')}
    ${label(105, 135, '👤 review #1', 'h')}${label(320, 135, '👤 review #2', 'h')}${label(535, 135, '👤 review #3', 'h')}
    ${label(105, 152, 'найвищий важіль', 's')}${label(320, 152, 'один рядок плану =', 's')}${label(535, 152, 'найнижчий важіль', 's')}
    ${label(320, 167, 'сотні рядків коду', 's')}
    ${label(320, 210, 'Свіжий контекст на кожній фазі. Артефакти (.md) — пам’ять, що переживає скидання контексту.', 's')}
  `),

  // 6. Ralph loop
  'ralph-loop': svg(250, `
    ${box(20, 90, 150, 60, 'a', ['PROMPT.md / PRD', 'декларативна ціль'])}
    ${box(240, 30, 160, 56, '', ['Свіжий агент', 'нове контекстне вікно'])}
    ${box(240, 165, 160, 56, 't', ['progress.md + git', 'зовнішній стан'])}
    ${box(470, 90, 150, 60, 'p', ['Тести / feature_list', 'умова завершення'])}
    ${arrow('M170 110 C200 90 210 60 238 58', 'a')}
    ${arrow('M400 58 C440 60 460 80 500 90')}
    ${arrow('M545 150 C540 190 460 195 402 193')}
    ${arrow('M240 193 C200 195 180 170 140 150')}
    ${label(320, 125, 'while :; do cat PROMPT.md | agent; done', 'h')}
    ${label(320, 240, 'Один цикл = одна фіча. Читає прогрес → обирає наступне → робить → комітить → оновлює прогрес.', 's')}
  `),

  // 7. Long-running harness (Anthropic)
  'long-running': svg(280, `
    ${box(20, 20, 180, 60, 'a', ['Initializer agent', 'init.sh, feature_list.json,', 'progress.txt, перший commit'])}
    ${box(230, 20, 180, 60, '', ['Сесія N', 'pwd → git log → progress', '→ init.sh → smoke test'])}
    ${box(440, 20, 180, 60, 't', ['Одна фіча', 'реалізує → перевіряє E2E', '→ commit → progress'])}
    ${arrow('M200 50 L228 50')}${arrow('M410 50 L438 50')}
    ${arrow('M530 80 C530 130 320 130 320 80', 'a')}
    ${label(420, 118, 'наступна сесія (новий контекст)', 's')}
    ${box(20, 160, 600, 100, '', ['feature_list.json', '{ "category": "auth", "description": "…", "steps": ["…"], "passes": false }', 'правило: не можна видаляти чи редагувати тести/фічі — лише переводити passes у true', 'кожна сесія завершується у чистому, mergeable стані'], { lh: 18 })}
  `),

  // 8. SDD lifecycle
  'sdd-lifecycle': svg(290, `
    ${box(20, 20, 600, 46, 'a', ['0. Constitution / steering — принципи, стек, команди, межі (один раз, еволюціонує повільно)'])}
    ${box(20, 90, 135, 60, '', ['1. Clarify', 'інтерв’ю, припущення,', '[NEEDS CLARIFICATION]'])}
    ${box(175, 90, 135, 60, 't', ['2. Specify', 'ЩО і ЧОМУ: stories,', 'EARS / Given-When-Then'])}
    ${box(330, 90, 135, 60, 'p', ['3. Plan', 'ЯК: архітектура,', 'дані, контракти'])}
    ${box(485, 90, 135, 60, '', ['4. Tasks', 'атомарні, з ID вимог,', 'шляхами, [P]'])}
    ${arrow('M155 120 L173 120')}${arrow('M310 120 L328 120')}${arrow('M465 120 L483 120')}
    ${box(485, 180, 135, 60, 't', ['5. Implement', 'свіжий контекст,', 'test-first, evidence'])}
    ${box(330, 180, 135, 60, 'warn', ['6. Verify', 'analyze/checklist,', 'adversarial review'])}
    ${box(175, 180, 135, 60, 'a', ['7. Reconcile', 'spec ↔ code diff,', 'archive, replan'])}
    ${arrow('M552 150 L552 178')}${arrow('M483 210 L467 210')}${arrow('M328 210 L312 210')}
    ${arrow('M175 210 C100 210 60 200 60 152', 'a')}
    ${label(320, 270, '👤 human gate після кожного артефакту · масштабуй церемонію під розмір задачі', 's')}
  `),

  // 9. Spec levels
  'spec-levels': svg(220, `
    ${box(20, 30, 180, 80, '', ['Spec-first', 'spec породжує код,', 'далі не підтримується', '(Kiro, Spec Kit за замовч.)'])}
    ${box(230, 30, 180, 80, 't', ['Spec-anchored', 'spec живе поруч із кодом,', 'реконсиляція після змін', '(OpenSpec, BMAD)'])}
    ${box(440, 30, 180, 80, 'p', ['Spec-as-source', 'людина редагує лише spec,', 'код — генерований артефакт', '(Tessl, візія)'])}
    ${arrow('M200 70 L228 70')}${arrow('M410 70 L438 70')}
    ${label(320, 140, 'зростає: витрати на review · ризик дрейфу · вимоги до детермінізму', 's')}
    ${label(320, 170, 'Рекомендація 2026: spec-anchored для більшості команд', 'h')}
    ${label(320, 190, '(Thoughtworks Radar тримає SDD у «Assess»)', 's')}
  `),

  // 10. EARS
  'ears': svg(230, `
    ${box(20, 20, 290, 40, 'a', ['Ubiquitous — The system SHALL …'])}
    ${box(330, 20, 290, 40, 't', ['Event — WHEN &lt;подія&gt; the system SHALL …'])}
    ${box(20, 75, 290, 40, 'p', ['State — WHILE &lt;стан&gt; the system SHALL …'])}
    ${box(330, 75, 290, 40, 'warn', ['Unwanted — IF &lt;умова&gt; THEN the system SHALL …'])}
    ${box(20, 130, 600, 40, '', ['Optional — WHERE &lt;фіча увімкнена&gt; the system SHALL …'])}
    ${label(320, 200, '1 вимога → 1 тест. Домовна мова, без стеку. Кожна має ID (FR-012) для трасування у commit/PR.', 's')}
  `),

  // 11. Orchestrator–worker
  'orchestrator-worker': svg(300, `
    ${box(230, 20, 180, 60, 'a', ['Lead / Orchestrator', 'план, декомпозиція,', 'синтез (сильна модель)'])}
    ${box(20, 140, 140, 64, 't', ['Worker 1', 'свіжий контекст', 'read-only tools'])}
    ${box(180, 140, 140, 64, 't', ['Worker 2', 'свіжий контекст', 'read-only tools'])}
    ${box(340, 140, 140, 64, 't', ['Worker 3', 'свіжий контекст', 'read-only tools'])}
    ${box(500, 140, 120, 64, 'p', ['Verifier', 'лише критерії', '+ артефакт'])}
    ${arrow('M290 80 C200 100 120 110 90 138', 'a')}${arrow('M310 80 C280 100 260 110 250 138', 'a')}${arrow('M340 80 C380 100 400 110 410 138', 'a')}
    ${arrow('M110 204 C150 240 280 250 300 240 C320 230 300 100 300 82')}
    ${label(320, 262, 'бриф воркера: ціль · формат відповіді · які tools · межі · чого НЕ робити', 's')}
    ${label(320, 280, 'воркери повертають стислий підсумок (1–2k токенів) або посилання на артефакт, не сирі дампи', 's')}
    ${label(110, 232, 'summary ↑', 's')}
  `),

  // 12. Single writer
  'single-writer': svg(260, `
    ${box(230, 90, 180, 70, 'a', ['WRITER', 'єдиний, хто змінює код', 'повний контекст задачі'])}
    ${box(20, 20, 160, 56, 't', ['Researcher', 'читає кодову базу'])}
    ${box(20, 170, 160, 56, 't', ['Planner', 'сильніша модель'])}
    ${box(460, 20, 160, 56, 'p', ['Reviewer', 'чистий контекст, ≠ автор'])}
    ${box(460, 170, 160, 56, 'p', ['Verifier', 'запускає тести'])}
    ${arrow('M180 48 C210 60 220 90 250 100')}${arrow('M180 198 C210 190 220 160 250 150')}
    ${arrow('M410 110 C440 90 450 60 480 50', 'a')}${arrow('M410 140 C440 160 450 180 480 190', 'a')}
    ${label(320, 245, '«Читання паралелиться, запис — ні». Паралельні письменники → конфліктні неявні рішення.', 's')}
  `),

  // 13. Manager vs handoffs
  'manager-vs-handoff': svg(250, `
    ${label(160, 22, 'Manager / agents-as-tools', 'h')}
    ${box(90, 40, 140, 50, 'a', ['Manager', 'тримає розмову'])}
    ${box(20, 150, 90, 44, 't', ['A', 'як tool'])}${box(120, 150, 90, 44, 't', ['B', 'як tool'])}${box(220, 150, 90, 44, 't', ['C', 'як tool'])}
    ${arrow('M130 90 L70 148')}${arrow('M160 90 L165 148')}${arrow('M195 90 L260 148')}
    ${arrow('M80 150 L120 92', 'dash')}
    ${label(160, 225, 'контроль, аудит, простий трейс', 's')}
    <path d="M320 20 L320 240" class="ln dash"/>
    ${label(480, 22, 'Handoffs / swarm', 'h')}
    ${box(350, 100, 80, 44, 'p', ['Triage'])}${box(450, 40, 80, 44, 'p', ['Billing'])}${box(450, 160, 80, 44, 'p', ['Support'])}${box(550, 100, 80, 44, 'p', ['Refund'])}
    ${arrow('M430 112 L450 70')}${arrow('M430 132 L450 175')}${arrow('M530 62 L555 100')}${arrow('M530 180 L555 144')}
    ${arrow('M490 84 L490 158', 'bad')}
    ${label(490, 225, 'менше викликів, але ризик «пінг-понгу»', 's')}${label(490, 240, '→ handoff_count ≤ 3', 's')}
  `),

  // 14. MAST failure taxonomy
  'mast': svg(250, `
    ${box(20, 20, 190, 120, 'bad', ['Спец/дизайн — 44 %', 'порушення спеки задачі 12 %', 'повторення кроків 16 %', 'не знає умови зупинки 12 %', 'втрата історії 3 %'], { lh: 17 })}
    ${box(225, 20, 190, 120, 'warn', ['Міжагентна неузгодж. — 32 %', 'reasoning ≠ action 13 %', 'збочення з задачі 7 %', 'не питає уточнень 7 %', 'ігнорує інпут іншого 2 %'], { lh: 17 })}
    ${box(430, 20, 190, 120, 'p', ['Верифікація — 24 %', 'некоректна перевірка 9 %', 'відсутня перевірка 8 %', 'передчасне завершення 6 %', ''], { lh: 17 })}
    ${label(320, 170, 'MAST (Cemri et al., NeurIPS 2025): 1 600+ трейсів, 7 фреймворків, κ = 0.88', 's')}
    ${label(320, 190, 'Висновок: збої — це проблеми організаційного дизайну, а не лише «слабкої моделі».', 's')}
    ${label(320, 222, 'Ліки: явні ролі й умови зупинки · структурований протокол · виконувана верифікація', 'h')}
  `),

  // 15. Topology vs task
  'topology-task': svg(230, `
    ${box(20, 30, 290, 70, 'ok', ['Декомпозована / паралельна задача', 'централізований оркестратор: до +81 %', 'помилки ×4.4 (vs ×17 у незалежних)'])}
    ${box(330, 30, 290, 70, 'bad', ['Строго послідовна задача', 'будь-який мультиагент: −39…−70 %', 'координація дробить міркування'])}
    ${label(320, 130, 'Google Research / MIT, «Towards a Science of Scaling Agent Systems» (2025–26)', 's')}
    ${label(320, 160, 'Обирай топологію за властивостями задачі:', 'h')}
    ${label(320, 180, 'декомпозованість · послідовні залежності · кількість tools', 's')}
    ${label(320, 210, 'а не за принципом «більше агентів = краще»', 's')}
  `),

  // 16. Evals loop
  'evals-loop': svg(240, `
    ${box(20, 30, 130, 56, 'a', ['Трейси', 'логи, tool calls'])}
    ${box(180, 30, 130, 56, '', ['Error analysis', 'open → axial coding'])}
    ${box(340, 30, 130, 56, 'p', ['LLM-as-judge', 'валідований на людях'])}
    ${box(500, 30, 120, 56, 't', ['CI regression', 'на кожну зміну'])}
    ${arrow('M150 58 L178 58')}${arrow('M310 58 L338 58')}${arrow('M470 58 L498 58')}
    ${box(180, 130, 290, 56, 'warn', ['Зміни harness / промпту / топології', 'одна змінна за раз, A/B на 20+ задачах'])}
    ${arrow('M560 86 C560 120 500 158 472 158')}
    ${arrow('M180 158 C120 158 85 120 85 88', 'a')}
    ${label(320, 220, 'Оцінюй кінцевий стан для відкритих задач і траєкторію (milestones) — для процесу', 's')}
  `),

  // 17. Security layers
  'security-layers': svg(260, `
    ${box(20, 20, 600, 40, 'bad', ['Загрози: prompt injection (issue/PR/web/MCP-опис) · tool abuse · ексфільтрація секретів · supply chain'])}
    ${box(20, 80, 190, 60, 'a', ['Ізоляція', 'sandbox FS + мережа,', 'allowlist доменів'])}
    ${box(225, 80, 190, 60, 't', ['Найменші привілеї', 'tool allowlists, read-only', 'субагенти, scoped MCP'])}
    ${box(430, 80, 190, 60, 'p', ['Детерміновані ґейти', 'PreToolUse hooks, CI,', 'захищені директорії'])}
    ${box(20, 160, 290, 60, '', ['Недовірений вхід', 'повідомлення між агентами = дані,', 'не інструкції; сканування виводу'])}
    ${box(330, 160, 290, 60, '', ['Людина у контурі', 'для незворотних дій: push, deploy,', 'платежі, видалення'])}
    ${label(320, 245, 'Втома від permission-prompts → люди ставлять «так» не читаючи. Заміняй промпти структурою.', 's')}
  `),

  // 18. Subagents vs teams vs worktrees
  'delegation-options': svg(250, `
    ${box(20, 20, 190, 100, 'a', ['Subagent', 'повертає результат у батька', 'свіжий контекст, дешевше', 'фонові, вкладеність ≤3', 'для: пошук, тести, review'], { lh: 16 })}
    ${box(225, 20, 190, 100, 'p', ['Agent Team', 'повні сесії + task list', '+ mailbox, самокоординація', '~7× токенів', 'для: паралельний review, дебати'], { lh: 16 })}
    ${box(430, 20, 190, 100, 't', ['Worktree', 'ізоляція файлів/гілки', '.claude/worktrees/&lt;name&gt;', 'isolation: worktree', 'для: паралельні фічі'], { lh: 16 })}
    ${label(320, 150, 'Комбінуй: team → кожен teammate у своєму worktree → subagents для верифікації', 's')}
    ${label(320, 185, 'Правила: 3–5 teammates · 5–6 задач на кожного · жодних двох агентів в одному файлі', 'h')}
    ${label(320, 210, 'починай з read-only задач · quality gates через hooks (exit 2 = відхилити з фідбеком)', 's')}
  `),

  // 19. Vibe -> engineering ladder
  'ladder': svg(230, `
    ${box(20, 130, 180, 70, 'warn', ['1. Vibe coding', 'промпт → код → «працює?»', 'нема тестів, нема spec'])}
    ${box(230, 80, 180, 70, 't', ['2. Vibe engineering', 'plan mode, CLAUDE.md,', 'review, тести, hooks'])}
    ${box(440, 30, 180, 70, 'a', ['3. Agentic engineering', 'spec, harness, субагенти,', 'evals, sandbox, метрики'])}
    ${arrow('M200 165 L228 130', 'a')}${arrow('M410 115 L438 80', 'a')}
    ${label(320, 220, 'Той самий інструмент — різна дисципліна. Курс веде з рівня 1 на рівень 3.', 's')}
  `),

  // 20. CLAUDE.md structure
  'claude-md': svg(260, `
    ${box(20, 20, 280, 220, 'a', ['CLAUDE.md / AGENTS.md (&lt; 60–100 рядків)', '', '• команди з прапорцями (build/test/lint)', '• нестандартні конвенції', '• межі: always / ask / never', '• «не роби X, бо Y, натомість Z»', '• @-імпорти глибших доків', '', 'НЕ: огляд репо, те, що видно з коду,', 'стандартні практики, файл-за-файлом'], { lh: 19 })}
    ${box(340, 20, 280, 60, '', ['docs/design-docs/', 'архітектура, ADR'])}
    ${box(340, 95, 280, 60, '', ['docs/exec-plans/', 'активні та завершені плани'])}
    ${box(340, 170, 280, 60, '', ['docs/references/, .claude/rules/', 'LLM-оптимізовані довідки, path-scoped'])}
    ${arrow('M300 60 L338 50', 'a')}${arrow('M300 120 L338 125', 'a')}${arrow('M300 180 L338 200', 'a')}
  `),
};
