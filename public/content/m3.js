export default {
  id: 'm3',
  icon: '📐',
  title: 'Spec-Driven Development',
  subtitle: 'Специфікація як джерело правди: життєвий цикл, шаблони, EARS, Spec Kit / Kiro / OpenSpec / BMAD / Tessl, реконсиляція.',
  intro: `«Специфікації не служать коду — код служить специфікаціям» (GitHub Spec Kit). Sean Grove (OpenAI): код — 10–20 % цінності, решта — структурована комунікація. Але Thoughtworks тримає SDD у «Assess», а один експеримент показав 10-кратне сповільнення. Розберемось, коли воно того варте.`,
  lessons: [
    {
      id: 'm3l1',
      title: 'Навіщо spec і три рівні SDD',
      minutes: 16,
      md: `
## Теза

Sean Grove (OpenAI, AI Engineer World's Fair 2025): написання коду — 10–20 % цінності інженера; 80–90 % — розуміння користувачів, планування, комунікація, верифікація. Spec — джерело; код — «lossy projection» з нього. Один spec може компілюватися у TypeScript, Rust, документацію й туторіал. OpenAI Model Spec — приклад: markdown, кожен пункт має ID, прив'язаний до тестових промптів, версіонується з changelog.

DeepLearning.AI (з JetBrains): «spec — мозок, агент — м'язи». Spec — «стійкий артефакт, що переживає скидання контексту», знижує «когнітивний борг» і підвищує «вірність наміру».

## Три рівні (Böckeler, 2025-10)

[[diagram:spec-levels|Spec-first → spec-anchored → spec-as-source: зростають review, ризик дрейфу й вимоги до детермінізму.]]

- **Spec-first** — spec породжує код і далі не підтримується (Kiro за замовчуванням, Spec Kit).
- **Spec-anchored** — spec живе поруч із кодом і реконсилюється після змін (OpenSpec, BMAD, Kiro з Sync).
- **Spec-as-source** — люди редагують лише spec, код генерується (Tessl: \`// GENERATED FROM SPEC — DO NOT EDIT\`, 1:1 spec ↔ файл).

Консенсус 2026: spec-anchored для більшості команд. Spec-as-source стикається з недетермінізмом (той самий spec → різний код) і повторює історію Model-Driven Development.

## Коли SDD варте зусиль

**Так**: фіча охоплює 2+ сесії й багато файлів; регульовані домени, де потрібна трасованість; кілька людей/агентів працюють паралельно; greenfield із високою невизначеністю; «creative exploration» — кілька реалізацій з одного spec (Rust vs Go, різні UX).

**Ні**: правка одного файлу; прототип на день; задача, яку легше показати, ніж описати. Kiro має Quick Spec, BMAD — Quick Flow, Anthropic каже «якщо diff — одне речення, план не потрібен». Масштабуй церемонію під задачу.

## Чесна критика

Colin Eberhardt (Scott Logic, 2025-11) прогнав Spec Kit на 1 000-рядковій фічі: constitution 161 рядок, spec 230, plan 2 067, tasks 66 кроків; ~3.5 год і 2 577 рядків markdown проти ~25 хв ітеративним промптингом. Висновки: «faux context», дублювання, spec як markdown не має формальності коду («code is law»), моделі натреновані на коді, а не на markdown. Thoughtworks: ризики — недетермінізм, дрейф spec, галюцинації; потрібен сильний CI/CD.

Ці критики не заперечують ідею — вони заперечують «водоспад» із 8 файлами на фічу. Правильна відповідь — right-sized process.

:::tip Правило розміру
Spec — 1–3 сторінки. Якщо більше — розбий на кілька deltas/stories. Якщо менше сторінки — можливо, spec не потрібен.
:::
`,
      tasks: [
        { id: 'm3l1t1', kind: 'reflect', title: 'Де твоя команда на трьох рівнях', md: `Опиши, як зараз у твоїй команді співвідносяться spec і код: чи є spec узагалі, хто його читає після реалізації, чи оновлюють. Який рівень (first / anchored / as-source) реалістичний за 3 місяці і чому?` },
        { id: 'm3l1t2', kind: 'practice', title: 'Right-sizing', md: `Візьми 10 останніх задач із трекера. Для кожної познач: «одне речення» (без spec), «quick spec» (½ сторінки), «повний spec» (1–3 сторінки + план). Яка пропорція? Це визначить, скільки церемонії тобі реально потрібно.` },
      ],
      quiz: [
        { q: 'Що означає «spec-anchored»?', options: ['Spec пишеться раз і забувається', 'Spec живе поруч із кодом і оновлюється після реалізації', 'Люди редагують лише spec'], answer: 1, explain: 'Рекомендований рівень 2026 для більшості команд.' },
        { q: 'Головна претензія Eberhardt до Spec Kit?', options: ['Погана якість коду', 'Надмірні артефакти й ~10× сповільнення на середній фічі; markdown не має формальності коду', 'Не підтримує Python'], answer: 1, explain: 'Критика — про масштаб церемонії, не про ідею spec.' },
      ],
      sources: [
        { t: 'Sean Grove (OpenAI) — The New Code: Specifications as the fundamental unit', u: 'https://www.youtube.com/watch?v=8rABwKRsec4', d: 'AI Engineer World’s Fair, 2025-06' },
        { t: 'Birgitta Böckeler — Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl', u: 'https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html', d: '2025-10-15' },
        { t: 'Scott Logic — Putting Spec Kit Through Its Paces', u: 'https://blog.scottlogic.com/2025/11/26/putting-spec-kit-through-its-paces-radical-idea-or-reinvented-waterfall.html', d: '2025-11-26' },
        { t: 'Thoughtworks — Spec-driven development: unpacking one of 2025’s key practices', u: 'https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices', d: '2025-12-04' },
        { t: 'DeepLearning.AI × JetBrains — Spec-Driven Development with Coding Agents', u: 'https://www.deeplearning.ai/courses/spec-driven-development-with-coding-agents', d: '2026' },
      ],
    },
    {
      id: 'm3l2',
      title: 'Канонічний життєвий цикл SDD',
      minutes: 18,
      md: `
## Об’єднання всіх інструментів

Spec Kit, Kiro, OpenSpec, BMAD, DeepLearning.AI, Anthropic — усі описують варіанти одного циклу.

[[diagram:sdd-lifecycle|Constitution → Clarify → Specify → Plan → Tasks → Implement → Verify → Reconcile. Human gate після кожного артефакту.]]

### 0. Constitution / steering (один раз)

Принципи, стек, команди, політика тестування, приклад стилю, межі always/ask/never — з причинами. У Spec Kit — \`memory/constitution.md\` (9 статей: library-first, CLI interface, test-first, simplicity gate ≤ 3 проєктів, anti-abstraction, integration-first testing); у Kiro — \`.kiro/steering/product.md, tech.md, structure.md\`; у DeepLearning.AI — \`mission.md, tech-stack.md, roadmap.md\`; у Claude Code — CLAUDE.md. Для brownfield: реверс-інжиніринг constitution з наявного коду (BMAD project-context, DLAI урок «Legacy support»).

### 1. Clarify

Інтерв'ю: агент ставить питання, доки не закриє невизначеності. Spec Kit \`/speckit.clarify\` (до ~5 цільових питань), OpenSpec \`/opsx:explore\`, Ryan Carson — «спершу уточнювальні питання», Anthropic — «Interview me… using AskUserQuestion». Результат: список припущень і маркери \`[NEEDS CLARIFICATION: питання]\` замість правдоподібних, але хибних припущень. Ґейт: жодного маркера не лишилось.

### 2. Specify — ЩО і ЧОМУ, без стеку

User stories з пріоритетами (P1–P3), кожна **незалежно тестована**; acceptance scenarios (EARS або Given/When/Then); edge cases; функціональні вимоги FR-001…; success criteria SC-001… — вимірювані й технологічно нейтральні; non-goals; assumptions.

### 3. Plan — ЯК

Архітектура, модель даних, контракти API/подій, research-нотатки, стратегія тестування, перевірка на відповідність constitution (Spec Kit: «Phase −1 gates»), таблиця виправданих відхилень (Complexity Tracking).

### 4. Tasks

Атомарні, впорядковані, з залежностями, маркером паралельності \`[P]\`, посиланням на story/вимогу й точним шляхом файлу: \`- [ ] T012 [P] [US1] Додати валідацію у src/auth/validate.ts\`. Фази: Setup → Foundational → по story (тести спершу, checkpoint) → Polish. MVP = лише US1.

### 5. Implement

Свіжий контекст на фічу/задачу; test-first (RED → GREEN → REFACTOR); одна підзадача за раз із паузою (Carson) або автономний прогін «хвилями» (Kiro) з hooks; докази, а не запевнення.

### 6. Verify

Крос-артефактна консистентність: \`/speckit.analyze\`, \`/speckit.checklist\` («юніт-тести для spec»), Kiro Analyze Requirements, BMAD \`/check-implementation-readiness\` + \`/code-review\`, adversarial-субагент проти PLAN.md.

### 7. Reconcile → Archive → Replan

Diff spec vs код → вирішити, хто правий → оновити spec → закомітити разом. OpenSpec \`/opsx:sync\` + \`/opsx:archive\` зливає delta у системний spec; Kiro Refine / Sync Files; community \`/speckit.reconcile\`; BMAD оновлює PRD/architecture з learnings. Потім — replan roadmap (DLAI) і фідбек з продакшену у наступний spec.

:::warn Дрейф — режим за замовчуванням
Жоден інструмент не реконсилює автоматично. Якщо крок 7 не заплановано явно — через місяць spec бреше.
:::
`,
      tasks: [
        { id: 'm3l2t1', kind: 'build', title: 'Constitution для навчального репо', md: `Напиши constitution (або steering) на 1 сторінку: місія, стек із версіями, команди, політика тестів, один приклад стилю, межі always/ask/never з причинами, як вносити зміни. Для brownfield — дай агенту спершу згенерувати чернетку з коду, потім обріж.` },
        { id: 'm3l2t2', kind: 'practice', title: 'Повний цикл на одній фічі', md: `Проведи одну фічу через усі 7 кроків (можна без інструмента, просто файлами spec.md / plan.md / tasks.md). Заміряй час на кожен крок і на review. Порівняй із оцінкою «як зробив би ітеративним промптингом». Запиши, де були найбільші втрати й найбільша користь.` },
      ],
      quiz: [
        { q: 'Що робити з невизначеністю на етапі Specify?', options: ['Дозволити агенту зробити правдоподібне припущення', 'Позначити [NEEDS CLARIFICATION] і не переходити до Plan, доки маркер не знято', 'Відкласти до реалізації'], answer: 1, explain: 'Правдоподібні-але-хибні припущення — головне джерело дорогих помилок.' },
        { q: 'Що містить етап Specify, а що — Plan?', options: ['Specify — стек і архітектуру; Plan — user stories', 'Specify — ЩО і ЧОМУ (stories, критерії, без стеку); Plan — ЯК (архітектура, дані, контракти)', 'Немає різниці'], answer: 1, explain: 'Розділення WHAT і HOW — базове правило всіх SDD-інструментів.' },
        { q: 'Що таке реконсиляція?', options: ['Видалення spec після реалізації', 'Звірка spec із фінальним кодом, оновлення spec і спільний коміт', 'Повторна генерація коду'], answer: 1, explain: 'Без неї spec дрейфує; жоден інструмент не робить це автоматично.' },
      ],
      sources: [
        { t: 'GitHub Spec Kit — Specification-Driven Development (методологія)', u: 'https://github.com/github/spec-kit/blob/main/spec-driven.md' },
        { t: 'Kiro — Specs docs (requirements / design / tasks)', u: 'https://kiro.dev/docs/specs/' },
        { t: 'OpenSpec — repository', u: 'https://github.com/Fission-AI/OpenSpec' },
        { t: 'BMAD Method — docs', u: 'https://docs.bmad-method.org/' },
        { t: 'dev.to — Spec-Driven Development in 2026: What It Is, the Tooling, and How Teams Actually Use It', u: 'https://dev.to/krlz/spec-driven-development-in-2026-what-it-is-the-tooling-and-how-teams-actually-use-it-2fk2', d: '2026-06-19' },
      ],
    },
    {
      id: 'm3l3',
      title: 'Як писати spec: EARS, Given/When/Then, шаблони',
      minutes: 20,
      md: `
## Вимога, яку можна перевірити

Thoughtworks: spec має визначати зовнішню поведінку — відображення входів/виходів, пре-/постумови, інваріанти, обмеження, типи інтерфейсів, контракти інтеграцій, стани. Домовна мова, напівструктурований формат. BDD-приклади працюють як few-shot для агента.

## EARS (Kiro, 2026)

[[diagram:ears|П’ять шаблонів EARS: кожна вимога має форму, що мапиться на один тест.]]

Приклад: «WHEN користувач надсилає форму з невалідними даними THE SYSTEM SHALL показати помилки валідації поруч із відповідними полями». Для bugfix-spec Kiro додає «WHEN … THE SYSTEM SHALL CONTINUE TO …» — фіксує незмінну поведінку проти регресій.

## Given / When / Then

Spec Kit, OpenSpec: \`### Requirement: назва\` + SHALL-твердження + \`#### Scenario:\` WHEN/THEN. OpenSpec робить delta-spec: \`## ADDED / MODIFIED / REMOVED Requirements\` — при архівації зливається у системний spec, і документація накопичується.

## Від розпливчастого до вимірюваного (Osmani)

| Погано | Добре |
|---|---|
| «API має працювати добре» | «помилки повертають \`{"error": "message"}\`; див. §3.2» |
| «швидший дашборд» | «LCP < 2.5 с на 4G, initial load < 500 мс, CLS < 0.1» |
| «зроби безпечно» | «усі endpoints під /admin вимагають роль admin; тест T-SEC-01» |

## Шаблон feature spec (дистильований)

\`\`\`markdown
# Feature: <назва> (ID)
## Проблема / Чому це важливо
## Goals · Non-goals (поза скоупом)
## Користувачі та user stories (P1–P3, кожна незалежно тестована)
## Acceptance scenarios (EARS або Given/When/Then)
## Edge cases, помилки, деградовані стани, таймаути
## Функціональні вимоги FR-001…  · Нефункціональні
## Ключові сутності / дані · Інтерфейси та контракти
## Success criteria SC-001… (вимірювані, без стеку)
## Assumptions · Open questions [NEEDS CLARIFICATION]
\`\`\`

## Шаблон task

Опис · acceptance conditions · метод верифікації · файли. Рядок: \`- [ ] T### [P] [US#] дієслово + шлях\`.

## Дрібниці, що вирішують

- **«Why this matters» і Non-goals** — без них «зелені тести, неправильна поведінка» (dev.to, 2026).
- **Edge cases як питання**: «Що, якщо токен протух посеред завантаження?»
- **ID у комітах**: \`feat(auth): FR-012 password reset\` — трасованість безкоштовно.
- **Не перетворюй spec на псевдокод** — стек і алгоритми належать плану.
- Skill Osmani має 6 обов'язкових зон: команди, тестування, структура, стиль з прикладом, git workflow, межі.
`,
      tasks: [
        { id: 'm3l3t1', kind: 'build', title: 'Spec на 1–2 сторінки', md: `Обери фічу середнього розміру. Напиши spec за шаблоном: ≥ 3 user stories з пріоритетами, ≥ 6 EARS-вимог, ≥ 4 edge cases, ≥ 3 вимірюваних success criteria, non-goals, assumptions. Дай агенту згенерувати тести лише зі spec (без коду). Скільки тестів мапляться 1:1 на вимоги?` },
        { id: 'm3l3t2', kind: 'practice', title: 'Переписати розпливчасте', md: `Візьми 5 реальних тікетів із розпливчастими формулюваннями («покращити», «зробити зручніше») і перепиши кожен у 1–3 EARS-вимоги з вимірюваним критерієм. Покажи автору тікета — чи погоджується, що це те, що він мав на увазі?` },
      ],
      quiz: [
        { q: 'Яка перевага EARS-формату для агента?', options: ['Коротший текст', 'Кожна вимога має форму, що мапиться на один тест і трасується за ID', 'Не потребує review'], answer: 1, explain: '1 вимога → 1 тест; ID у комітах.' },
        { q: 'Що належить до spec, а що — до плану?', options: ['Spec — алгоритм і стек; план — user stories', 'Spec — поведінка, критерії, межі; план — стек, архітектура, дані', 'Все у spec'], answer: 1, explain: 'Псевдокод у spec — антипатерн.' },
        { q: 'Чому важливі Non-goals?', options: ['Для довжини документа', 'Без них агент реалізує «зайве» або інтерпретує скоуп ширше, і тести зелені, а поведінка не та', 'Це вимога Spec Kit'], answer: 1, explain: 'Non-goals і «why this matters» — найдешевший захист від правильно-неправильного коду.' },
      ],
      sources: [
        { t: 'Kiro — Feature specs & EARS best practices', u: 'https://kiro.dev/docs/specs/best-practices/' },
        { t: 'Spec Kit — spec-template.md', u: 'https://raw.githubusercontent.com/github/spec-kit/main/templates/spec-template.md' },
        { t: 'Addy Osmani — How to write a good spec for AI agents', u: 'https://addyosmani.com/blog/good-spec/', d: '2026-01-13' },
        { t: 'Addy Osmani — spec-driven-development skill', u: 'https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md' },
        { t: 'OpenSpec — delta specs (Anton Gubarenko tutorial)', u: 'https://antongubarenko.substack.com/p/spec-driven-development-with-opensec', d: '2026-04-07' },
      ],
    },
    {
      id: 'm3l4',
      title: 'Інструменти: Spec Kit, Kiro, OpenSpec, BMAD, Tessl',
      minutes: 18,
      md: `
## Порівняння

| | Spec Kit (GitHub) | Kiro (AWS) | OpenSpec (Fission) | BMAD v6 | Tessl |
|---|---|---|---|---|---|
| Тип | OSS CLI \`specify\` (Python/uv), 30+ агентів | Agentic IDE + CLI, платні тарифи | OSS npm CLI, 30+ агентів | OSS, мультиагентні персони | Комерційна платформа, Framework у beta (JS) |
| Пам'ять | \`memory/constitution.md\` | steering product/tech/structure + hooks | \`openspec/specs/\` + config.yaml | project-context, PRD, architecture | KNOWLEDGE.md, AGENTS.md, registry |
| Цикл | constitution → specify → clarify → plan → tasks → analyze → implement → checklist | requirements → design → tasks → execute (хвилі); Quick Spec; bugfix | explore → propose → apply → verify/sync → archive | Analysis → Planning → Solutioning → Implementation; Quick Flow | plan → spec → tests → \`tessl build\` |
| Формат вимог | stories + Given/When/Then, FR/SC ID | EARS | Requirement + Scenario, delta ADDED/MODIFIED/REMOVED | PRD, epics, stories з AC | spec-файли з @generate/@test |
| Артефактів на фічу | 8+ на окремій гілці | 3 | 4, зливаються при archive | brief, PRD, architecture, stories, sprint-status | spec ↔ файл 1:1 |
| Рівень | spec-first | spec-first (+Sync) | spec-anchored | spec-first/anchored | anchored/as-source |
| Найкраще для | greenfield, кілька варіантів з одного spec | AWS/IDE, автономні прогони | brownfield, інкрементальні зміни, низька церемонія | регульовані домени, повна трасованість | знання про бібліотеки (registry) |
| Критика | багатослівно, review fatigue, гілка на spec не накопичує | lock-in, надмірно для дрібного | один агент, spec не оновлюється сам | токени, множник процесу | недетермінізм, closed beta |

## Вибір (dev.to, 2026-04)

Є кодова база → OpenSpec. Greenfield → Spec Kit. Compliance/audit → BMAD. Не впевнений → OpenSpec. І головне — **використовуй один інструмент місяць**, а не перебирай.

## Що варто знати про кожен

**Spec Kit**: \`uv tool install specify-cli\`, \`specify init --integration claude\`; slash-команди \`/speckit.*\`; три режими (0-to-1, creative exploration, brownfield); Extensions/Presets/Bundles; community \`/speckit.reconcile\` для дрейфу.

**Kiro**: три файли у \`.kiro/specs/<feature>/\`; approval gates між requirements → design → tasks; Quick Spec без ґейтів; виконання задач «хвилями» за графом залежностей; \`#spec\` у чаті; hooks на події файлів (оновити design.md, README, PR-опис із requirements). Кейс AWS: 3 розробники × 21 день, Kiro написав > 95 % бізнес-логіки.

**OpenSpec**: \`npm i -g @fission-ai/openspec\`; \`/opsx:propose\` створює proposal.md + delta spec + design.md + tasks.md; config.yaml задає правила на артефакт («use Given/When/Then», «keep tasks small»); «bigger than a one-file change, smaller than a full RFC».

**BMAD**: 8 агентів (Analyst, PM, UX, Architect, SM, Dev, QA, Solo Dev); Quick Flow = \`/quick-spec → /dev-story → /code-review\` для < 3 файлів; sprint-status.yaml як єдине джерело правди; свіжий чат на кожен workflow.

**Tessl**: registry версійно-точних usage-spec бібліотек («npm для знань») проти галюцинацій; Framework з генерацією коду зі spec — поки closed beta.

## Легкі альтернативи без фреймворку

Anthropic explore → plan → implement + інтерв'ю → SPEC.md + adversarial review; Ryan Carson — три промпт-файли (create-prd, generate-tasks, process-task-list) з паузою «Go» після parent tasks; Osmani skill; DLAI constitution + feature loop як Agent Skills.
`,
      tasks: [
        { id: 'm3l4t1', kind: 'practice', title: 'Один інструмент, одна фіча', md: `Обери інструмент за правилом вибору (або легку альтернативу). Проведи одну фічу від proposal/specify до archive/reconcile. Запиши: скільки артефактів, скільки рядків, скільки часу на review, чи спрацював reconcile. Що залишиш, що викинеш?` },
        { id: 'm3l4t2', kind: 'reflect', title: 'Порівняння з поточним процесом', md: `Порівняй артефакти інструмента з тим, що твоя команда і так пише (тікети, RFC, ADR). Що дублюється? Чи можна замінити частину артефактів наявними? Напиши план «мінімальний SDD для нас».` },
      ],
      quiz: [
        { q: 'Який інструмент рекомендують для існуючої кодової бази з інкрементальними змінами?', options: ['Spec Kit', 'OpenSpec', 'Tessl'], answer: 1, explain: 'OpenSpec — delta specs, низька церемонія, «built for brownfield».' },
        { q: 'Що робить OpenSpec /opsx:archive?', options: ['Видаляє spec', 'Зливає delta-spec у системний spec, накопичуючи документацію', 'Створює гілку'], answer: 1, explain: 'Це реалізація spec-anchored: система правди накопичується.' },
      ],
      sources: [
        { t: 'GitHub Spec Kit', u: 'https://github.com/github/spec-kit' },
        { t: 'Den Delimarsky — Diving Into Spec-Driven Development With GitHub Spec Kit', u: 'https://developer.microsoft.com/blog/spec-driven-development-spec-kit/', d: '2025-09-15' },
        { t: 'AWS — From spec to production: three-week drug discovery agent using Kiro', u: 'https://aws.amazon.com/blogs/industries/from-spec-to-production-a-three-week-drug-discovery-agent-using-kiro/', d: '2026-02-18' },
        { t: 'BMAD-Method workflows deep dive (Brian Spann)', u: 'https://dev.to/bspann/bmad-method-workflows-deep-dive-from-idea-to-production-part-2-5od', d: '2026-04-07' },
        { t: 'Tessl — How Tessl’s products pioneer spec-driven development', u: 'https://tessl.io/blog/how-tessls-products-pioneer-spec-driven-development', d: '2025-09-16' },
        { t: 'Ryan Carson — ai-dev-tasks', u: 'https://github.com/snarktank/ai-dev-tasks' },
        { t: 'dev.to — Spec Kit vs BMAD vs OpenSpec: Choosing an SDD Framework in 2026', u: 'https://dev.to/willtorber/spec-kit-vs-bmad-vs-openspec-choosing-an-sdd-framework-in-2026-d3j', d: '2026-04-23' },
      ],
    },
    {
      id: 'm3l5',
      title: 'Реконсиляція, антипатерни та SDD у команді',
      minutes: 14,
      md: `
## Цикл реконсиляції

1. Після реалізації порівняй spec із фінальним кодом (агент робить diff-звіт).
2. Для кожної розбіжності вирішуй: **код адаптувався правильно** (оновити spec) чи **код неправильний** (виправити код).
3. Онови spec тим самим PR; закоміть разом; згадай ID вимог у повідомленні.
4. Заархівуй delta (OpenSpec) або запусти Sync (Kiro), оновлюй roadmap.

Це те, що робить spec «anchored». Пропусти — і через місяць spec бреше, а агент, що читає його як правду, зробить гірше, ніж без spec.

## Антипатерни

- **Waterfall freeze** — гігантський spec наперед, без ітерацій.
- **Artifact bloat / faux context** — тисячі рядків markdown, які ніхто не рев'юїть.
- **Псевдокод у spec** — стек і алгоритми там, де мають бути поведінка й критерії.
- **Пропущений clarify** — правдоподібні-хибні припущення.
- **Зелені тести, не та поведінка** — нема «why» і non-goals, нема edge cases, таймаутів, деградованих станів.
- **Test masking** — агент послаблює тести замість виправлення коду.
- **Над-довгий constitution** — правила губляться після компакції.
- **Framework shopping** — щотижня новий інструмент.
- **Очікування детермінізму** — той самий spec ≠ той самий код; це нормально, поки тести зелені.

## SDD у команді

- Spec комітиться разом із кодом; один spec на область фічі, щоб паралельна робота не конфліктувала.
- Ролі: PM/аналітик пише «ЩО», інженер — «ЯК»; агент — обидва чернеткою, людина — review. Böckeler зауважує, що модель PM–dev колаборації у SDD-інструментах ще нечітка — домовтесь явно.
- Review тепер — найдорожча частина. Плануйте час на нього; Böckeler закликає до кращого UX для review spec.
- Кроссрепо: OpenSpec Stores, Kiro через git submodules — спільні spec для мікросервісів.
- Constitution правила: «Don't do X because Y, instead Z» — тільки так вони виконуються.

## Replanning і «build your own workflow» (DeepLearning.AI)

Після кожної фічі — **replanning**: оновити roadmap.md (що зроблено, що змінилося у пріоритетах), покращити автоматизацію (які кроки процесу повторювалися → запакувати як skill: \`skills/feature-spec\`, \`skills/changelog\`, \`skills/validate\`). Так SDD-процес стає портативним «інструментом агента», що переживає зміну самого агента (agent replaceability, Модуль 0.3). Для legacy: спершу реверс-інжиніринг constitution з коду, потім перша фіча за новим процесом.

## Зв'язок із harness

Spec — це guide (feedforward). Тести, згенеровані зі spec, — sensor. Adversarial review проти spec — інференційний sensor. Reconcile — steering loop. SDD і harness engineering — не конкуренти, а два боки одного процесу.
`,
      tasks: [
        { id: 'm3l5t1', kind: 'build', title: 'Reconcile-скрипт або skill', md: `Напиши skill/команду «reconcile»: агент читає spec і diff гілки, складає таблицю розбіжностей (вимога → статус: реалізовано / змінено / відсутнє / зайве), пропонує правки до spec. Прожени на фічі з уроку 3.4.` },
        { id: 'm3l5t2', kind: 'reflect', title: 'Домовленість про ролі', md: `Напиши для своєї команди півсторінки: хто пише spec, хто рев'юїть, коли spec обов'язковий, як реконсилюємо, де живуть spec. Обговори з командою; запиши, що змінилося після обговорення.` },
      ],
      quiz: [
        { q: 'Що є «режимом збою за замовчуванням» SDD?', options: ['Забагато тестів', 'Дрейф spec: код змінився, spec — ні', 'Надто короткі spec'], answer: 1, explain: 'Реконсиляція — обов’язковий крок, а не опція.' },
        { q: 'Як співвідносяться SDD і harness engineering?', options: ['Конкурують', 'Spec — guide, тести зі spec — sensors, reconcile — steering loop; це два боки одного процесу', 'SDD замінює harness'], answer: 1, explain: 'Модуль 2 і Модуль 3 описують одну систему з різних сторін.' },
      ],
      sources: [
        { t: 'dev.to — Spec Kit vs BMAD vs OpenSpec (reconciliation loop, pitfalls)', u: 'https://dev.to/willtorber/spec-kit-vs-bmad-vs-openspec-choosing-an-sdd-framework-in-2026-d3j', d: '2026-04-23' },
        { t: 'Birgitta Böckeler — Understanding SDD (concerns, recommendations)', u: 'https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html', d: '2025-10-15' },
        { t: 'Kiro — Specs best practices (team practice, sync)', u: 'https://kiro.dev/docs/specs/best-practices/' },
        { t: 'Anthropic — Claude Code Best Practices (adversarial review)', u: 'https://code.claude.com/docs/en/best-practices' },
      ],
    },
  ],
};
