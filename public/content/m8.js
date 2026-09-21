export default {
  id: 'm8',
  icon: '🏁',
  title: 'Капстоун',
  subtitle: 'Одна фіча наскрізно: spec → harness → subagents → evals → безпека → метрики. Плюс шаблони й чеклісти для повторного використання.',
  intro: `Фінальний проєкт збирає все в один процес у твоєму репозиторії. Результат — не «пройдений курс», а harness, який працюватиме завтра без тебе.`,
  lessons: [
    {
      id: 'm8l1',
      title: 'Капстоун: фіча наскрізно',
      minutes: 30,
      md: `
## Умова

Обери фічу середнього розміру у навчальному репозиторії (5–15 файлів, 2+ сесії роботи). Проведи її через повний процес і задокументуй докази на кожному кроці.

## Кроки та артефакти

| # | Крок | Артефакт | Критерій |
|---|---|---|---|
| 1 | Constitution / CLAUDE.md | ≤ 60–100 рядків, межі always/ask/never | тест «що зламається без рядка» пройдено |
| 2 | Clarify → Specify | spec.md: stories P1–P3, EARS ≥ 8, edge cases, SC вимірювані, non-goals | жодного [NEEDS CLARIFICATION] |
| 3 | Plan | plan.md: архітектура, дані, контракти, стратегія тестів, complexity tracking | людський review з ≥ 1 виправленням |
| 4 | Tasks | tasks.md: T### [P] [US#] + шлях + метод верифікації | MVP = US1 |
| 5 | Harness | Stop hook, PreToolUse guard, лінт-правила з remediation, sandbox, allowlists | усі hooks перевірено навмисними порушеннями |
| 6 | Subagents | explorer (read-only), test-runner, verifier; за потреби team-review | брифи: ціль / формат / tools / межі |
| 7 | Implement | test-first, свіжий контекст на story, докази у PR | тести пройшли; test masking неможливий |
| 8 | Verify | adversarial review проти plan.md; review-агент у CI; людський review | звіт «прогалини, не стиль» |
| 9 | Reconcile | spec ↔ code diff, оновлений spec у тому ж PR, ID вимог у комітах | spec не бреше |
| 10 | Evals | ≥ 10 задач у регресійному наборі; error analysis 10 трейсів | pass rate зафіксовано |
| 11 | Безпека | чекліст 10 пунктів; red-team issue | ≥ 7 «є»; injection заблоковано |
| 12 | Метрики | first-pass success, churn, CI runs, час review — до/після | висновок з цифрами |

## Звіт

Одна сторінка: що зроблено, що спрацювало, що ні, скільки коштувало (токени, час), який рівень автономності безпечний для цього класу задач, що наступне. Це і є твоя «harness retro».

## Захист

Покажи звіт колезі або команді. Найкращий результат капстоуну — колега, який повторює процес на своїй задачі за твоїми шаблонами.

:::tip Якщо застряг
Повернись до decision memo (4.1), RPI (1.4) і драбини ґейтів (2.5). Більшість проблем капстоуну — це або нечіткий spec, або відсутній sensor.
:::
`,
      tasks: [
        { id: 'm8l1t1', kind: 'build', title: 'Капстоун', md: `Виконай усі 12 кроків. У нотатках залиш посилання на PR, spec, plan, hooks, subagents, eval-набір і звіт. Познач урок завершеним лише після захисту.` },
      ],
      quiz: [
        { q: 'Що є справжнім результатом капстоуну?', options: ['Змерджена фіча', 'Harness, spec-процес, субагенти й evals, які працюватимуть на наступних задачах без тебе', 'Звіт'], answer: 1, explain: 'Фіча — привід; процес — результат.' },
      ],
      sources: [],
    },
    {
      id: 'm8l2',
      title: 'Шаблони й чеклісти (довідник)',
      minutes: 10,
      md: `
## Стартовий чекліст harness (10 кроків)

1. CLAUDE.md/AGENTS.md ≤ 60 рядків: команди, нестандартні конвенції, межі; посилання на docs/.
2. Одна виконувана перевірка на задачу; докази, не запевнення.
3. Stop hook (format + typecheck + цільові тести, лише падіння) + PreToolUse guard.
4. Повторювані review-коментарі → лінт-правила з remediation → error у CI.
5. Sandbox (FS + мережа) + tool allowlists; малі набори tools на задачу.
6. Plan mode / RPI; review плану, не лише diff; свіжий контекст для реалізації.
7. Довгі задачі: init.sh, feature_list.json, progress.md, ритуал старту.
8. Adversarial review-субагент перед «done».
9. Трейси → error analysis → одна зміна за раз → A/B на 5–10 задачах.
10. Garbage collection: doc-gardening, drift-лінтери, quality score.

## Бриф субагента

\`\`\`
Ціль: <одне речення, що має бути правдою наприкінці>
Контекст: <шляхи, помилки, рішення — бо історії ти не бачиш>
Формат відповіді: <структура; file:line; ≤ N токенів>
Tools: <які дозволені; read-only?>
Межі: <що НЕ робити; коли зупинитись; коли ескалувати>
Верифікація: <що запустити перед висновком>
\`\`\`

## Decision memo «чи потрібен мультиагент»

Причина (контекст / паралелізм / спеціалізація) · де читання, де запис · послідовні залежності · верифікація · бюджет ×3–10 · висновок.

## Шаблон spec

Див. урок 3.3. Шаблон task: опис · acceptance · верифікація · файли.

## Правило формулювання правил

«Не роби X, бо Y, натомість Z».

## Питання на harness-retro

Які hooks спрацьовували? Які лінт-правила ловили, які ні разу? Що агент робив правильно й без інструкцій (видалити рядок)? Що ламалося повторно (додати sensor)? Що змінилося з новою моделлю?

## Зовнішні курси для поглиблення (безкоштовні)

Anthropic Academy: Claude Code 101, Claude Code in Action, Intro to Subagents, Intro to Agent Skills, Intro/Advanced MCP. DeepLearning.AI: Claude Code, Agent Skills, Spec-Driven Development (JetBrains), Evaluating AI Agents, Agent Memory, Building Coding Agents with Tool Execution. Frontend Masters: Claude Code (Lydia Hallie). Stanford CS146S (матеріали відкриті). UC Berkeley Agentic AI MOOC. Hugging Face Agents Course. Повний список — у вкладці «Джерела».
`,
      tasks: [
        { id: 'm8l2t1', kind: 'build', title: 'Свій плейбук', md: `Збери свої фінальні шаблони (CLAUDE.md, hooks, subagent-брифи, spec/task-шаблони, чекліст безпеки, retro-питання) у директорію \`playbook/\` або внутрішній plugin. Поділись із командою. Запиши посилання.` },
      ],
      quiz: [],
      sources: [],
    },
  ],
};
