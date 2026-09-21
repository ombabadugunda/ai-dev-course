export default {
  id: 'm4',
  icon: '🕸️',
  title: 'Мультиагентні системи',
  subtitle: 'Коли (не) будувати, оркестратор–воркери, single-writer, handoffs, Claude Code subagents / teams / worktrees, режими збоїв MAST, MCP і A2A.',
  intro: `У червні 2025 Cognition написала «Don't Build Multi-Agents», а Anthropic за день до того — як побудувала мультиагентну research-систему, що обійшла одиночного агента на 90 %. Обидві мали рацію. Цей модуль пояснює, чому.`,
  lessons: [
    {
      id: 'm4l1',
      title: 'Коли будувати мультиагент, а коли — ні',
      minutes: 18,
      md: `
## Дефолт — один агент

Anthropic (2026-01): починай з одного агента; мультиагент коштує 3–10× токенів; кілька команд витратили місяці на мультиагентні системи, які потім наздогнав кращий промпт для одного агента. Cognition (2025): один потік із гарним context engineering — дефолт; для дуже довгих задач — окрема модель-компресор історії.

## Три легітимні причини (Anthropic)

1. **Захист контексту** — субагент повертає 50–100 токенів замість 2 000 сирих даних.
2. **Паралелізація** — заради повноти, а не швидкості: сумарні обчислення зазвичай зростають.
3. **Спеціалізація** — за tools (> 15–20 tools погіршують вибір), за системним промптом (конфліктні режими поведінки), за доменом.

Сигнали, що ти переріс одного агента: регулярно впираєшся в ліміт контексту; 15–20+ tools; є чітко паралельні підзадачі; є чіткі точки верифікації.

## Читання паралелиться, запис — ні

Harrison Chase (LangChain) примирив Cognition і Anthropic: research (read-heavy) паралелиться чудово; coding (write-heavy) конфліктує. Anthropic-система паралелила читання й пропускала запис через одного агента. Cognition у 2026 сформулювала **single-writer principle**: мультиагент працює, коли запис однопотоковий, а інші агенти додають інтелект — research, планування, review.

[[diagram:single-writer|Один пише — багато читають, планують і рев’юять.]]

## Декомпозиція за межами контексту, а не за фазами

Anthropic: не роби агентів «writer / tester / reviewer» як окремі фази — це «зіпсований телефон» на кожному handoff. Тримай реалізацію і тести разом; виділяй агентів там, де контексти справді різні (інша кодова база, інший набір tools, інший режим поведінки).

## Дані Google Research (2025-12)

П'ять архітектур (single, independent parallel, centralized, decentralized, hybrid) на чотирьох бенчмарках. Декомпозовані задачі: централізований оркестратор до +80.9 % проти одного агента. Строго послідовні задачі: **будь-який мультиагент шкодить на 39–70 %** — координація дробить міркування. Ампліфікація помилок: незалежні агенти 17.2×, централізовані 4.4× (оркестратор — валідаційне вузьке місце). Топологію треба обирати за властивостями задачі (декомпозованість, послідовні залежності, кількість tools), не за принципом «більше агентів».

[[diagram:topology-task|Топологія має відповідати структурі задачі.]]

:::tip Питання перед стартом
Напиши decision memo на півсторінки: яка з трьох причин, чому один агент не впорається, як виглядатиме верифікація, який бюджет токенів. Якщо не можеш заповнити — не будуй.
:::
`,
      tasks: [
        { id: 'm4l1t1', kind: 'reflect', title: 'Decision memo', md: `Обери задачу, яку ти хотів би віддати мультиагентній системі. Напиши memo: (1) яка з трьох причин Anthropic застосовна, (2) де у задачі читання, а де запис, (3) чи є послідовні залежності, (4) як верифікуватимеш, (5) очікуваний бюджет ×3–10. Висновок: single / orchestrator / team?` },
        { id: 'm4l1t2', kind: 'practice', title: 'Один агент vs два', md: `Візьми задачу «дослідити й реалізувати» середнього розміру. Прожени (а) одним агентом, (б) research-субагент + один writer. Порівняй токени, час, кількість виправлень, повноту research.` },
      ],
      quiz: [
        { q: 'Що радить Anthropic як стартову точку?', options: ['Мультиагент із 5 ролями', 'Один агент; мультиагент лише за однією з трьох причин', 'Swarm без оркестратора'], answer: 1, explain: 'Захист контексту, паралелізація, спеціалізація — інакше не варто.' },
        { q: 'Що показало дослідження Google для строго послідовних задач?', options: ['Мультиагент дає +80 %', 'Будь-який мультиагент шкодить на 39–70 %', 'Різниці немає'], answer: 1, explain: 'Координація дробить міркування там, де кроки залежать один від одного.' },
        { q: 'Чому «writer / tester / reviewer» як фази — антипатерн?', options: ['Бо тестер дорожчий', 'Бо кожен handoff — «зіпсований телефон»; реалізацію й тести треба тримати разом', 'Бо reviewer не потрібен'], answer: 1, explain: 'Декомпозуй за межами контексту, а не за етапами процесу.' },
      ],
      sources: [
        { t: 'Anthropic — When to use multi-agent systems (and when not to)', u: 'https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them', d: '2026-01-23' },
        { t: 'Cognition — Don’t Build Multi-Agents', u: 'https://cognition.com/blog/dont-build-multi-agents', d: '2025-06-12' },
        { t: 'Cognition — Multi-Agents: What’s Actually Working', u: 'https://cognition.com/blog/multi-agents-working', d: '2026-04-22' },
        { t: 'LangChain — How and when to build multi-agent systems', u: 'https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems', d: '2025-06-16' },
        { t: 'Google Research — Towards a Science of Scaling Agent Systems', u: 'https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/', d: '2026-01-28' },
      ],
    },
    {
      id: 'm4l2',
      title: 'Оркестратор–воркери: система Anthropic',
      minutes: 18,
      md: `
## Архітектура

Lead-агент (Opus) планує, породжує 3–5 субагентів (Sonnet) паралельно, кожен зі своїм контекстом; наприкінці — citation-агент. Два рівні паралелізму: lead спавнить субагентів паралельно, кожен субагент викликає 3+ tools паралельно — до 90 % скорочення часу research.

[[diagram:orchestrator-worker|Lead планує й синтезує; воркери читають і повертають стислі підсумки; verifier перевіряє лише артефакт.]]

## Цифри

Мультиагент (Opus lead + Sonnet воркери) обійшов одиночного Opus 4 на 90.2 % на внутрішньому research-eval. На BrowseComp використання токенів пояснює 80 % варіації результату; кількість tool-викликів і вибір моделі — решту (95 % разом). Агенти споживають ~4× токенів чату, мультиагент — ~15×. Апгрейд моделі дає більше, ніж подвоєння бюджету токенів.

## Вісім принципів промптингу

1. **Думай як агент** — дивись трейси у симуляції.
2. **Навчи оркестратора делегувати**: бриф субагента = ціль, формат виводу, tools/джерела, межі задачі. Розпливчасте «дослідь X» → дубльована робота.
3. **Масштабуй зусилля під складність** явними евристиками: простий факт — 1 агент, 3–10 викликів; порівняння — 2–4 субагенти по 10–15; складне — 10+.
4. **Дизайн tools і описи критичні**.
5. **Дай агентам самовдосконалювати промпти й описи tools** — tool-testing агент скоротив час задачі на 40 %.
6. **Спершу широко, потім вузько.**
7. **Extended thinking як блокнот.**
8. **Паралельні tool-виклики.**

## Контекст і пам'ять

Підсумовуй завершені фази у зовнішню пам'ять; спавни свіжих субагентів на межі контексту; великі результати — в artifact store, а lead отримує посилання (щоб уникнути «зіпсованого телефону» через координатора).

## Продакшн

Агенти stateful і довготривалі: resume з чекпоінтів, retry, повний трейсинг патернів рішень, «rainbow deployments», щоб не зламати агентів у польоті. Синхронне виконання субагентів — вузьке місце; async дозволив би lead-у керувати на льоту, але ускладнює стан і помилки.

## Evaluation

Почни з ~20 реальних запитів — великі ефекти видно рано. LLM-as-judge за рубрикою (фактична точність, точність цитат, повнота, якість джерел, ефективність tools) з оцінкою 0–1 + pass/fail. Людська оцінка ловить те, що суддя пропускає (перевага SEO-контенту над авторитетними джерелами). Оцінюй **кінцевий стан**, а не шлях — агенти йдуть різними валідними шляхами.

## Аналог для коду: Deep Agents (LangChain)

Чотири стовпи: планувальний todo-tool, віртуальна файлова система (State / Filesystem / Store backends), субагенти для «карантину контексту» (свіжий контекст, одне повернення), детальний системний промпт; middleware для summarization/offloading; \`interrupt_on\` для human-in-the-loop.
`,
      tasks: [
        { id: 'm4l2t1', kind: 'build', title: 'Lead + 3 researchers', md: `Побудуй (Claude Agent SDK, Deep Agents або Claude Code із власними субагентами) систему: lead отримує питання про кодову базу («як влаштована обробка платежів?»), спавнить 3 read-only дослідників за областями, синтезує відповідь із file:line. Напиши брифи за формулою ціль / формат / tools / межі. Прожени на 5 питаннях, заміряй токени.` },
        { id: 'm4l2t2', kind: 'build', title: 'LLM-as-judge на 20 запитах', md: `Склади 20 реальних питань до кодової бази з еталонними відповідями. Напиши рубрику (точність, повнота, посилання на файли, ефективність) і суддю. Порівняй одиночного агента з оркестратором. Перевір 5 оцінок судді вручну — чи згоден ти з ним?` },
      ],
      quiz: [
        { q: 'Що має містити бриф субагента за Anthropic?', options: ['Лише тему', 'Ціль, формат виводу, які tools/джерела, межі задачі', 'Повну історію lead-агента'], answer: 1, explain: 'Розпливчасті брифи → дубльована робота і прогалини.' },
        { q: 'Чому Anthropic оцінює кінцевий стан, а не траєкторію, для відкритих задач?', options: ['Бо траєкторію неможливо зібрати', 'Бо агенти доходять до правильного результату різними валідними шляхами', 'Бо так дешевше'], answer: 1, explain: 'Для процесних задач — milestone-оцінка (MultiAgentBench).' },
      ],
      sources: [
        { t: 'Anthropic — How we built our multi-agent research system', u: 'https://www.anthropic.com/engineering/multi-agent-research-system', d: '2025-06-13' },
        { t: 'LangChain — Deep Agents overview', u: 'https://docs.langchain.com/oss/python/deepagents/overview' },
        { t: 'MultiAgentBench / MARBLE (ACL 2025)', u: 'https://arxiv.org/abs/2503.01935' },
        { t: 'DeepLearning.AI — Evaluating AI Agents (Arize)', u: 'https://www.deeplearning.ai/courses/evaluating-ai-agents' },
      ],
    },
    {
      id: 'm4l3',
      title: 'Патерни: manager, handoffs, pipeline, generator–critic',
      minutes: 16,
      md: `
## Каталог патернів

| Патерн | Механізм | Коли | Уникай |
|---|---|---|---|
| Single + context eng. | один потік, компакція, нотатки | дефолт; < 3 доменів; < 15 tools | контекст переповнюється; багато незалежних підзадач |
| Orchestrator–worker | lead → паралельні воркери → синтез | breadth-first research, паралельний review | строго послідовні задачі |
| Single-writer + advisors | один пише; інші досліджують/планують/рев'юять | coding | — |
| Verifier / generator–critic | чорна скринька з критеріями + артефактом; цикл з max iterations | усе з перевірюваним виходом | verifier без виконуваних перевірок |
| Manager / agents-as-tools | manager тримає розмову, кличе спеціалістів як tools | обмежені підзадачі, контроль | спеціаліст має вести весь хід |
| Handoffs / swarm | спеціаліст перебирає хід; \`transfer_to_X\` | чіткі домени, латентність | розмиті домени; нема ліміту ping-pong |
| Pipeline | фіксовані стадії через код/state | ETL-подібне | потрібне динамічне перепланування |
| Peer team + task list | повні сесії + mailbox + дошка задач; worktrees | cross-layer фічі, дебати | правки одного файлу |
| Capability routing | дешева модель ескалює до сильної | економія при малому розриві | великий розрив (слабка не знає, коли ескалювати) |

[[diagram:manager-vs-handoff|Manager зберігає контроль і трейс; handoffs економлять виклики, але потребують ліміту переходів.]]

## OpenAI Agents SDK

LLM-driven оркестрація (агент із tools + handoffs планує сам) vs code-driven (детермінований routing через structured output, chaining, evaluator-цикл \`while\`, \`asyncio.gather\`). **Agents-as-tools** (\`Agent.as_tool()\`): manager лишає розмову собі. **Handoffs** (\`handoffs=[...]\`): спеціаліст володіє рештою ходу; за замовчуванням передається вся історія, \`input_filter\` (наприклад \`remove_all_tools\`) обрізає. OpenAI-гайд: максимізуй одного агента; розділяй, коли промпт стає купою if-гілок або tools перекриваються (> 10–15).

## LangGraph: supervisor vs swarm

Виміряно (focused.io, 2026-03): supervisor ~4.2 с / 2.8k токенів / 94 % точності маршрутизації vs swarm ~2.8 с / 1.9k / 91 %. Збої й ліки: routing loops (додати resolution-нотатки у контекст supervisor), swarm ping-pong (жорсткий ліміт handoff_count ≈ 3), втрата контексту при handoff (передавати через \`Command.update\`), вузьке місце supervisor (keyword fast-path). Пропускай мультиагент при < 3 доменах або без per-agent evals.

## Google ADK: 8 патернів на примітивах

SequentialAgent + \`output_key\`; coordinator (\`LlmAgent\` + \`sub_agents\`); ParallelAgent з унікальними output_keys (щоб не було гонок); AgentTool для ієрархії; generator–critic (Sequential + LoopAgent з умовою виходу); LoopAgent з \`max_iterations\`/\`escalate\`; human-in-the-loop через паузуючі tools. Порада: \`session.state\` як спільна робоча область; \`description\` агента — це API-документація для маршрутизації; починай із sequential.

## AG2 і CrewAI

AG2 group chat: DefaultPattern (явні handoffs), AutoPattern (LLM обирає наступного), RoundRobin, Manual. CrewAI: Crews (ролі + задачі, sequential або hierarchical з manager) і Flows (event-driven \`@start/@listen/@router\`); рекомендація — Flows оркеструють Crews. Рольові «PM/dev/QA» crews у продакшні працюють погано — див. збої ChatDev/MetaGPT у наступному уроці.
`,
      tasks: [
        { id: 'm4l3t1', kind: 'build', title: 'Один бот — два способи', md: `Побудуй support-бота з 3 доменами (billing / tech / refund) двічі: як manager (agents-as-tools) і як handoffs/swarm (OpenAI Agents SDK, LangGraph або ADK). На 30 тестових діалогах виміряй латентність, токени, точність маршрутизації. Додай ліміт handoff_count і подивись, скільки разів спрацював.` },
        { id: 'm4l3t2', kind: 'build', title: 'Generator–critic для коду', md: `Зроби цикл: generator пише функцію за spec, critic (окремий контекст, лише spec + код + вивід тестів) повертає список дефектів або «pass»; max 3 ітерації. Заміряй, на якій ітерації зазвичай pass, і чи є випадки, де critic «пропускає» без запуску тестів.` },
      ],
      quiz: [
        { q: 'У чому різниця між agents-as-tools і handoffs?', options: ['Немає', 'При agents-as-tools manager тримає розмову; при handoff спеціаліст володіє рештою ходу', 'Handoffs працюють лише в LangGraph'], answer: 1, explain: 'Різна модель контролю й трейсів.' },
        { q: 'Як лікують «пінг-понг» у swarm?', options: ['Більше агентів', 'Жорсткий ліміт кількості handoffs (~3) і resolution-нотатки', 'Вимкнути tools'], answer: 1, explain: 'Обмеження переходів — стандартний guardrail.' },
      ],
      sources: [
        { t: 'OpenAI Agents SDK — Orchestrating multiple agents; Handoffs', u: 'https://openai.github.io/openai-agents-python/multi_agent/' },
        { t: 'OpenAI — A practical guide to building agents (PDF)', u: 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf', d: '2025-04' },
        { t: 'focused.io — Multi-agent orchestration in LangGraph: supervisor vs swarm', u: 'https://focused.io/lab/multi-agent-orchestration-in-langgraph-supervisor-vs-swarm-tradeoffs-and-architecture', d: '2026-03-25' },
        { t: 'Google — Developer’s guide to multi-agent patterns in ADK', u: 'https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/', d: '2025-12-16' },
        { t: 'AG2 — Group chat orchestration patterns', u: 'https://docs.ag2.ai/latest/docs/user-guide/advanced-concepts/orchestration/group-chat/patterns/' },
        { t: 'CrewAI docs — Crews & Flows', u: 'https://docs.crewai.com/' },
      ],
    },
    {
      id: 'm4l4',
      title: 'Claude Code: subagents, agent teams, worktrees',
      minutes: 20,
      md: `
## Subagents

Markdown-файл з YAML-frontmatter у \`.claude/agents/\` (проєкт) або \`~/.claude/agents/\` (користувач), або \`agents={}\` в Agent SDK. Поля: \`name\`, \`description\` (керує авто-делегуванням), \`tools\` / \`disallowedTools\` (включно з \`mcp__server\`-патернами і \`Agent(worker, researcher)\` — які субагенти може спавнити координатор), \`model\` (haiku / sonnet / opus / inherit), \`permissionMode\`, \`skills\`, \`memory\` (персистентний MEMORY.md), \`maxTurns\`, \`background\`, \`isolation: worktree\`, \`hooks\`, \`effort\`, \`omitClaudeMd\`.

\`\`\`markdown
---
name: verifier
description: Перевіряє результат задачі за критеріями. Використовуй перед завершенням фічі.
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 30
---
Ти незалежний верифікатор. Отримуєш критерії успіху й шлях до змін.
Ти МУСИШ запустити повний набір тестів перед висновком.
Звітуй: PASS/FAIL, докази (вивід команд), список невідповідностей із file:line.
Не виправляй код. Не оцінюй стиль.
\`\`\`

Вбудовані: Explore (read-only, пропускає CLAUDE.md), Plan, general-purpose. Субагент стартує з нуля: свій промпт + CLAUDE.md + git status, **без історії батька** — тому бриф має нести шляхи, помилки, рішення. Фонові за замовчуванням, resumable за agentId, іменовані можуть обмінюватись повідомленнями (SendMessage), вкладеність 3, конкурентність 20, у SDK — \`max_budget_usd\`. Вивід субагентів сканується на текст, схожий на prompt injection.

Коли: об'ємні виводи (тести, логи), самодостатні задачі, обмеження tools, паралельні незалежні дослідження. Коли ні: багато туди-сюди, фази з великим спільним контекстом, швидкі правки, чутливість до латентності. Вартість: Haiku/Sonnet для воркерів; agent teams у plan mode ≈ 7× токенів; середній enterprise-кошт ~$13/розробник/активний день.

## Agent Teams (експериментально)

\`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1\`. Team = lead-сесія + teammates (повні незалежні сесії) + спільний task list (pending / in-progress / completed, залежності, claim з файловим локом) + mailbox (JSON-інбокси; повідомлення позначені як від іншого агента і не можуть давати дозволи).

Subagents vs teams: субагент повертає результат викликачу (дешевше); teammates спілкуються й самокоординуються (дорожче, краще для дебатів і review). Найкращі кейси: паралельний code review з різними лінзами (security / perf / tests), дебаг конкуруючих гіпотез («спростуйте одне одного»), cross-layer фічі з володінням файлами per teammate.

[[diagram:delegation-options|Три механізми делегування та правила їх комбінування.]]

Практики: 3–5 teammates; 5–6 задач на кожного; ніколи два агенти в одному файлі; починай із read-only задач; plan mode → plan approval; quality gates через hooks TeammateIdle / TaskCreated / TaskCompleted (exit 2 = відхилити з фідбеком); Sonnet для teammates. Обмеження: без вкладених teams, lead фіксований, статуси задач можуть відставати.

## Worktrees

\`claude --worktree <name>\` створює \`.claude/worktrees/<name>\` на гілці \`worktree-<name>\`; \`isolation: worktree\` для субагента; enforcement блокує правки й git-команди поза worktree; \`.worktreeinclude\` копіює gitignored \`.env\`; гілка з PR: \`--worktree "#1234"\`. DeepLearning.AI-курс Claude Code показує worktrees для кількох фіч одночасно; \`/batch\` розкидає задачу по worktrees. Headless: \`claude -p\` з \`--allowedTools\` і JSON-виводом для fan-out у скриптах.

:::warn Повідомлення між агентами — недовірений вхід
Claude Code позначає такі повідомлення й не дозволяє через них надавати дозволи. Той самий принцип — для будь-якої твоєї системи: агент не може «схвалити» дію іншому агенту.
:::
`,
      tasks: [
        { id: 'm4l4t1', kind: 'build', title: 'Три субагенти для репо', md: `Створи у .claude/agents/: (1) explorer — read-only дослідник з grep/glob, (2) test-runner — запускає цільові тести й повертає лише падіння, (3) verifier — з уроку 2.5. Дай агенту фічу й переконайся, що він делегує правильно. Подивись /usage: скільки контексту заощадив основний агент?` },
        { id: 'm4l4t2', kind: 'practice', title: 'Team-review з трьома лінзами', md: `Увімкни agent teams. На готовому PR запусти 3 teammates: security, performance, tests. Порівняй знахідки з людським review. Додай hook TaskCompleted, що відхиляє задачу без file:line у звіті.` },
      ],
      quiz: [
        { q: 'Що бачить субагент Claude Code на старті?', options: ['Всю історію батьківської сесії', 'Свій промпт + CLAUDE.md + git status; історії батька немає', 'Лише системний промпт'], answer: 1, explain: 'Тому бриф має нести все потрібне: шляхи, помилки, рішення.' },
        { q: 'Коли обирати agent team замість субагентів?', options: ['Для будь-якої паралельності', 'Коли агентам треба спілкуватись і самокоординуватись: дебати, review з різними лінзами, cross-layer фічі', 'Для економії токенів'], answer: 1, explain: 'Team ≈ 7× токенів; субагенти дешевші, коли достатньо повернути результат.' },
        { q: 'Головне правило teams щодо файлів?', options: ['Кожен teammate має доступ до всіх файлів', 'Два агенти ніколи не редагують один файл; володіння файлами або worktrees', 'Файли лише read-only'], answer: 1, explain: 'Single-writer на рівні файла.' },
      ],
      sources: [
        { t: 'Claude Code docs — Subagents', u: 'https://code.claude.com/docs/en/sub-agents' },
        { t: 'Claude Code docs — Agent Teams', u: 'https://code.claude.com/docs/en/agent-teams' },
        { t: 'Claude Code docs — Git Worktrees', u: 'https://code.claude.com/docs/en/worktrees' },
        { t: 'Claude Code docs — Costs', u: 'https://code.claude.com/docs/en/costs' },
        { t: 'Anthropic Academy — Introduction to Subagents', u: 'https://anthropic.skilljar.com/introduction-to-subagents' },
        { t: 'DeepLearning.AI — Claude Code: A Highly Agentic Coding Assistant (worktrees)', u: 'https://www.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant' },
        { t: 'Frontend Masters — Claude Code (Lydia Hallie, agent teams)', u: 'https://frontendmasters.com/courses/claude-code/' },
      ],
    },
    {
      id: 'm4l5',
      title: 'Режими збоїв: MAST і як їх лікувати',
      minutes: 15,
      md: `
## Таксономія MAST (UC Berkeley, NeurIPS 2025)

1 600+ анотованих трейсів, 7 фреймворків (ChatDev, MetaGPT, HyperAgent, AppWorld, AG2, Magentic-One, OpenManus), 14 режимів збоїв у 3 категоріях; узгодженість анотаторів κ = 0.88; LLM-суддя погоджується з людьми — тож таксономію можна використовувати як eval-пайплайн.

[[diagram:mast|Три категорії збоїв із частками. Найбільша — дизайн системи й специфікацій.]]

## Що це означає

Збої — переважно **організаційні**, а не «слабка модель». Кейси: AG2 MathChat 84.25 % → 89 % (правка промптів) / 88.83 % (зміна топології); ChatDev 25 % → 34.4 % (промпти) / 40.6 % (циклічна топологія). Приріст реальний, але скромний — глибокі проблеми дизайну промптами не закриваються.

## Ліки за категоріями

**Специфікація/дизайн (44 %)**: явні ролі й умови зупинки; \`maxTurns\`, ліміти ітерацій; структуровані задачі з критеріями «done»; loop detection (LangChain: лічильник правок файлу).

**Міжагентна неузгодженість (32 %)**: структурований протокол повідомлень (ціль / формат / межі); передача повного контексту при fork (Cognition 2026: «повні форки контексту переносяться краще за часткові»); ліміт handoffs; поширення відкриттів (sibling discovery) через спільний файл-ledger; агент має право й обов'язок питати уточнення.

**Верифікація (24 %)**: verifier виконує щось (тести, схеми, hooks з exit 2), а не «виглядає добре»; багаторівнева перевірка (юніт + інтеграційна + E2E); заборона самооцінки.

## Що досі не працює (Cognition, 2026)

Паралельні письменники (swarm writers); неструктуровані мережі агентів («здебільшого відволікання»); поширення відкриттів від дитини до сиблінгів; надто директивні менеджери без контексту кодової бази; слабка модель не знає, коли ескалювати до сильної. «Усі відкриті проблеми — це проблеми комунікації».

## Економіка й операції

3–15× токенів; teams ~7×; паралелізм додає повноту, не обов'язково швидкість; помилки ампліфікуються 17× у некоординованих незалежних агентах. Операційне: колізії правок (worktrees / володіння файлами), застарілі статуси задач, осиротілі teammates, промахи кешу, шторми permission-prompts. Безпека: injection, ретрансльований через повідомлення агентів.
`,
      tasks: [
        { id: 'm4l5t1', kind: 'practice', title: 'Анотуй 10 трейсів за MAST', md: `Візьми 10 трейсів своєї мультиагентної системи (або субагентів Claude Code) з невдалим результатом. Познач кожен кодом MAST (FM-1.x / 2.x / 3.x). Яка категорія домінує? Обери одну зміну (промпт, топологія або верифікація) і повтори прогін.` },
        { id: 'm4l5t2', kind: 'build', title: 'Loop detector', md: `Реалізуй (hook або middleware) лічильник правок одного файлу за сесію; після 4 — інжект повідомлення «змінити підхід: опиши іншу гіпотезу», після 8 — зупинка з ескалацією до людини. Перевір на задачі, де агент зазвичай зациклюється.` },
      ],
      quiz: [
        { q: 'Яка категорія збоїв у MAST найбільша?', options: ['Верифікація', 'Дизайн системи/специфікацій (44 %)', 'Міжагентна неузгодженість'], answer: 1, explain: 'Порушення спеки, повторення кроків, невідома умова зупинки.' },
        { q: 'Головний висновок MAST?', options: ['Потрібні сильніші моделі', 'Збої — проблеми організаційного дизайну; лікуються ролями, протоколами та виконуваною верифікацією', 'Мультиагент не працює'], answer: 1, explain: 'Промпт- і топологічні правки дали реальні, але скромні прирости.' },
      ],
      sources: [
        { t: 'Cemri et al. — Why Do Multi-Agent LLM Systems Fail? (MAST, arXiv 2503.13657)', u: 'https://arxiv.org/abs/2503.13657', d: 'NeurIPS 2025' },
        { t: 'Cognition — Multi-Agents: What’s Actually Working', u: 'https://cognition.com/blog/multi-agents-working', d: '2026-04-22' },
        { t: 'Google Research — Towards a Science of Scaling Agent Systems (arXiv 2512.08296)', u: 'https://arxiv.org/abs/2512.08296' },
        { t: 'UC Berkeley — Agentic AI MOOC Fall 2025', u: 'https://agenticai-learning.org/f25' },
      ],
    },
    {
      id: 'm4l6',
      title: 'Протоколи: MCP і A2A',
      minutes: 12,
      md: `
## Два кордони

**MCP** — кордон «агент ↔ tools/дані». **A2A** — кордон «агент ↔ агент» між організаціями чи вендорами. Формула Google: «MCP = tools для агента, A2A = агенти говорять з агентами». Всередині одного застосунку оркеструй фреймворком, а не протоколом.

## MCP у 2026

Ревізія 2026-07-28: протокол stateless (без session header і initialize; \`server/discover\`); довгі операції — офіційне розширення **tasks** (\`tasks/get\` polling, \`tasks/update\`) — так MCP-сервер обгортає довготривалого субагента (Cognition: «manager Devin координує дочірніх через MCP»); Multi Round-Trip Requests замість sampling/elicitation з боку сервера; OpenTelemetry trace-context у \`_meta\`; детермінований порядок \`tools/list\` для кешу промптів; auth hardening (CIMD замість DCR). Anthropic Academy має два безкоштовних курси (Intro + Advanced, Python SDK) з інспектором, транспортами, resources, prompts.

## A2A

Анонсовано 2025-04, передано Linux Foundation 2025-06, v1.0 — березень 2026; 150+ організацій; сумісність ADK, LangGraph, AG2, CrewAI. Механіка: Agent Cards (тепер підписані) описують можливості; tasks / messages / artifacts; streaming і push-нотифікації. Розширення: AP2 (платежі), A2UI.

## Безпека протоколів

Описи tools MCP — вектор injection (tool poisoning); недовірені сервери = недовірений код. Повідомлення A2A від чужого агента — дані, не інструкції. Підписані Agent Cards і allowlist серверів — мінімум.

## Практика

Для внутрішніх систем: тонкий CLI (Модуль 2.4) часто краще за MCP. MCP — коли tool потрібен багатьом агентам/клієнтам одночасно. A2A — коли агенти належать різним командам чи компаніям і не можуть ділити код.
`,
      tasks: [
        { id: 'm4l6t1', kind: 'build', title: 'MCP-сервер із tasks', md: `Напиши мінімальний MCP-сервер (Python або TS SDK) з одним tool, що запускає довгу операцію (наприклад, прогін тестів або субагента) через tasks-розширення: клієнт створює task, поллить статус, отримує результат. Підключи до Claude Code і перевір, що контекст не забивається проміжними виводами.` },
      ],
      quiz: [
        { q: 'Коли доречний A2A, а не MCP?', options: ['Для будь-якого виклику tool', 'Коли взаємодіють агенти різних команд/вендорів, які не ділять код', 'Для читання файлів'], answer: 1, explain: 'MCP — tools для агента; A2A — агент до агента між організаціями.' },
        { q: 'Що дає tasks-розширення MCP?', options: ['Швидший транспорт', 'Довготривалі операції з polling/оновленнями — можливість обгорнути субагента', 'Автентифікацію'], answer: 1, explain: 'Ключове для довгих агентних операцій за MCP.' },
      ],
      sources: [
        { t: 'MCP — Specification changelog 2026-07-28', u: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog' },
        { t: 'MCP — Tasks extension SEP', u: 'https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/seps/2663-tasks-extension.md' },
        { t: 'Google Open Source — A year of A2A', u: 'https://opensource.googleblog.com/2026/04/a-year-of-open-collaboration-celebrating-the-anniversary-of-a2a.html', d: '2026-04-16' },
        { t: 'A2A protocol — spec repo', u: 'https://github.com/a2aproject/A2A' },
        { t: 'Anthropic Academy — Introduction to MCP', u: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol' },
      ],
    },
  ],
};
