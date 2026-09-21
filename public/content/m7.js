export default {
  id: 'm7',
  icon: '📊',
  title: 'Команда, метрики та адопція',
  subtitle: 'Від vibe coding до agentic engineering; DORA 2025; парадокс METR; що вимірювати й як впроваджувати.',
  intro: `Інструменти однакові в усіх — різниця у дисципліні. Цей модуль про те, як перевести команду на рівень agentic engineering і довести, що це працює, цифрами, а не відчуттями.`,
  lessons: [
    {
      id: 'm7l1',
      title: 'Драбина: vibe coding → agentic engineering',
      minutes: 12,
      md: `
## Три рівні

[[diagram:ladder|Той самий інструмент, різна дисципліна.]]

Ed Donner (Udemy, 95k студентів) будує курс саме як драбину: тиждень 1 — vibe coding (Cursor, Copilot, швидкі прототипи); тиждень 2 — vibe engineering (Claude Code CLI, review, рефакторинг, MCP); тиждень 3 — agentic engineering (субагенти, великі кодові бази, hooks, sandbox). Anthropic «Claude Code in Action» додає ключову компетенцію 3-го рівня: **верифікація неконтрольованих прогонів** — довіряти автономній роботі можна лише через hooks-ґейти, evals і докази.

## Що відрізняє рівень 3

- Робота починається зі spec або плану, а не з промпту.
- Harness (інструкції, hooks, лінтери, sandbox) існує як код у репо, з review.
- Є субагенти з чіткими ролями й read-only за замовчуванням.
- Кожен PR агента несе докази; review дивиться на spec і докази раніше за diff.
- Є eval-набір і метрики, що впливають на рішення.
- Рівень автономності підвищується за критеріями, а не за ентузіазмом.

## Ролі змінюються

OpenAI: інженер стає дизайнером середовища й декомпозитором задач. Böckeler: людський judgement — туди, де sensors сліпі. Sean Grove: найцінніша навичка — писати чіткі spec. CS146S (тиждень 10, a16z): майбутні ролі — «інженер систем агентів», «спеціаліст із намірів», «куратор якості».

## Відповідальність

Код агента — це твій код. PR під твоїм ім'ям означає, що ти розумієш, що там і чому. «Я не читав, це агент» — не аргумент ні для інциденту, ні для security-аудиту.
`,
      tasks: [
        { id: 'm7l1t1', kind: 'reflect', title: 'Де твоя команда', md: `За шістьма ознаками рівня 3 оціни команду: 0 / частково / так. Які дві ознаки найдешевше закрити за 2 тижні? Які найважче й чому?` },
      ],
      quiz: [
        { q: 'Що є ключовою компетенцією agentic engineering за Anthropic Academy?', options: ['Швидкий промптинг', 'Верифікація неконтрольованих (автономних) прогонів через ґейти, evals, докази', 'Знання всіх MCP-серверів'], answer: 1, explain: 'Автономія без верифікації — це рівень 1 з більшою швидкістю помилок.' },
      ],
      sources: [
        { t: 'Udemy — AI Coder: Complete Claude Code & Coding Agents Course (Ed Donner)', u: 'https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/', d: 'оновлено 2026-06' },
        { t: 'Anthropic Academy — Claude Code in Action', u: 'https://anthropic.skilljar.com/claude-code-in-action' },
        { t: 'Stanford CS146S — The Modern Software Developer', u: 'https://themodernsoftware.dev/' },
        { t: 'Anthropic — 2026 Agentic Coding Trends Report', u: 'https://resources.anthropic.com/2026-agentic-coding-trends-report' },
      ],
    },
    {
      id: 'm7l2',
      title: 'DORA 2025, METR і що насправді вимірювати',
      minutes: 16,
      md: `
## DORA 2025: ШІ — підсилювач

State of AI-assisted Software Development (2025-09): 90 % використовують ШІ, > 80 % відчувають зростання продуктивності, 30 % мало довіряють ШІ-коду. ШІ підвищує throughput, але **стабільність доставки все ще падає**. Теза: ШІ підсилює те, що є, — сильні команди стають сильнішими, слабкі — швидше ламають прод.

**AI Capabilities Model — 7 здатностей**: чітка й комунікована позиція щодо ШІ; здорові дані; ШІ-доступні внутрішні дані; сильний version control; малі батчі; фокус на користувачі; якісні внутрішні платформи. Зверни увагу: «ШІ-доступні внутрішні дані» — це буквально «репозиторій як система обліку» з Модуля 2.

## METR: парадокс −19 %

RCT (2025-07): 16 досвідчених open-source розробників, 246 задач, Cursor Pro. З ШІ вони були **на 19 % повільніші**, при цьому вірили, що на 20 % швидші. Чинники: над-оптимізм, глибоке знання своїх репо, великі складні кодові бази, низька надійність ШІ, неявний контекст репо. Застереження: інструменти початку 2025, специфічна вибірка.

Урок для курсу: там, де контекст неявний, а кодова база велика й знайома людині, — ШІ без harness гальмує. Саме harness (явний контекст у репо, sensors, spec) прибирає ці чинники. І: **самооцінка продуктивності не є метрикою**.

## Що вимірювати

Замість «рядків прийнятого коду» й опитувань:

| Категорія | Метрики |
|---|---|
| Потік | lead time, deployment frequency, time-to-merge PR агента |
| Стабільність | change failure rate, MTTR, defect escape rate |
| Якість коду агента | first-pass success, churn за 14–30 днів, «виживання» PR |
| Економіка | вартість за змерджений PR, токени на задачу, прогони CI до зеленого |
| Люди | час review на PR, втома рев'юерів, частка PR з людським втручанням |
| Harness | pass rate eval-набору, кількість спрацювань hooks/лінтерів |

Порівнюй **до/після** конкретної зміни harness, а не «з ШІ / без ШІ» взагалі.

## Впровадження

1. Пілот на одній команді з чіткою позицією (DORA capability #1) і одним репо з harness.
2. Малі батчі, короткі PR, докази в PR.
3. Метрики з таблиці — з першого дня, baseline до змін.
4. Harness-retro щомісяця; підвищення автономності за критеріями.
5. Спільні skills/plugins/rules як внутрішня платформа (DORA capability #7).

:::idea Trust calibration
30 % низької довіри DORA — не проблема, а ресурс: недовірливі рев'юери ловлять те, що sensors пропускають. Мета — не «довіряти більше», а мати обґрунтовані підстави для довіри в кожному класі задач.
:::
`,
      tasks: [
        { id: 'm7l2t1', kind: 'build', title: 'Baseline → зміна → після', md: `Візьми метрики з дашборду Модуля 2.7 (baseline). Впровадь одну зміну harness (наприклад, Stop hook + review-агент). Через 2 тижні порівняй first-pass success, churn, час review. Напиши висновок на 5 речень — з цифрами.` },
        { id: 'm7l2t2', kind: 'reflect', title: 'Сім здатностей DORA', md: `Оціни свою організацію за 7 AI capabilities (0–2 кожна). Яка найслабша? Що з курсу її закриває?` },
      ],
      quiz: [
        { q: 'Що показало дослідження METR 2025?', options: ['ШІ прискорив розробників на 20 %', 'Досвідчені розробники були на 19 % повільніші з ШІ, вважаючи себе швидшими', 'Різниці не було'], answer: 1, explain: 'Самооцінка ≠ метрика; harness прибирає чинники сповільнення.' },
        { q: 'Головна теза DORA 2025?', options: ['ШІ замінює інженерів', 'ШІ — підсилювач: підвищує throughput, але стабільність падає без відповідних здатностей', 'ШІ не впливає'], answer: 1, explain: 'Сім AI capabilities визначають, що саме підсилюється.' },
      ],
      sources: [
        { t: 'DORA 2025 — State of AI-assisted Software Development', u: 'https://dora.dev/dora-report-2025/', d: '2025-09-23' },
        { t: 'METR — Measuring the impact of early-2025 AI on experienced open-source developer productivity', u: 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/', d: '2025-07-10' },
        { t: 'Faros AI — Harness Engineering (metrics)', u: 'https://www.faros.ai/blog/harness-engineering', d: '2026-05-22' },
        { t: 'Coursera — Agentic AI Content for Practitioners: Software (team adoption)', u: 'https://www.coursera.org/learn/agentic-ai-content-for-practitioners-teams-software' },
      ],
    },
    {
      id: 'm7l3',
      title: 'Моделі, маршрутизація та вартість: від хмари до локального',
      minutes: 18,
      md: `
## Що коштує

Anthropic: токени пояснюють 80 % варіації якості research-агентів, але й 100 % рахунку. Середній enterprise-кошт Claude Code ~$13 на розробника за активний день; agent teams — ~7× токенів; мультиагент — 3–15× відносно чату. Тому вартість — інженерна змінна harness, а не бухгалтерія.

## Драбина DeepLearning.AI (JetBrains, «Cloud to Local»)

1. **Baseline**: одна задача, Claude Code з дефолтною моделлю — заміряй токени, час, якість.
2. **Субагенти**: та сама задача з explorer/test-runner субагентами — контекст основного агента менший, часто дешевше.
3. **Дешевші субагенти**: \`model: haiku\` для explore/тестів, Sonnet для реалізації, Opus для плану — «reasoning sandwich» у грошах.
4. **OpenCode + OpenRouter / Ollama / LM Studio**: open-weight моделі (GLM, Qwen, DeepSeek) для рутинних кроків.
5. **Fully local**: коли дані не можуть покидати периметр; ціна — якість і швидкість; підходить для explore, форматування, тестів, не для складних планів.

Курс дає таблицю метрик: cost per task, wall time, tokens in/out, cache hit rate, quality score — веди її для кожної конфігурації.

## Важелі економії (Andrew Ng, Agentic AI M4; Manus)

- **Кеш промпту**: стабільний префікс, CLAUDE.md коротший, tools у стабільному порядку — до 10× на вхідних токенах.
- **Менше ходів**: кращі інструкції й tools > більший бюджет. \`--max-turns\`, умова зупинки.
- **Тихі виводи**: тест-ранер лише з падіннями (Модуль 1.3).
- **Effort/thinking там, де треба**: high для плану й верифікації, low для рутин.
- **Паралелізм** економить час, не гроші; вимірюй окремо.
- **Tool Search Tool** замість 40 описів MCP-tools у контексті.

## Маршрутизація

- Поле \`model:\` у субагентах і skills; \`/model\`, \`/effort\`, \`/fast\` у сесії.
- Cognition «smart friend»: дешева модель кличе сильну для планування — працює лише при малому розриві; слабка модель не знає, коли ескалювати.
- Cross-vendor: різні моделі під різні типи підзадач — потребує провайдерної абстракції (Модуль 10.1) і evals на кожну зміну.

## Як порівнювати моделі

SWE-bench Verified, Terminal-Bench 2.0, Artificial Analysis (Ed Donner) — орієнтир, але пам'ятай: harness зсуває результат на 5+ п.п. і моделі overfit-нуті під свій harness. Вирішує **твій** eval-набір (Модуль 5.2) на **твоїх** задачах.

## Enterprise-маршрути

Bedrock / Vertex / Foundry — ті самі моделі через хмару з корпоративним білінгом і OIDC у GitHub Actions; Managed Agents — sandbox від Anthropic. Обирай за тим, де мають жити дані й секрети.
`,
      tasks: [
        { id: 'm7l3t1', kind: 'practice', title: 'Драбина вартості', md: `Одна задача × 4 конфігурації: baseline, субагенти, дешеві субагенти, OpenCode з open-weight моделлю. Таблиця: cost per task, час, токени, cache hit rate, якість (тести + твоя оцінка 1–5). Яка конфігурація — оптимум для твоїх типових задач?` },
        { id: 'm7l3t2', kind: 'build', title: 'Бюджетна політика', md: `Пропиши для команди: ліміти max-turns і $ на автономний прогін, які ролі на яких моделях, коли дозволено Opus/high effort, як рахуємо cost per merged PR. Додай у CLAUDE.md/plugin і у GitHub Actions.` },
      ],
      quiz: [
        { q: 'Який найбільший важіль економії вхідних токенів?', options: ['Менша модель', 'Стабільний префікс промпту і кеш (до 10×)', 'Вимкнути tools'], answer: 1, explain: 'Manus: KV-cache hit rate — головна метрика продакшн-агента.' },
        { q: 'Коли працює «smart friend» (дешева модель ескалює до сильної)?', options: ['Завжди', 'Лише при малому розриві можливостей — слабка модель не знає, коли ескалювати', 'Ніколи'], answer: 1, explain: 'Cognition 2026.' },
      ],
      sources: [
        { t: 'DeepLearning.AI × JetBrains — AI Coding Workflows: From Cloud to Local', u: 'https://www.deeplearning.ai/courses/ai-coding-workflows-from-cloud-to-local' },
        { t: 'DeepLearning.AI — Agentic AI (Andrew Ng, M4: latency & cost optimization)', u: 'https://www.deeplearning.ai/courses/agentic-ai/' },
        { t: 'Claude Code docs — Costs', u: 'https://code.claude.com/docs/en/costs' },
        { t: 'Manus — Context Engineering (KV-cache)', u: 'https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus' },
        { t: 'Cognition — Multi-Agents: What’s Actually Working (capability routing)', u: 'https://cognition.com/blog/multi-agents-working' },
      ],
    },
  ],
};
