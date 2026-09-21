export default {
  id: 'm5',
  icon: '🔬',
  title: 'Тестування, Evals та Observability',
  subtitle: 'TDD з агентами, AI code review, error analysis, LLM-as-judge, трейсинг і регресійні eval-и в CI.',
  intro: `Harness без вимірювання — набір забобонів. Цей модуль — про те, як знати, що зміни працюють: від тестів, які агент не може обійти, до eval-пайплайну за методом Husain & Shankar.`,
  lessons: [
    {
      id: 'm5l1',
      title: 'TDD з агентами та AI code review',
      minutes: 16,
      md: `
## Test-first як guide і sensor одночасно

Spec Kit (стаття III constitution), BMAD (RED → GREEN → REFACTOR per AC), Anthropic best practices — усі радять: тести спершу, підтверджено, що падають, потім код. Для агента тест — це і специфікація поведінки (guide), і сигнал завершення (sensor). Промпт: «напиши тести для FR-012 за сценаріями зі spec; запусти; переконайся, що падають; НЕ пиши реалізацію». Окремою сесією — «зроби тести зеленими, не змінюючи їх».

Правила, що мають бути hooks, а не побажаннями: тести не редагуються без явного дозволу (PreToolUse на \`tests/\`); Stop hook запускає цільові тести; заборона \`skip\`/\`only\`/послаблення assertion (lint).

## Що агент тестує погано

Böckeler: behaviour-harness найслабший — ШІ-тести часто перевіряють реалізацію, а не поведінку, і дублюють код. Ліки: тести з spec (EARS → тест 1:1), property-based тести для інваріантів, контрактні/інтеграційні тести з реальними залежностями (Spec Kit: integration-first), E2E через браузер (Playwright MCP) для UI. Coursera «Test and Secure Your AI Code»: pytest з замоканими LLM-викликами, поріг покриття як ґейт.

## AI code review

Три рівні:

1. **Review-субагент з чистим контекстом** перед PR (Cognition: ~2 баги/PR, 58 % серйозні). Промпт — «звітуй про прогалини, не про стиль»; стиль — лінтеру.
2. **Review у CI** (Claude Code GitHub Actions, Copilot code review, Devin Review, Graphite): коментарі на PR, перевірка проти spec/PLAN.md, security-лінза.
3. **Людський review** — там, де sensors сліпі: правильність діагнозу, overengineering, відповідність вимогам, продуктові рішення.

Рубрика для review-агента: (а) кожна вимога spec реалізована? (б) кожен edge case має тест? (в) зміни поза скоупом? (г) секрети, небезпечні виклики, нові залежності? (д) що б зламалося у продакшені?

## Review PR, зроблених агентами

Stanford CS146S відводить цьому окремий тиждень. Практики: PR має містити spec-ID, план, докази (вивід тестів, скріншоти), список припущень. Малі батчі (DORA: small batches — одна з 7 AI capabilities). Reviewer читає spec і докази раніше за diff.

:::tip Дві сесії
Writer і Reviewer — різні сесії з різним контекстом. Автор не бачить своїх сліпих плям; рев'юер, що бачив хід думок автора, — теж.
:::
`,
      tasks: [
        { id: 'm5l1t1', kind: 'practice', title: 'Test-first у дві сесії', md: `Обери вимогу зі свого spec. Сесія 1: агент пише тести й підтверджує падіння. Сесія 2 (свіжа): агент робить їх зеленими за забороною правити tests/. Порахуй: чи довелося правити тести після реалізації і чому.` },
        { id: 'm5l1t2', kind: 'build', title: 'Review-агент у CI', md: `Налаштуй review-агента на PR (GitHub Actions + Claude Code або аналог) з рубрикою з уроку. Прожени на 5 останніх PR. Скільки знахідок справжні? Скільки — шум? Відкалібруй промпт і додай «не коментуй стиль».` },
      ],
      quiz: [
        { q: 'Чому тести спершу — важливо саме для агентів?', options: ['Бо так швидше', 'Тест одночасно специфікує поведінку (guide) і дає сигнал завершення (sensor), який агент не може «оголосити»', 'Бо агенти не вміють писати код без тестів'], answer: 1, explain: 'Плюс hooks, що забороняють правити тести.' },
        { q: 'Що має робити review-агент, а що — лінтер?', options: ['Обидва — стиль', 'Review-агент — прогалини у вимогах, edge cases, скоуп, безпека; лінтер — стиль', 'Review-агент — усе'], answer: 1, explain: 'Інференційний sensor для того, що не формалізується; обчислювальний — для решти.' },
      ],
      sources: [
        { t: 'Anthropic — Claude Code Best Practices (tests, adversarial review)', u: 'https://code.claude.com/docs/en/best-practices' },
        { t: 'Birgitta Böckeler — Harness engineering (behaviour harness)', u: 'https://martinfowler.com/articles/harness-engineering.html', d: '2026-04-02' },
        { t: 'Cognition — Multi-Agents: What’s Actually Working (Devin Review)', u: 'https://cognition.com/blog/multi-agents-working', d: '2026-04-22' },
        { t: 'Stanford CS146S — The Modern Software Developer', u: 'https://themodernsoftware.dev/' },
        { t: 'Coursera — Test and Secure Your AI Code', u: 'https://www.coursera.org/learn/test-and-secure-your-ai-code' },
      ],
    },
    {
      id: 'm5l2',
      title: 'Evals: error analysis → LLM-as-judge → CI',
      minutes: 20,
      md: `
## Метод Husain & Shankar

Курс «AI Evals for Engineers & PMs» (Maven, $4 200, 15 сесій) — де-факто стандарт дисципліни. Порядок принциповий:

[[diagram:evals-loop|Трейси → error analysis → валідований суддя → регресія в CI → зміна одного елемента harness → знову.]]

1. **Інструментування**: логуй усе — промпти, tool-виклики, виводи, час, токени.
2. **Error analysis**: читай трейси руками. Open coding (вільні нотатки про кожен збій) → axial coding (групування у режими збоїв). MAST — приклад готової таксономії для мультиагентів. Без цього кроку метрики вимірюють не те.
3. **Судді**: code-based (детерміновані перевірки: чи є file:line, чи пройшли тести, чи не змінено файли поза скоупом) там, де можна; **LLM-as-judge** — для решти, але тільки **валідований проти експертних міток** (виміряй agreement судді з людьми на 50–100 прикладах; калібруй промпт судді).
4. **CI regression**: набір задач + судді запускаються на кожну зміну промпту, harness, моделі.
5. **Red-teaming**: prompt injection, небезпечні tool-виклики.
6. **Контрольовані експерименти**: точність vs латентність vs вартість; одна змінна за раз.
7. **Моніторинг у продакшені** і дрейф.

## Що оцінювати в coding-агентах

- **Кінцевий стан**: тести пройшли, spec-вимоги покриті, CI зелений, diff без зайвого.
- **Траєкторія**: кількість tool-викликів, повторів, правок одного файлу, звернень до людини (Arize: trajectory evals, convergence scoring).
- **Маршрутизація** (мультиагент): routing accuracy, resolution coverage, довжина ланцюга handoffs.
- **Економіка**: токени, вартість, час до зеленого CI.

## Види eval-ів для агентів (Arize / DLAI)

- **Router / tool-selection evals**: чи обрав агент правильний tool/субагента для запиту — точність маршрутизації по кроках.
- **Skill evals**: якість окремого кроку (згенерований SQL, витягнуті дані) незалежно від решти.
- **Trajectory evals**: чи траєкторія «збігається» до результату — convergence score (кількість кроків відносно оптимальної), повтори, зайві виклики.
- **End-state evals**: чи виконано задачу — тести, spec-покриття, diff-scope.
- **Judge validation**: TPR/TNR судді проти людських міток; корекція зміщення оцінок (Shankar: «judgy»); суддя — теж модель, яка дрейфує.
- **Skill/plugin evals**: \`claude plugin eval\` — набір задач для skill у репо, регресія в CI (Модуль 9.2).

## Скільки даних

Anthropic: ~20 реальних задач достатньо, щоб побачити великі ефекти. Починай із «золотого» набору з реальних задач репозиторію (з Модуля 2.1 — ті самі 5 PR), розширюй у міру збоїв.

## Інструменти

LangSmith (LangChain Academy має безкоштовний курс «Agent Observability & Evaluation»), Arize Phoenix (DLAI «Evaluating AI Agents»), Langfuse, Braintrust; OpenTelemetry GenAI semantic conventions для vendor-нейтральних трейсів (MCP тепер передає trace-context у \`_meta\`).

:::warn Найпоширеніша помилка
Почати з LLM-судді загального призначення («оціни якість від 1 до 10») без error analysis і без валідації. Такий суддя вимірює власні упередження.
:::
`,
      tasks: [
        { id: 'm5l2t1', kind: 'practice', title: 'Error analysis на 20 трейсах', md: `Збери 20 трейсів агента (мінімум 8 із невдалим результатом). Зроби open coding — по 1–2 речення на кожен збій. Згрупуй в 4–7 режимів. Який найчастіший? Це визначає наступну зміну harness.` },
        { id: 'm5l2t2', kind: 'build', title: 'Регресійний eval у CI', md: `Зроби набір із 10–20 задач для навчального репо з code-based перевірками (тести, file-scope, наявність доказів) і одним валідованим LLM-суддею. Запускай на кожну зміну CLAUDE.md/hooks/skills. Запиши baseline pass rate.` },
      ],
      quiz: [
        { q: 'Що робити ПЕРЕД написанням LLM-судді?', options: ['Обрати модель судді', 'Error analysis: прочитати трейси, закодувати режими збоїв', 'Купити LangSmith'], answer: 1, explain: 'Інакше суддя вимірює не те, що ламається.' },
        { q: 'Як валідують LLM-as-judge?', options: ['Ніяк, він самодостатній', 'Порівнюють із експертними мітками на вибірці й калібрують промпт', 'Запускають двічі'], answer: 1, explain: 'Agreement з людьми — обов’язкова метрика судді.' },
      ],
      sources: [
        { t: 'Maven — AI Evals for Engineers & PMs (Husain & Shankar)', u: 'https://maven.com/parlance-labs/evals', d: 'когорта 2026-10' },
        { t: 'DeepLearning.AI — Evaluating AI Agents (Arize)', u: 'https://www.deeplearning.ai/courses/evaluating-ai-agents' },
        { t: 'LangChain Academy — Agent Observability & Evaluation', u: 'https://academy.langchain.com/courses/building-reliable-agents' },
        { t: 'Anthropic — multi-agent research system (evaluation)', u: 'https://www.anthropic.com/engineering/multi-agent-research-system', d: '2025-06-13' },
        { t: 'MAST — Why Do Multi-Agent LLM Systems Fail?', u: 'https://arxiv.org/abs/2503.13657' },
      ],
    },
    {
      id: 'm5l3',
      title: 'Пам’ять агентів і retrieval у кодовій базі',
      minutes: 12,
      md: `
## Три горизонти пам'яті

- **Сесія**: контекст + нотатки (progress.md), компакція.
- **Проєкт**: CLAUDE.md / AGENTS.md, \`.claude/rules/\`, docs/, spec-и, feature list, MEMORY.md субагентів (Claude Code: \`memory: project\`).
- **Організація**: skills, plugins, registry знань (Tessl), спільні spec (OpenSpec Stores).

DeepLearning.AI (Oracle) описує memory-first архітектуру: типи пам'яті, менеджер пам'яті, **семантична пам'ять tools** (шукати tool за описом замість завантажувати всі), операції extraction / consolidation / self-update. Для coding-агентів найпрактичніше: файлова пам'ять у репо (версійована, видима людям) плюс автоматичні нотатки агента, які людина періодично ревізує.

## Операції пам'яті (DLAI / Oracle, Letta)

Memory-first архітектура має три операції: **extraction** (з розмови/сесії витягти факти, рішення, преференції — не все підряд), **consolidation** (злити з наявним: оновити, а не дописати; вирішити конфлікти; видалити застаріле), **self-updating** (агент сам вирішує, коли записати, з обмеженим бюджетом на пам'ять). Типи: епізодична (що сталося), семантична (факти про проєкт), процедурна (як робити — це skills). **Semantic tool memory**: при 50+ tools їх описи не завантажуються всі — агент шукає tool за описом (той самий принцип, що Tool Search Tool у Claude Code).

Claude Code: автопам'ять у \`~/.claude/projects/…/memory\`, швидке збереження факту через \`#\` на початку повідомлення (записується у CLAUDE.md за вибором), поле \`memory:\` у субагентів (MEMORY.md на рівні user/project/local). Усе це — файли в репо або на диску, які варто рев'юїти як код (Модуль 6).

## Retrieval: agentic grep переміг embeddings

У 2025–2026 coding-агенти майже відмовились від векторного RAG по коду на користь **агентного пошуку**: grep/glob/LSP + читання файлів на вимогу (Claude Code, Codex). Дослідження GrepRAG (2026) підтверджує конкурентність. Embeddings лишаються корисними для нечіткого пошуку в документації, тікетах, обговореннях. Repo map (структура + сигнатури) як стартовий контекст — компроміс.

Практика: зроби кодову базу «harnessable» (Böckeler): типізація, чіткі модулі, стандартні фреймворки, LLM-оптимізовані довідки у \`docs/references/\` (OpenAI), \`.claude/rules/\` для path-scoped знань.

## Гігієна пам'яті

Doc-gardening (Модуль 2.7): застарілі нотатки шкодять більше, ніж їх відсутність. Раз на спринт — ревізія MEMORY.md і docs/ агентом + людиною.
`,
      tasks: [
        { id: 'm5l3t1', kind: 'build', title: 'docs/references для агента', md: `Створи 2–3 LLM-оптимізовані довідки (короткі, з прикладами, без маркетингу) для найчастіше неправильно використовуваних внутрішніх API/бібліотек у твоєму репо. Додай посилання з CLAUDE.md. Перевір на задачі, де агент раніше помилявся.` },
      ],
      quiz: [
        { q: 'Який спосіб retrieval по коду домінує у coding-агентах 2026?', options: ['Векторний RAG по всьому коду', 'Агентний пошук: grep/glob/LSP + читання на вимогу', 'Завантаження всього репо в контекст'], answer: 1, explain: 'Embeddings — для документації й тікетів; код — агентним пошуком.' },
      ],
      sources: [
        { t: 'DeepLearning.AI — Agent Memory: Building Memory-Aware Agents (Oracle)', u: 'https://www.deeplearning.ai/courses/agent-memory-building-memory-aware-agents' },
        { t: 'Anthropic — Effective context engineering (agentic memory, JIT retrieval)', u: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', d: '2025-09-29' },
        { t: 'GrepRAG (arXiv 2601.23254)', u: 'https://arxiv.org/abs/2601.23254', d: '2026' },
        { t: 'Claude Code docs — Subagents (memory field)', u: 'https://code.claude.com/docs/en/sub-agents' },
      ],
    },
  ],
};
