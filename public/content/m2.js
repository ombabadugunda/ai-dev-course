export default {
  id: 'm2',
  icon: '🛠️',
  title: 'Harness Engineering',
  subtitle: 'Guides і sensors, hooks, permissions, sandbox, дизайн tools, цикли верифікації, довготривалі агенти, observability.',
  intro: `Термін популяризував пост OpenAI у лютому 2026. Суть: інженер більше не пише код — він проєктує середовище, у якому агент не може не написати правильний код. «Humans steer. Agents execute.»`,
  lessons: [
    {
      id: 'm2l1',
      title: 'Що таке harness і чому це нова роль інженера',
      minutes: 18,
      md: `
## Визначення

Harness — усе навколо моделі, що визначає її поведінку в задачі: системний промпт і файли інструкцій, tools і MCP, дозволи й sandbox, hooks, стратегія контексту, пам'ять, планувальні примітиви, цикли верифікації, observability, оркестрація. LangChain: «системна побудова інструментарію навколо моделі для оптимізації якості, токенів і латентності».

Лінія еволюції: prompt engineering (одне повідомлення) → context engineering (одне вікно) → harness engineering (уся система на весь життєвий цикл задачі, багато вікон).

## Кейс OpenAI (2026-02)

Команда з 3 → 7 інженерів за 5 місяців отримала ~1 млн рядків коду і ~1 500 PR, жодного рядка не написано вручну — код, тести, CI, документація, тулінг зроблені Codex. ~3.5 PR на інженера на день; окремі задачі агент виконував 6+ годин. Що для цього знадобилося:

- AGENTS.md як мапа (~100 рядків) з деревом \`docs/\`; репозиторій — єдина система обліку.
- **Механічне забезпечення інваріантів**: фіксована шарова архітектура (Types → Config → Repo → Service → Runtime → UI), кастомні лінтери перевіряють напрямок залежностей, структуроване логування, розмір файлів; повідомлення лінтера містять інструкцію з виправлення.
- **Observability як tool агента**: кожен worktree підіймає застосунок з Chrome DevTools Protocol, логами, метриками й трейсами, які агент може запитувати (LogQL/PromQL) — щоб відтворити баг і довести, що виправив.
- **Garbage collection**: агенти копіюють погані патерни; спершу 20 % часу інженерів йшло на ручне прибирання, потім — фонові Codex-джоби шукають дрейф і відкривають PR з рефакторингом, «doc-gardening» агент чистить застарілі документи, \`QUALITY_SCORE.md\` оцінює кожен домен.
- **Мінімальні merge-ґейти**: швидке виправлення краще за блокуюче попередження; агент-агент review loop, людський review опційний.

OpenAI чесно попереджає: результат залежить від важких репозиторно-специфічних інвестицій і «не має вважатися узагальнюваним».

## Два погляди на harness

Курс розрізняє **побудову** harness (ти пишеш агента: Frontend Masters, Vizuara, learn-claude-code) і **конфігурування** harness навколо готового агента (Claude Code, Codex: Fowler, HumanLayer, Anthropic docs). Більшість уроків цього модуля — про друге, бо саме це потрібно 95 % команд.

## Ключова емпірика

Terminal Bench 2.0: та сама модель посідала 33-тє місце в одному harness і 5-те — в іншому. Anthropic у звіті 2026 Agentic Coding Trends: «конфігурація інфраструктури — змінна оптимізації; коливання бенчмарків 5+ п.п.». Моделі overfit-ять під свій «рідний» harness — тому переносити промпти між інструментами треба обережно.

:::warn Антипатерн
Проєктувати «ідеальний» harness наперед, без даних про збої. Harness будується ітеративно з реальних невдач: подивись останні 5 PR агента → знайди 3 повторювані проблеми → закодуй їх у лінтер/hook → виміряй.
:::
`,
      tasks: [
        { id: 'm2l1t1', kind: 'practice', title: 'Аудит останніх 5 PR агента', md: `Візьми 5 останніх PR або diff-ів, зроблених агентом у твоєму репозиторії. Для кожного запиши: що довелося виправляти людині. Згрупуй у 3 найчастіші класи проблем. Це backlog твого harness на наступні уроки.` },
        { id: 'm2l1t2', kind: 'reflect', title: 'Твоя система обліку', md: `Перелічи знання про проєкт, які зараз живуть лише у Slack, головах чи Google Docs, і які агенту потрібні для роботи. Які 3 з них ти перенесеш у docs/ цього тижня?` },
      ],
      quiz: [
        { q: 'Що OpenAI зробив із повторюваними проблемами якості коду агента?', options: ['Найняли більше рев’юерів', 'Закодували інваріанти в лінтери з інструкціями виправлення й запустили фонових агентів для прибирання дрейфу', 'Заборонили агенту чіпати архітектуру'], answer: 1, explain: 'Механічні інваріанти + garbage collection — ядро підходу.' },
        { q: 'Що означає «Terminal Bench: #33 в одному harness, #5 в іншому»?', options: ['Бенчмарк ненадійний', 'Harness — окрема змінна, що може важити більше за вибір моделі', 'Модель була різна'], answer: 1, explain: 'Та сама модель; змінився лише harness.' },
      ],
      sources: [
        { t: 'OpenAI — Harness engineering: leveraging Codex in an agent-first world', u: 'https://openai.com/index/harness-engineering/', d: '2026-02-11' },
        { t: 'LangChain — Improving Deep Agents with harness engineering', u: 'https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering', d: '2026-02-17' },
        { t: 'Faros AI — Harness Engineering: A Guide to AI Coding Agents', u: 'https://www.faros.ai/blog/harness-engineering', d: '2026-05-22' },
        { t: 'Augment Code — Harness Engineering for AI Coding Agents', u: 'https://www.augmentcode.com/guides/harness-engineering-ai-coding-agents', d: '2026-04-16' },
        { t: 'awesome-harness-engineering (ai-boost)', u: 'https://github.com/ai-boost/awesome-harness-engineering' },
      ],
    },
    {
      id: 'm2l2',
      title: 'Guides і sensors: модель Böckeler',
      minutes: 16,
      md: `
## Дві категорії контролю

Birgitta Böckeler (Thoughtworks, martinfowler.com, квітень 2026) дала найкращу концептуальну рамку для користувачів coding-агентів. Harness — система з двох типів елементів:

- **Guides (feedforward)** — скеровують агента *до* дії: файли інструкцій, типи, шаблони, скаффолди, плани, language server, скрипти bootstrap.
- **Sensors (feedback)** — спостерігають *після* дії й дають агенту сигнал самовиправитись: лінтери, тести, hooks, review-агенти, моніторинг.

[[diagram:harness-guides-sensors|Guides ведуть, sensors перевіряють. Обидва бувають обчислювальними або інференційними.]]

Кожен елемент — або **обчислювальний** (детермінований, швидкий, дешевий: tsc, eslint, структурні тести, codemods) або **інференційний** (на LLM: review-субагент, семантичні перевірки). Правило: скрізь, де можна, обирай обчислювальний. Інференційні — там, де детермінований неможливий.

## Три мішені регуляції

Кожна потребує власного harness: **maintainability** (стиль, структура, розмір), **architecture fitness** (шари, залежності, межі модулів), **behaviour/correctness** (чи робить код те, що треба). Böckeler чесно визнає: третій harness найслабший — тести, написані ШІ, ще недостатньо надійні, а sensors не ловлять неправильний діагноз, overengineering і хибно зрозумілі вимоги. Людський judgement треба спрямувати саме туди.

## Keep quality left

Розміщуй перевірки якомога раніше: pre-edit (типи, LSP) → pre-commit → pre-push → CI → runtime monitoring. Stripe: локальний lint перед push, а після двох невдалих прогонів CI задача передається людині («two-cycle CI cap»).

## Steering loop

Коли збій повторюється — людина покращує harness, а не виправляє код удруге. Це та сама ідея, що в OpenAI (аудит останніх PR) і LangChain (trace-driven error analysis). Böckeler додає терміни: **harnessability** — типізовані мови, чіткі межі модулів і стандартні фреймворки роблять кодову базу легшою для harness; **harness templates** — набори guides + sensors для типової топології сервісу.

## Практична драбина

Augment Code пропонує 5-кроковий старт: аудит останніх 5 PR агента → обрати 3 обмеження → закодувати як lint з remediation-текстом → зробити помилкою в CI → виміряти. Лінт-повідомлення має бути інструкцією: не «console.log заборонено», а «використай \`logger.info({...})\` замість console.log, див. docs/logging.md». І заборони escape-люки на кшталт \`eslint-disable\` — агент знайде їх швидше за людину.
`,
      tasks: [
        { id: 'm2l2t1', kind: 'build', title: 'Три обмеження → три лінт-правила', md: `Візьми три класи проблем із аудиту PR (урок 2.1). Для кожного напиши лінт-правило або структурний тест (ESLint custom rule, ruff/semgrep, ArchUnit, dependency-cruiser тощо) з повідомленням-інструкцією «замість X зроби Y, див. Z». Увімкни як error у CI. Встав правила в нотатки.` },
        { id: 'm2l2t2', kind: 'reflect', title: 'Карта guides/sensors', md: `Склади таблицю свого harness: рядки — guides та sensors, стовпці — обчислювальний/інференційний, мішень (maintainability / architecture / behaviour), де у циклі (pre-edit / pre-commit / CI / runtime). Де порожні клітинки?` },
      ],
      quiz: [
        { q: 'Що таке sensor у моделі Böckeler?', options: ['Файл інструкцій', 'Елемент зворотного зв’язку, що спостерігає після дії: лінтер, тест, hook, review-агент', 'Датчик температури GPU'], answer: 1, explain: 'Guides — до дії, sensors — після.' },
        { q: 'Яку мішень регуляції Böckeler називає найслабшою?', options: ['Maintainability', 'Architecture fitness', 'Behaviour / correctness'], answer: 2, explain: 'ШІ-тести ненадійні, а sensors не ловлять хибний діагноз чи неправильно зрозумілі вимоги.' },
        { q: 'Яке лінт-повідомлення краще для агента?', options: ['«console.log заборонено»', '«використай logger.info({...}) замість console.log, див. docs/logging.md»', '«Помилка стилю»'], answer: 1, explain: 'Повідомлення — інструкція, яку агент може виконати.' },
      ],
      sources: [
        { t: 'Birgitta Böckeler — Harness engineering for coding agent users', u: 'https://martinfowler.com/articles/harness-engineering.html', d: '2026-04-02' },
        { t: 'Augment Code — Harness Engineering: Constraints That Ship Reliable Code', u: 'https://www.augmentcode.com/guides/harness-engineering-ai-coding-agents', d: '2026-04-16' },
        { t: 'Stripe — Minions: Stripe’s one-shot, end-to-end coding agents', u: 'https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents', d: '2026-02-09' },
      ],
    },
    {
      id: 'm2l3',
      title: 'Hooks, permissions, sandbox',
      minutes: 22,
      md: `
## Hooks: детерміновані гарантії

Hooks — скрипти, що запускаються на подіях життєвого циклу агента. На відміну від CLAUDE.md, вони виконуються завжди. У Claude Code (2026) події включають SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, SubagentStart/Stop, TaskCreated/Completed, Stop, PreCompact/PostCompact, WorktreeCreate/Remove, SessionEnd та інші.

[[diagram:hooks-lifecycle|Основні події та протокол відповіді: exit 0 / exit 2 / JSON.]]

Протокол: hook отримує JSON у stdin (подія, tool, аргументи), відповідає кодом виходу: **0** — «немає заперечень», **2** — заблокувати, а stderr повернути моделі як фідбек. Або exit 0 + JSON у stdout: \`permissionDecision: allow | deny | ask\`, \`additionalContext\`. Якщо кілька hooks — перемагає найсуворіше рішення. Типи: command hooks (shell), prompt hooks (один виклик Haiku як суддя), agent hooks (субагент інспектує репо перед рішенням), HTTP hooks.

### Приклад: Stop hook як quality gate

\`\`\`bash
#!/usr/bin/env bash
# .claude/hooks/stop-check.sh — запускається, коли агент хоче завершити
set -o pipefail
out=$( (npx tsc --noEmit && npx biome check . && npm test -- --reporter=dot) 2>&1 | grep -Ei "error|fail|✗" | head -40 )
if [ -n "$out" ]; then
  echo "Виправ перед завершенням:" >&2
  echo "$out" >&2
  exit 2          # блокує Stop, stderr іде моделі
fi
exit 0            # тихо: успіх не шумить
\`\`\`

Anthropic зазначає: після 8 послідовних блокувань Stop hook перестає блокувати — щоб не створити нескінченний цикл. Інші типові hooks: PostToolUse на Edit → форматер; PreToolUse на Bash → блокувати \`rm -rf\`, \`git push --force\`, запис у \`migrations/\`; PermissionRequest з вузьким matcher → авто-дозвіл безпечних команд; PreCompact → зберегти прогрес у файл.

Claude Code вміє писати hooks сам: «напиши hook, який після кожного Edit у \`src/\` запускає prettier на цьому файлі».

## Permissions

Три режими: allowlists (\`/permissions\`, \`--allowedTools\` для headless), auto mode (класифікатор блокує ризиковані дії), manual. Проблема: **втома від permission-prompts** — коли агент питає 50 разів за сесію, людина ставить «так» не читаючи. Anthropic замінила промпти структурними межами: після впровадження sandbox кількість запитів на дозвіл упала на 84 %.

## Sandbox

Дві незалежні ізоляції, і потрібні обидві: **файлова система** (агент бачить лише робочу директорію) і **мережа** (проксі з allowlist доменів). Linux — bubblewrap, macOS — seatbelt. Модель загроз: prompt injection (агент прочитав зловмисну інструкцію в issue чи веб-сторінці) + ексфільтрація (SSH-ключі, токени). У Claude Code — \`/sandbox\`; Stripe запускає кожну задачу в одноразовому пре-прогрітому EC2 devbox (старт 10 с); E2B і подібні дають хмарні sandbox-и як сервіс.

:::tip Правило
Дозволи — це «ask», sandbox — це «cannot». Усе незворотне (push у main, deploy, платіж, видалення) лишається за людиною; усе решта агент має робити без питань всередині sandbox.
:::
`,
      tasks: [
        { id: 'm2l3t1', kind: 'build', title: 'Stop hook + PreToolUse guard', md: `Напиши два hooks: (1) Stop — typecheck + lint + цільові тести, виводить лише падіння, exit 2 при помилках; (2) PreToolUse на Bash — блокує \`rm -rf\`, \`git push --force\`, запис у захищену директорію з поясненням у stderr. Перевір обидва навмисними порушеннями. Встав код у нотатки.` },
        { id: 'm2l3t2', kind: 'practice', title: 'Тиждень із sandbox', md: `Увімкни sandbox (fs + мережа з allowlist) і allowlist безпечних команд. Порахуй кількість permission-prompts за типову сесію до та після. Що вдалося автоматизувати, що лишилося за людиною?` },
      ],
      quiz: [
        { q: 'Що означає exit 2 у hook Claude Code?', options: ['Попередження без блокування', 'Заблокувати дію, а stderr повернути моделі як фідбек', 'Завершити сесію'], answer: 1, explain: 'Exit 0 — мовчазна згода, exit 2 — блок із поясненням.' },
        { q: 'Чому Anthropic вважає permission-prompts небезпечними у великій кількості?', options: ['Вони уповільнюють модель', 'Людина втомлюється й натискає «так» не читаючи; структурні межі (sandbox) надійніші', 'Вони споживають контекст'], answer: 1, explain: 'Sandbox скоротив кількість промптів на 84 %.' },
        { q: 'Які дві ізоляції потрібні у sandbox?', options: ['CPU і пам’ять', 'Файлова система і мережа', 'Git і npm'], answer: 1, explain: 'Без мережевої ізоляції ексфільтрація можлива навіть із ізольованою FS, і навпаки.' },
      ],
      sources: [
        { t: 'Anthropic — Automate actions with hooks', u: 'https://code.claude.com/docs/en/hooks-guide' },
        { t: 'Anthropic — Beyond permission prompts: Claude Code sandboxing', u: 'https://www.anthropic.com/engineering/claude-code-sandboxing', d: '2025-10-20' },
        { t: 'Anthropic — Claude Code auto mode', u: 'https://www.anthropic.com/engineering/claude-code-auto-mode' },
        { t: 'Stripe — Minions Part 2 (devbox, blueprints)', u: 'https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2', d: '2026-02-19' },
        { t: 'DeepLearning.AI — Building Coding Agents with Tool Execution (E2B)', u: 'https://www.deeplearning.ai/courses/building-coding-agents-with-tool-execution' },
      ],
    },
    {
      id: 'm2l4',
      title: 'Дизайн tools, MCP і skills',
      minutes: 20,
      md: `
## Tools — інтерфейс «агент–комп’ютер»

Anthropic (Writing effective tools for agents, 2025-09): будуй мало високоефективних workflow-tools замість обгортки кожного endpoint-а. Принципи:

- **Простір імен**: \`asana_projects_search\`, \`jira_issues_create\` — модель обирає правильний tool за назвою.
- **Читабельні відповіді**: імена замість UUID, \`response_format: concise | detailed\`.
- **Пагінація й обрізання за замовчуванням** — інакше один виклик з'їдає контекст.
- **Помилки, що скеровують**: «результатів забагато, звузь запит за датою» замість stack trace.
- **Оцінюй на реальних багатокрокових задачах**, а не на юніт-прикладах; давай Claude аналізувати транскрипти й переписувати описи tools — це справді працює (Anthropic: tool-testing агент скоротив час задачі на 40 %).

## MCP: ціна кожного сервера

Кожен опис tool споживає бюджет контексту, ще до першого повідомлення. HumanLayer радить: перш ніж підключати MCP-сервер, спитай, чи не вистачить тонкої CLI-обгортки з 6 прикладами використання у CLAUDE.md (їхній приклад — Linear CLI). Недовірений MCP-сервер — вектор prompt injection через описи tools. Stripe тримає центральний Toolshed з ~500 tools, але кожна задача бачить малий підмножину. Якщо tools 15–20+ — Tool Search Tool у Claude Code завантажує описи на вимогу і скорочує їхній контекст до ~85 %.

Специфікація MCP 2026-07-28: протокол став stateless (\`server/discover\`), довгі операції винесено в офіційне розширення **tasks** (\`tasks/get\`, \`tasks/update\`) — так MCP-сервер може обгорнути довготривалого субагента; додано OpenTelemetry trace-context у \`_meta\`, детермінований порядок \`tools/list\` для кешу.

## Skills: прогресивне розкриття процедур

Skill — директорія з \`SKILL.md\` (frontmatter: name, description) плюс скрипти й шаблони. Модель бачить лише опис; повний вміст завантажується, коли skill спрацьовує. Це спосіб дати агенту 50 процедур, не витрачаючи контекст на всі одразу. \`disable-model-invocation: true\` — для skills із побічними ефектами, які запускає лише людина (\`/deploy\`). Anthropic Academy і DeepLearning.AI мають окремі курси про skills; ключовий урок — таксономія: **skill** (процедура на вимогу) vs **CLAUDE.md** (завжди в контексті) vs **hook** (детермінована подія) vs **subagent** (окремий контекст).

:::warn Антипатерни
Встановити десятки skills і MCP «про запас»; «tool thrash» — мікротюнінг дозволів tools для кожного субагента; LLM-згенеровані описи tools без evals.
:::

## Chеклист tool-дизайну

1. Чи зрозуміє людина з опису, коли обрати цей tool, а не сусідній?
2. Чи повертає він те, що потрібно для наступного кроку, а не все, що є?
3. Чи обрізає/пагінує за замовчуванням?
4. Чи помилка каже, що робити далі?
5. Чи є 5–10 реальних задач, на яких ти його перевіряєш після кожної зміни?
`,
      tasks: [
        { id: 'm2l4t1', kind: 'build', title: 'CLI замість MCP', md: `Обери одну зовнішню систему, яку твій агент використовує (трекер задач, БД, деплой). Напиши тонку CLI-обгортку (або скрипт) з 3–5 командами, тихим успіхом і скеровуючими помилками. Додай 6 прикладів у CLAUDE.md. Порівняй контекст на старті сесії з варіантом MCP-сервера.` },
        { id: 'm2l4t2', kind: 'build', title: 'Свій перший skill', md: `Запакуй повторювану процедуру (наприклад, «зроби реліз-нотатки з git log» або «онови changelog») як skill із SKILL.md і скриптом. Опиши в description, коли він має спрацьовувати. Перевір на 3 задачах, що спрацьовує лише тоді, коли треба.` },
      ],
      quiz: [
        { q: 'Що радить HumanLayer перед підключенням MCP-сервера?', options: ['Підключити ще один для надійності', 'Перевірити, чи не вистачить тонкого CLI + прикладів у CLAUDE.md', 'Вимкнути sandbox'], answer: 1, explain: 'MCP-описи коштують контексту й є вектором injection.' },
        { q: 'У чому різниця між skill і CLAUDE.md?', options: ['Немає різниці', 'Skill завантажується на вимогу (лише опис завжди в контексті), CLAUDE.md — завжди', 'Skill — це тест'], answer: 1, explain: 'Skills — прогресивне розкриття процедур.' },
        { q: 'Яка помилка tool найкорисніша агенту?', options: ['Повний stack trace', 'Коротка інструкція, що змінити у виклику («звузь запит за датою»)', 'Код помилки без тексту'], answer: 1, explain: 'Помилка має скеровувати наступну дію.' },
      ],
      sources: [
        { t: 'Anthropic — Writing effective tools for agents', u: 'https://www.anthropic.com/engineering/writing-tools-for-agents', d: '2025-09-11' },
        { t: 'HumanLayer — Skill Issue (MCP cost, skills, subagents)', u: 'https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents', d: '2026-03-12' },
        { t: 'MCP — Specification changelog 2026-07-28', u: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog' },
        { t: 'Anthropic Academy — Introduction to Agent Skills', u: 'https://anthropic.skilljar.com/introduction-to-agent-skills' },
        { t: 'DeepLearning.AI — Agent Skills with Anthropic', u: 'https://www.deeplearning.ai/courses/agent-skills-with-anthropic' },
        { t: 'Anthropic Academy — Introduction to MCP / MCP Advanced Topics', u: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol' },
      ],
    },
    {
      id: 'm2l5',
      title: 'Цикли верифікації: докази, а не запевнення',
      minutes: 18,
      md: `
## Головне правило

«Дай агенту спосіб перевірити свою роботу». Кожна задача має мати pass/fail-сигнал, який агент може прочитати: тести, код виходу збірки, лінтер, diff з фікстурою, порівняння скріншотів, браузерна автоматизація. Без цього агент схильний до **victory-declaration bias** — оголосити задачу зробленою після першого правдоподібного рішення (LangChain: «моделі упереджені до свого першого правдоподібного рішення»).

## Драбина ґейтів (Anthropic)

1. **У промпті**: «запусти тести й покажи вивід» — найслабше.
2. **\`/goal\`**: evaluator перевіряє умову на кожному кроці.
3. **Stop hook**: детерміновано, з exit 2 (урок 2.3).
4. **Верифікаційний субагент**: свіжа модель намагається спростувати результат («чорна скринька»: лише критерії успіху + артефакт, без історії).

Просити треба **докази, а не запевнення**: вивід тестів, скріншот, лог, а не «я перевірив, усе працює».

## Anti-patterns верифікації

- **Trust-then-verify gap**: людина довіряє «зроблено», перевірка відкладається до продакшену.
- **Test masking**: агент «виправляє» падаючий тест, послаблюючи assertion або видаляючи тест. Anthropic у harness для довготривалих агентів прописує: «неприпустимо видаляти чи редагувати тести».
- **Самооцінка**: агент сам собі суддя. Розділяй worker і grader (Osmani, Anthropic).
- **Неповна перевірка**: verifier каже pass, не запустивши повний набір. Ліки з посту Anthropic про мультиагентність: «ти МУСИШ запустити повний test suite перед тим, як позначити passed».

## Adversarial review

Промпт-шаблон: «Використай субагента, щоб звірити diff із PLAN.md. Перевір, що кожна вимога реалізована, кожен перелічений edge case має тест, нічого поза скоупом не змінено. Звітуй про прогалини, не про стиль». Cognition: рев'юер із чистим контекстом знаходить ~2 баги на PR, 58 % серйозні; кілька циклів review знаходять більше.

## Middleware-патерни (LangChain)

- **PreCompletionChecklist** — блокує завершення, поки не пройдено список перевірок.
- **LocalContext** — на старті інжектить мапу директорій, доступні tools, таймаути, вимоги до тестів.
- **LoopDetection** — рахує правки одного файлу, після N підказує змінити підхід («doom loop»).
- **Reasoning sandwich** — високий reasoning на плануванні й верифікації, середній — на реалізації.

## E2E — обов'язково

Anthropic наполягає: не позначай фічу зробленою за code review — симулюй користувача (Puppeteer/Playwright MCP, CDP). OpenAI дав агенту повний observability-стек, щоб він доводив, що виправив баг, а не вірив у це.
`,
      tasks: [
        { id: 'm2l5t1', kind: 'build', title: 'Верифікаційний субагент', md: `Створи субагента-верифікатора (у Claude Code — файл у .claude/agents/ з read-only tools + Bash для тестів). Його промпт: отримує критерії успіху й шлях до diff, МУСИТЬ запустити повний test suite, звітує pass/fail з доказами. Прожени на останньому PR агента. Що знайшов?` },
        { id: 'm2l5t2', kind: 'practice', title: 'Спіймай test masking', md: `Навмисно дай агенту задачу з тестом, який складно пройти чесно. Спостерігай: чи спробує він послабити assertion? Додай правило «тести не редагувати» у CLAUDE.md і PreToolUse hook, що блокує зміни у tests/ без явного дозволу. Повтори.` },
      ],
      quiz: [
        { q: 'Що таке victory-declaration bias?', options: ['Схильність людини хвалити агента', 'Схильність агента оголосити задачу зробленою після першого правдоподібного рішення без перевірки', 'Помилка бенчмарку'], answer: 1, explain: 'Ліки — виконувана верифікація і окремий grader.' },
        { q: 'Який найсильніший ґейт у драбині Anthropic?', options: ['Інструкція у промпті', 'Stop hook або верифікаційний субагент із чистим контекстом', 'CAPS у CLAUDE.md'], answer: 1, explain: 'Детермінований hook або незалежний verifier, а не прохання.' },
      ],
      sources: [
        { t: 'Anthropic — Claude Code Best Practices (verification)', u: 'https://code.claude.com/docs/en/best-practices' },
        { t: 'LangChain — Improving Deep Agents with harness engineering', u: 'https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering', d: '2026-02-17' },
        { t: 'Anthropic — When to use multi-agent systems (verification subagent)', u: 'https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them', d: '2026-01-23' },
        { t: 'Cognition — Multi-Agents: What’s Actually Working', u: 'https://cognition.com/blog/multi-agents-working', d: '2026-04-22' },
        { t: 'Anthropic Academy — Claude Code in Action (verifying unsupervised runs)', u: 'https://anthropic.skilljar.com/claude-code-in-action' },
      ],
    },
    {
      id: 'm2l6',
      title: 'Довготривалі агенти: стан, feature list, Ralph loop',
      minutes: 20,
      md: `
## Проблема

Кожне нове контекстне вікно — амнезія. Anthropic порівнює з робітниками на змінах без передачі справ. Harness має **екстерналізувати стан**: у файли, git, feature list — усе, що переживає скидання контексту.

[[diagram:long-running|Initializer + ритуал старту сесії + одна фіча за сесію + чистий стан наприкінці.]]

## Рецепт Anthropic (2025-11)

- **Initializer agent** (перша сесія) створює \`init.sh\` (підняти dev-середовище), \`claude-progress.txt\`, перший коміт і **feature list** — JSON з категорією, кроками перевірки й полем \`passes: false\` (у прикладі — 200+ фіч для клону Claude.ai). Правило: не можна видаляти чи редагувати фічі/тести.
- **Ритуал старту сесії**: \`pwd\` → git log + progress → обрати найпріоритетнішу фічу з \`passes: false\` → \`init.sh\` → smoke test → працювати над ОДНІЄЮ фічею → E2E перевірка через браузер → коміт з описом → оновити progress.
- **Чистий стан**: кожна сесія завершується mergeable — задокументовано, закомічено, без відомих багів.
- Таблиця збоїв: передчасна «перемога», незадокументований прогрес, фічі «зроблено» без тестів, зламаний застосунок після сесії, вичерпання контексту через спробу зробити все за раз (one-shotting).

## Ralph loop

Geoffrey Huntley, 2025: \`while :; do cat PROMPT.md | agent; done\`. Кожна ітерація — свіжий контекст; PROMPT.md декларує ціль (PRD), progress-файл і тести — умова завершення. Працює для добре специфікованих рефакторингів і стандартизацій, які можна залишити на ніч (HumanLayer: 35k рядків фічі за 7 годин; баг-фікс у 300k-рядковому Rust-репо прийнятий мейнтейнером). Не працює для дослідницької роботи, без review результатів і при «overbaking» — коли цикл продовжує «покращувати» вже готове.

[[diagram:ralph-loop|Декларативна ціль + свіжий агент + зовнішній стан + тести як умова зупинки.]]

## Три збої, які Walking Labs виносить в окремі лекції

- **Ініціалізація як окрема фаза (L06)**: агент, що одразу «пише код», пропускає bootstrap середовища, перевірку, що тести взагалі запускаються, і baseline. Initializer — не оптимізація, а запобіжник.
- **Overreach і under-finish (L07)**: агент береться за більше, ніж влізає у вікно, і залишає half-done. Ліки — одна фіча за сесію, feature list як одиниця роботи, clean state.
- **Передчасна перемога (L09)**: «зроблено» без E2E. Ліки — незалежний verifier або goal loop (learn-claude-code s17), де зупинити цикл може лише evaluator, а не worker.

## Чекліст Addy Osmani (2026-04)

Розділяй **brain** (цикл моделі), **hands** (середовище виконання) і **durable session log**; стан поза контекстом; чекпоінти на значущих одиницях (коміт, прогін тестів); окремий evaluator без самооцінювання; явна умова «done» до старту; circuit breakers і бюджети (maxTurns, вартість); секрети окремо від згенерованого коду.

## Стан у файлах, а не в чаті

Cognition (2026), Claude Code agent teams, LangChain Deep Agents, CC Mirror — усі сходяться до **файлової системи як спільної книги обліку**: task JSON з \`blockedBy/blocks\`, progress.md, event log. Це робить прогрес видимим людині, відновлюваним після падіння і незалежним від конкретного агента.

:::tip Явна умова завершення
Перед запуском довгої задачі напиши одним реченням, як агент дізнається, що готово («усі фічі в feature_list.json мають passes: true і CI зелений»). Якщо не можеш — задача не готова до автономного виконання.
:::
`,
      tasks: [
        { id: 'm2l6t1', kind: 'build', title: 'Feature list + ритуал старту', md: `Для навчального репозиторію створи feature_list.json (5–10 фіч зі кроками перевірки, passes: false), init.sh і progress.md. Напиши у CLAUDE.md ритуал старту сесії. Прожени дві окремі сесії агента — переконайся, що друга продовжує з місця, де зупинилась перша.` },
        { id: 'm2l6t2', kind: 'practice', title: 'Ralph на ніч', md: `Обери добре специфіковану механічну задачу (міграція API, стандартизація логування у 20+ файлах). Напиши PROMPT.md з декларативною ціллю, умовою зупинки (тести) й лімітом ітерацій. Запусти цикл на 5–10 ітерацій. Оціни результат вранці: що зроблено, що «перепечено», скільки коштувало.` },
      ],
      quiz: [
        { q: 'Що таке feature list у harness Anthropic?', options: ['Список побажань користувачів', 'JSON-файл фіч зі кроками перевірки й полем passes, який не можна редагувати, лише переводити у true', 'Чейнджлог'], answer: 1, explain: 'Зовнішній стан, що переживає контекст і забороняє «видалити складне».' },
        { q: 'Для яких задач підходить Ralph loop?', options: ['Дослідницьких з невідомим результатом', 'Добре специфікованих механічних змін із тестами як умовою зупинки', 'Будь-яких'], answer: 1, explain: 'Без чіткої умови завершення цикл «перепікає» або блукає.' },
        { q: 'Чому окремий evaluator важливий у довгих задачах?', options: ['Бо він дешевший', 'Бо самооцінка агента упереджена до «зроблено»', 'Бо це вимога MCP'], answer: 1, explain: 'Worker і grader розділені — базове правило верифікації.' },
      ],
      sources: [
        { t: 'Anthropic — Effective harnesses for long-running agents', u: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', d: '2025-11-26' },
        { t: 'HumanLayer — A Brief History of Ralph', u: 'https://www.humanlayer.dev/blog/brief-history-of-ralph', d: '2026-01-06' },
        { t: 'Geoffrey Huntley — Ralph', u: 'https://ghuntley.com/ralph/' },
        { t: 'Addy Osmani — Long-running Agents', u: 'https://addyosmani.com/blog/long-running-agents/', d: '2026-04-28' },
        { t: 'Walking Labs — Learn Harness Engineering (14 лекцій, шаблони)', u: 'https://walkinglabs.github.io/learn-harness-engineering/en/' },
      ],
    },
    {
      id: 'm2l7',
      title: 'Observability, ентропія та метрики harness',
      minutes: 15,
      md: `
## Observability для агента, не лише для людини

OpenAI дав агенту те саме, що має інженер під час інциденту: застосунок у кожному worktree, DOM-знімки й скріншоти через Chrome DevTools Protocol, логи/метрики/трейси з запитами LogQL/PromQL/TraceQL. Тому можливі промпти на кшталт «переконайся, що старт застосунку < 800 мс» — агент вимірює, а не обіцяє.

## Trace-driven iteration

LangChain: трейси у LangSmith → паралельні агенти error-analysis → синтез → людина верифікує зміну → «boosting» на задачах, що впали. Одна зміна harness за раз, A/B на 5–10 задачах, що впали раніше. Те саме радять Hamel Husain і Shreya Shankar для evals (Модуль 5): error analysis спершу, метрики потім.

## Ентропія

Агенти копіюють патерни, які бачать, — і хороші, і погані. OpenAI: «golden principles» + фонові джоби, що шукають дрейф і відкривають PR з рефакторингом; doc-gardening агент шукає застарілі документи; \`QUALITY_SCORE.md\` оцінює домени. Без цього 20 % часу інженерів йшло на ручне прибирання.

## Що вимірювати

Faros AI пропонує драбину метрик замість «рядків прийнятого коду»:

| Рівень | Метрики |
|---|---|
| Ефективність | вартість за змерджений PR, time-to-merge, кількість ітерацій CI |
| Якість | first-pass success, churn (скільки коду агента переписано за 30 днів), «виживання» PR агента, defect escape rate |
| Люди | втома рев'юерів, частка PR, що потребують людського втручання |

DORA 2025 нагадує: ШІ підвищує throughput, але стабільність доставки все ще падає — тому метрики стабільності (change failure rate, MTTR) обов'язкові.

## Термін придатності guardrails

LangChain: кожен guardrail кодує поточну слабкість моделі й застаріває. Нова модель у старому harness може показати гірше (Opus 4.6 на попередньому harness — 59.6 %). Переглядай harness при кожній зміні моделі.

:::idea Практика
Раз на місяць — «harness retro»: які hooks спрацьовували, які лінт-правила ловили, які — ні разу; що видалити, що додати.
:::
`,
      tasks: [
        { id: 'm2l7t1', kind: 'build', title: 'Дашборд трьох метрик', md: `Налаштуй збір трьох метрик по PR агента: first-pass success (змерджено без людських правок), churn за 14 днів, кількість прогонів CI до зеленого. Достатньо скрипта над git/GitHub API. Запиши baseline — повернешся до нього в Модулі 7.` },
        { id: 'm2l7t2', kind: 'practice', title: 'Doc-gardening агент', md: `Запусти агента з задачею: «знайди документи в docs/, які суперечать коду або застаріли, і відкрий PR з виправленнями». Оціни результат: скільки знахідок справжні? Заплануй як щотижневий фоновий job.` },
      ],
      quiz: [
        { q: 'Чому «рядки прийнятого коду» — погана метрика?', options: ['Її складно рахувати', 'Вона не відображає churn, дефекти й час рев’юерів — можна прийняти багато коду, який потім перепишуть', 'Вона завжди нуль'], answer: 1, explain: 'Faros/DORA: дивись на churn, виживання PR, defect escape, стабільність.' },
        { q: 'Чому guardrails потрібно переглядати при зміні моделі?', options: ['Бо змінюється формат hooks', 'Бо кожен guardrail кодує слабкість конкретної моделі й може заважати новій', 'Не потрібно'], answer: 1, explain: 'LangChain: припущення harness застарівають.' },
      ],
      sources: [
        { t: 'OpenAI — Harness engineering (observability, garbage collection)', u: 'https://openai.com/index/harness-engineering/', d: '2026-02-11' },
        { t: 'Faros AI — Harness Engineering guide (metrics ladder)', u: 'https://www.faros.ai/blog/harness-engineering', d: '2026-05-22' },
        { t: 'DORA 2025 — State of AI-assisted Software Development', u: 'https://dora.dev/dora-report-2025/', d: '2025-09-23' },
        { t: 'LangChain — The Anatomy of an Agent Harness', u: 'https://www.langchain.com/blog/the-anatomy-of-an-agent-harness', d: '2026-03-10' },
      ],
    },
  ],
};
