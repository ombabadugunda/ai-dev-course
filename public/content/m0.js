export default {
  id: 'm0',
  icon: '🧭',
  title: 'Вступ: ментальна модель агента',
  subtitle: 'Як влаштований coding-агент, чому контекст — головний ресурс, і як пройти цей курс з максимальною користю.',
  intro: `Цей модуль дає спільну мову для всього курсу. Без розуміння agentic loop і контекстного вікна решта технік виглядає як магія; з ним — як інженерія.`,
  lessons: [
    {
      id: 'm0l1',
      title: 'Як користуватися курсом',
      minutes: 8,
      md: `
## Для кого цей курс

Для розробників, тімлідів і технічних продакт-менеджерів, які вже пробували Claude Code, Cursor, Codex CLI чи Copilot і хочуть перейти від «промпт → код → молимось» до відтворюваного інженерного процесу. Ми свідомо не прив'язуємось до одного інструмента: принципи однакові, різняться лише назви файлів і команд.

## Що всередині

Курс побудовано на первинних джерелах 2025–2026 років: інженерних постах Anthropic, OpenAI, Cognition, LangChain, Stripe, Thoughtworks; дослідженнях ETH Zürich, UC Berkeley, Google Research; документації Claude Code, Spec Kit, Kiro, OpenSpec; курсах Anthropic Academy, DeepLearning.AI, Frontend Masters, Stanford CS146S. Кожен урок закінчується списком джерел — читай оригінали, коли хочеш глибше.

Дев'ять модулів ідуть від ментальної моделі агента через context engineering і harness engineering до spec-driven development, мультиагентності, evals, безпеки та командної адопції. Останній модуль — капстоун, де все збирається в один робочий процес.

## Як працювати

Кожен урок містить теорію з принципами роботи, схеми там, де вони пояснюють механізм, завдання і короткий тест для самоперевірки. Завдання бувають трьох типів: **практика** (зроби щось у реальному репозиторії), **збудуй** (напиши артефакт: CLAUDE.md, spec, hook, субагент) і **рефлексія** (проаналізуй свій досвід). Під кожним завданням є поле для нотаток — записуй туди відповідь, посилання на PR чи спостереження. Це і є твій портфель по курсу.

:::tip Порада
Обери один реальний робочий репозиторій (можна невеликий) і проходь усі практичні завдання саме в ньому. До кінця курсу він матиме повноцінний harness: інструкції, hooks, spec-процес, субагентів і evals.
:::

## Прогрес

Прогрес зберігається локально в браузері. Щоб він синхронізувався між телефоном і ноутбуком, створи код доступу у вкладці «Код» — реєстрація не потрібна. Код можна експортувати у JSON у вкладці «Прогрес».

## Скільки часу

Близько 20–25 годин на теорію та тести і ще стільки ж на практику, якщо робити завдання чесно. Рекомендований темп — один модуль на тиждень.
`,
      tasks: [
        { id: 'm0l1t1', kind: 'practice', title: 'Обери навчальний репозиторій', md: `Обери репозиторій, у якому виконуватимеш практичні завдання курсу. Критерії: є тести (хоча б кілька), є CI або його легко додати, ти маєш право змінювати конфігурацію. Запиши назву та три речі, які в ньому зараз найбільше дратують при роботі з ШІ-агентом.` },
      ],
      quiz: [
        { q: 'Що є головним «портфелем» по курсу?', options: ['Сертифікат після тестів', 'Нотатки та артефакти у завданнях, зроблені в реальному репозиторії', 'Кількість пройдених уроків'], answer: 1, explain: 'Курс практичний: цінність — у harness, spec-процесі й субагентах, які ти збудуєш у своєму репозиторії.' },
      ],
      sources: [],
    },
    {
      id: 'm0l2',
      title: 'Agentic loop: модель + harness',
      minutes: 18,
      md: `
## Що таке coding-агент

Coding-агент — це не «розумніший автокомпліт». Це цикл: модель отримує контекст, вирішує, який інструмент викликати (прочитати файл, виконати команду, змінити код), отримує результат, і все повторюється, доки задача не завершена. Claude Code, Codex CLI, Gemini CLI, Cursor Agent, Copilot agent mode — всі побудовані на цій самій петлі.

[[diagram:agent-loop|Agentic loop: думає → діє → спостерігає → оновлює план. Усе накопичується в контекстному вікні.]]

Ключовий інсайт, який об'єднує весь курс: **агент = модель + harness**. Harness — це все навколо ваг моделі: системний промпт, файли інструкцій (CLAUDE.md / AGENTS.md), набір інструментів і MCP-серверів, дозволи й sandbox, hooks, стратегія керування контекстом, пам'ять, субагенти, цикли верифікації. LangChain у 2026 році показав це кількісно: з тією самою моделлю (GPT-5.2-Codex) на Terminal Bench 2.0 результат виріс із 52.8 % до 66.5 % — з 30-го місця в топ-5 — лише за рахунок змін у harness. Модель не змінювалась.

:::note Що таке «ваги» моделі
Ваги (weights) — це самі параметри нейромережі: мільярди чисел, отриманих під час навчання, які визначають, як модель перетворює вхідний текст на вихідний. Умовно, «мозок» моделі у вигляді величезної таблиці чисел — файл на десятки-сотні гігабайт. Коли кажуть «модель Claude» або «GPT», технічно мають на увазі саме цей набір ваг плюс код, що їх запускає.

Ключова властивість: **ваги фіксовані**. Під час використання їх не можна змінити (fine-tuning — окремий і зазвичай недоступний користувачу процес), і модель не «вчиться» від твоїх розмов — після кожного запиту вона така сама, як була.

Звідси й фраза «harness — це все навколо ваг»: оскільки саму модель змінити не можна, все, чим ти керуєш, лежить зовні — системний промпт і CLAUDE.md, набір tools, hooks, тести й лінтери, sandbox, структура репозиторію, спосіб подачі контексту, цикл «дія → перевірка → фідбек». Дві команди з однаковою моделлю отримують радикально різні результати не через ваги, а через обв'язку навколо них. Harness engineering — інженерія того шару, який ти реально контролюєш.
:::

## Контекстне вікно — обмежений ресурс

Кожна ітерація циклу додає токени: системний промпт, інструкції, описи tools, історія, виводи команд, diff-и. Контекст — це «бюджет уваги»: чим більше в ньому низькорелевантного шуму, тим гірше модель тримає задачу. Дослідження context rot (Chroma, 2025) та практика показують «dumb zone» — зону, де точність різко падає ще до формального ліміту. Тому майже всі техніки курсу зводяться до одного: **тримати в контексті правильні речі й нічого зайвого**.

## Чотири важелі

У кожного агента є чотири важелі, які ти контролюєш:

1. **Інструкції** — що агент знає про проєкт до початку задачі (CLAUDE.md, rules, skills).
2. **Інструменти** — що агент може робити і як оформлені результати (bash, edit, MCP, CLI-обгортки).
3. **Ґейти** — що відбувається автоматично до чи після дій (hooks, permissions, sandbox, CI).
4. **Структура задачі** — як ти нарізаєш роботу (план, spec, одна фіча на сесію, субагенти).

Модулі 1–4 розбирають ці важелі детально, модулі 5–7 — як перевіряти, що вони працюють, і як не зламати безпеку.

## Ландшафт інструментів (вересень 2026)

Claude Code (CLI + desktop + IDE, subagents, agent teams, hooks, skills, plugins), OpenAI Codex CLI (skills, plugins, AGENTS.md), Gemini CLI (extensions, MCP), Cursor (rules, plan mode, background agents), GitHub Copilot (Ask / Plan / Agent modes, coding agent у cloud), а також open-source harness-и: OpenCode, Aider, Cline, goose (Block), pi. Формат AGENTS.md став відкритим стандартом (серпень 2025), який підтримують OpenAI, Google, Cursor, Factory; Claude Code читає CLAUDE.md і вміє імпортувати AGENTS.md.

:::idea Ідея
Хочеш зрозуміти harness зсередини — репозиторій [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) містить 17 запускних уроків, які крок за кроком збирають агента: цикл → tool dispatch → permissions → hooks → subagents → skills → compaction → memory → teams → MCP.
:::
`,
      tasks: [
        { id: 'm0l2t1', kind: 'practice', title: 'Виміряй свій контекст', md: `Запусти свого агента у навчальному репозиторії, дай йому невелику задачу (наприклад, «поясни, як влаштована аутентифікація») і після відповіді подивись на використання контексту (у Claude Code — команда \`/context\` або \`/cost\`). Запиши: скільки токенів зайняли інструкції та tools ще до першого повідомлення, і скільки — після завершення задачі. Що з цього було зайвим?` },
        { id: 'm0l2t2', kind: 'reflect', title: 'Чотири важелі у твоєму процесі', md: `Для кожного з чотирьох важелів (інструкції, інструменти, ґейти, структура задачі) напиши одним реченням, як він налаштований у тебе зараз. Якщо якийсь не налаштований взагалі — так і запиши; це твій baseline.` },
      ],
      quiz: [
        { q: 'Що таке harness у контексті coding-агентів?', options: ['Інша назва для моделі', 'Усе навколо моделі: інструкції, tools, дозволи, hooks, керування контекстом, верифікація', 'Тестовий фреймворк для LLM'], answer: 1, explain: 'Агент = модель + harness. Harness — усе, що ти контролюєш, не змінюючи ваги моделі.' },
        { q: 'Чому LangChain зміг підняти результат на Terminal Bench з 52.8 % до 66.5 %?', options: ['Замінили модель на новішу', 'Змінили лише harness (промпт, middleware, перевірки), модель та сама', 'Збільшили контекстне вікно'], answer: 1, explain: 'Це головний емпіричний аргумент курсу: harness — окрема, вимірювана змінна.' },
        { q: 'Що таке «dumb zone»?', options: ['Момент, коли модель відмовляється відповідати', 'Зона заповнення контексту, де точність падає через шум і низькорелевантну інформацію', 'Режим економії токенів'], answer: 1, explain: 'Продуктивність деградує задовго до формального ліміту; тому тримаємо контекст чистим.' },
      ],
      sources: [
        { t: 'LangChain — Improving Deep Agents with harness engineering', u: 'https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering', d: 'Vivek Trivedy, 2026-02-17' },
        { t: 'LangChain — The Anatomy of an Agent Harness', u: 'https://www.langchain.com/blog/the-anatomy-of-an-agent-harness', d: '2026-03-10' },
        { t: 'Anthropic — Effective context engineering for AI agents', u: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', d: '2025-09-29' },
        { t: 'shareAI-lab/learn-claude-code — 17 уроків з побудови harness', u: 'https://github.com/shareAI-lab/learn-claude-code' },
        { t: 'Anthropic Academy — Claude Code 101', u: 'https://anthropic.skilljar.com/claude-code-101' },
      ],
    },
    {
      id: 'm0l3',
      title: 'Ландшафт інструментів: Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot, OpenCode',
      minutes: 18,
      md: `
## Спільна архітектура

Udemy «Harness Engineering Masterclass» присвячує цьому цілий розділ: усі сучасні coding-агенти мають одну анатомію — цикл, набір tools (read/edit/bash/search), файл інструкцій, модель дозволів, MCP, субагенти чи фонові задачі. Різниця — у дефолтах, глибині harness-конфігурації й екосистемі.

| Інструмент | Файл інструкцій | Розширення | Паралельність | Особливості (09/2026) |
|---|---|---|---|---|
| **Claude Code** (Anthropic) | CLAUDE.md, .claude/rules | skills, plugins, hooks, MCP | subagents, agent teams, worktrees, \`/batch\` | найглибший harness-API; plan mode; \`/goal\`; headless; Agent SDK; desktop/IDE/web |
| **Codex CLI** (OpenAI) | AGENTS.md | skills (SKILL.md-сумісні), plugins, MCP | cloud tasks, субагенти | sandbox-режими; сильна інтеграція з GitHub/cloud; знаменитий harness-кейс OpenAI |
| **Gemini CLI** (Google) | GEMINI.md | extensions, MCP | background | великий контекст; безкоштовний tier; курс Google Cloud на Coursera |
| **Cursor** | .cursor/rules | MCP, hooks (beta) | background agents, dashboard | IDE-first; plan mode; rules з glob-областями |
| **GitHub Copilot** | copilot-instructions.md, AGENTS.md | MCP, custom agents | coding agent у cloud (PR з issue) | режими Ask / Plan / Agent; code review; CLI |
| **OpenCode / AMP / Aider / Cline / goose / pi** | AGENTS.md | MCP, provider-agnostic | різне | будь-які моделі (OpenRouter, Ollama); open source — можна читати harness |
| **Antigravity** (Google IDE) | — | MCP | agent manager | агентний IDE з менеджером задач |

## AGENTS.md — переносний шар

Відкритий формат (серпень 2025), який читають Codex, Gemini CLI, Cursor, Copilot, Factory, OpenCode; Claude Code імпортує його з CLAUDE.md одним рядком \`@AGENTS.md\`. Тримай **спільну частину** інструкцій в AGENTS.md, а інструмент-специфічні (hooks, permissions) — у конфігах інструмента. Так само з skills: SKILL.md працює у Claude Code, Codex і Agent SDK.

## Agent replaceability

DeepLearning.AI (урок «Agent replaceability» у SDD-курсі): якщо spec, constitution, skills і hook-скрипти живуть у репозиторії у відкритих форматах, змінити агента коштує годину, а не місяць. Це страховка від vendor lock-in і від того, що «модель overfit-нута під свій harness» (Модуль 2.1).

## Як обирати

Ed Donner прогнав одну й ту саму Kanban-задачу через Cursor, Copilot, Codex і Antigravity — висновок: різниця в результатах менша за різницю в дисципліні користувача. Рубрика для порівняння: глибина harness (hooks/permissions/sandbox), робота з великою кодовою базою, вартість, паралельність, headless/CI, екосистема skills/MCP, відкритість.

## Sync vs async агенти (CS146S)

Синхронні (ти дивишся, як він працює: IDE, CLI) vs асинхронні (задача в хмару → PR: Copilot coding agent, Codex cloud, Claude Code web/routines) і «напів-асинхронна зона» — де більшість реальної роботи. Асинхронні потребують сильнішого harness: нема кому натиснути «стоп».
`,
      tasks: [
        { id: 'm0l3t1', kind: 'practice', title: 'Одна задача — три інструменти', md: `Візьми задачу на 30 хвилин і виконай її трьома агентами (наприклад, Claude Code, Codex CLI, Cursor або Copilot agent mode) з одним і тим самим AGENTS.md. Заповни рубрику: результат, ходи, втручання, вартість, зручність harness-конфігурації. Що спільне, що різне?` },
        { id: 'm0l3t2', kind: 'build', title: 'Переносний шар', md: `Розділи інструкції: AGENTS.md (спільне) + CLAUDE.md з @AGENTS.md і claude-специфікою. Перевір, що Codex/Cursor читають AGENTS.md. Це основа agent replaceability.` },
      ],
      quiz: [
        { q: 'Що робить AGENTS.md важливим?', options: ['Це найдовший файл', 'Відкритий формат, який читають більшість агентів — переносний шар інструкцій', 'Він замінює тести'], answer: 1, explain: 'Claude Code імпортує його через @AGENTS.md.' },
        { q: 'Чому асинхронні агенти потребують сильнішого harness?', options: ['Вони повільніші', 'Немає людини, щоб зупинити або виправити на льоту — тільки структурні межі й ґейти', 'Вони дорожчі'], answer: 1, explain: 'CS146S: sync / async / semi-async zone.' },
      ],
      sources: [
        { t: 'Udemy — Harness Engineering Masterclass (розділи Claude Code / Codex / Gemini CLI / Shared Architecture)', u: 'https://www.udemy.com/course/harness-engineering-masterclass-ai-coding-agents/' },
        { t: 'Udemy — AI Coder (Ed Donner): Cursor vs Copilot vs Codex vs Antigravity', u: 'https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/' },
        { t: 'Frontend Masters — Cursor & Claude Code: Professional AI Setup (Steve Kinney)', u: 'https://frontendmasters.com/courses/pro-ai/' },
        { t: 'DeepLearning.AI — Spec-Driven Development (Agent replaceability)', u: 'https://www.deeplearning.ai/short-courses/spec-driven-development-with-coding-agents/' },
        { t: 'Coursera / Google Cloud — Accelerate App Development with Gemini CLI', u: 'https://www.coursera.org/learn/accelerate-app-development-with-gemini-cli' },
        { t: 'AGENTS.md — open format', u: 'https://agents.md/' },
        { t: 'Stanford CS146S — Week 3 (sync/async agents)', u: 'https://themodernsoftware.dev/' },
      ],
    },
  ],
};
