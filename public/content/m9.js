export default {
  id: 'm9',
  icon: '🧩',
  title: 'Розширення агента: hooks, skills, plugins, MCP, headless',
  subtitle: 'Практичний розділ: hooks від stdin до exit code, авторинг SKILL.md і плагінів, свій MCP-сервер з inspector, headless-режим, GitHub Actions і routines.',
  intro: `Модуль 2 пояснив «навіщо». Цей розділ — «як саме»: з кодом, полями frontmatter, прапорцями CLI. Усе на прикладі Claude Code, але з нотатками для Codex CLI та інших.`,
  lessons: [
    {
      id: 'm9l1',
      title: 'Hooks на практиці: контракт, matchers, патерни',
      minutes: 22,
      md: `
## Контракт hook

Hook — виконуваний файл або команда з \`.claude/settings.json\` (проєкт), \`~/.claude/settings.json\` (користувач), плагіна чи skill. На подію Claude Code запускає його, передає **JSON у stdin** і читає **exit code + stdout/stderr**.

\`\`\`json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": ".claude/hooks/guard-bash.sh", "timeout": 10 }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx prettier --write \\"$(jq -r .tool_input.file_path)\\" >/dev/null 2>&1 || true" }]
    }],
    "Stop": [{ "hooks": [{ "type": "command", "command": ".claude/hooks/stop-check.sh" }] }]
  }
}
\`\`\`

Що приходить у stdin (PreToolUse):

\`\`\`json
{ "session_id": "…", "hook_event_name": "PreToolUse",
  "tool_name": "Bash", "tool_input": { "command": "rm -rf build" },
  "cwd": "/repo", "transcript_path": "~/.claude/projects/…/session.jsonl" }
\`\`\`

## Три способи відповісти

| Спосіб | Ефект |
|---|---|
| \`exit 0\`, порожній stdout | немає заперечень; для PostToolUse/Stop stdout ігнорується або показується користувачу |
| \`exit 2\` + текст у stderr | дія заблокована; stderr повертається **моделі** як фідбек |
| \`exit 0\` + JSON у stdout | тонке керування: \`{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"…"}}\`, \`"additionalContext": "…"\` (додати текст у контекст), \`"decision":"block"\` для Stop |

Кілька hooks на одну подію запускаються паралельно; перемагає найсуворіше рішення. Інший exit code (1, 127) — помилка hook, дія не блокується, користувач бачить попередження.

## Matchers та умовна логіка

\`matcher\` — регулярний вираз по імені tool (\`"Edit|Write"\`, \`"mcp__github__.*"\`, \`""\` — усі). Для UserPromptSubmit / Stop matcher не потрібен. Усередині скрипта — умови на \`tool_input\` через \`jq\`: блокувати лише запис у \`migrations/\`, лише \`git push\` у \`main\`.

## Типи hooks

- **command** — shell; детермінований і швидкий. Основний тип.
- **prompt** — один виклик Haiku з питанням «чи безпечна ця дія?»; повертає allow/deny. Для сірих зон.
- **agent** — субагент інспектує репозиторій перед рішенням (наприклад, «чи є тест на цей файл?»).
- **http** — POST на ваш сервіс (аудит, політики організації).

## Патерни, що окупаються першими

1. **Format-on-edit** (PostToolUse Edit|Write) — прибирає 30 % review-коментарів.
2. **Protected paths** (PreToolUse Edit|Write|Bash) — \`migrations/\`, \`.github/workflows/\`, \`secrets/\`, \`package-lock.json\` без дозволу.
3. **Dangerous bash guard** (PreToolUse Bash) — \`rm -rf\`, \`--force\`, \`curl | sh\`, push у main.
4. **Stop gate** — typecheck + lint + цільові тести, тільки падіння, exit 2.
5. **SessionStart context** — \`git status --short\`, відкриті задачі з progress.md у \`additionalContext\`.
6. **UserPromptSubmit** — додати нагадування про spec/ID тікета; блокувати промпти з секретами.
7. **SubagentStop** — перевірити, що звіт субагента містить \`file:line\`.
8. **PreCompact** — дописати progress.md; **PostCompact** — повернути ключові правила в контекст.
9. **Audit log** (PostToolUse "") — JSONL усіх tool-викликів для evals і безпеки.

## Hooks у власному harness

learn-claude-code s04: «hook навколо циклу, ніколи не переписуй цикл». У своєму агенті (Модуль «Побудова власного агента») hooks — це просто функції \`before_tool(name, input) → allow|deny|modify\` і \`after_tool(name, output)\`, зареєстровані у диспетчері. Той самий контракт, що й у Claude Code.

## Codex CLI та інші

Codex має власний механізм hooks/skills у \`AGENTS.md\`-екосистемі; Gemini CLI — extensions; Cursor — rules + hooks (beta). Принцип однаковий: детермінований код на подіях життєвого циклу. Тримай hook-скрипти у \`scripts/\` і посилайся з конфігів різних агентів — так вони переносні.

:::tip Дебаг
\`claude --debug\` показує запуск hooks; додай \`echo "$(cat)" >> /tmp/hook.log\` у скрипт, щоб побачити реальний stdin. Тестуй hook навмисними порушеннями, а не вір, що він працює.
:::
`,
      tasks: [
        { id: 'm9l1t1', kind: 'build', title: 'П’ять hooks за один вечір', md: `Реалізуй патерни 1–5 у своєму репозиторії: format-on-edit, protected paths, dangerous bash guard, Stop gate, SessionStart context. Для кожного — навмисне порушення й скріншот/лог, що hook спрацював. Встав settings.json у нотатки.` },
        { id: 'm9l1t2', kind: 'build', title: 'Audit log → перший eval', md: `Додай PostToolUse hook із matcher "" який пише JSONL: час, tool, input (обрізаний), тривалість. Через тиждень порахуй: топ-5 tools, частка помилок, середня кількість викликів на задачу. Це сирі дані для Модуля evals.` },
      ],
      quiz: [
        { q: 'Як hook повідомляє моделі причину блокування?', options: ['Через файл', 'exit 2 і текст у stderr (або JSON з permissionDecisionReason у stdout)', 'Не може'], answer: 1, explain: 'Stderr при exit 2 повертається моделі як фідбек.' },
        { q: 'Що робить matcher?', options: ['Обмежує hook певними tools за regex на ім’я', 'Фільтрує користувачів', 'Задає таймаут'], answer: 0, explain: 'Наприклад "Edit|Write" або "mcp__github__.*".' },
        { q: 'Який тип hook доречний для «сірої зони», де немає чіткого правила?', options: ['command', 'prompt або agent (LLM-суддя)', 'http'], answer: 1, explain: 'Детерміноване — command; імовірнісне — prompt/agent.' },
      ],
      sources: [
        { t: 'Claude Code docs — Hooks reference', u: 'https://code.claude.com/docs/en/hooks' },
        { t: 'Claude Code docs — Automate actions with hooks (guide)', u: 'https://code.claude.com/docs/en/hooks-guide' },
        { t: 'Udemy — Claude Code: AI Agents, MCP, Hooks & Plugins (S. Soni, розділ Hooks)', u: 'https://www.udemy.com/course/claude-code-ai-coding-agents-automation/' },
        { t: 'shareAI-lab/learn-claude-code — s04 Hooks', u: 'https://github.com/shareAI-lab/learn-claude-code' },
        { t: 'Anthropic Academy — Claude Code in Action (Hooks)', u: 'https://anthropic.skilljar.com/claude-code-in-action' },
      ],
    },
    {
      id: 'm9l2',
      title: 'Skills і plugins: SKILL.md, багатофайлові навички, marketplace',
      minutes: 24,
      md: `
## Що таке skill

Директорія з \`SKILL.md\` у \`.claude/skills/<name>/\` (проєкт) або \`~/.claude/skills/\` (користувач). Модель завжди бачить лише \`name\` + \`description\` (кілька рядків); повний вміст завантажується, коли skill спрацьовує (авто — за описом, або вручну через \`/name\`). Це прогресивне розкриття: 50 процедур коштують кілька сотень токенів, поки не потрібні.

\`\`\`markdown
---
name: release-notes
description: Створює реліз-нотатки з git log між двома тегами. Використовуй, коли просять changelog, release notes або опис релізу.
disable-model-invocation: false      # true → лише людина через /release-notes
allowed-tools: Bash(git log:*), Read, Write
context: fork                        # виконати в окремому контексті (субагент)
model: sonnet
---
# Реліз-нотатки
1. Визнач діапазон: !\`git describe --tags --abbrev=0\`..HEAD (або $ARGUMENTS).
2. Згрупуй коміти за типом (feat/fix/chore) — див. reference/format.md.
3. Запусти scripts/collect.sh, щоб отримати PR-посилання.
4. Напиши CHANGELOG.md за шаблоном templates/changelog.md.
\`\`\`

## Поля frontmatter, що мають значення

- \`description\` — головний тригер. Пиши «що робить + коли використовувати + ключові слова, якими просять». Найчастіша причина «skill не спрацьовує» — розпливчастий опис.
- \`disable-model-invocation: true\` — для дій із побічними ефектами (deploy, публікація), які запускає лише людина.
- \`user-invocable: false\` — фонове знання, яке не має бути командою.
- \`allowed-tools\` / \`disallowed-tools\` — обмежити skill (наприклад, read-only).
- \`context: fork\` + \`agent: <name>\` — виконати у свіжому контексті субагента; \`paths\` — активувати лише для певних файлів; \`arguments\` / \`$ARGUMENTS\`; \`model\`, \`effort\`; \`hooks\` — власні hooks skill-а.
- Динамічний контекст: \`!\`команда\`\` виконується при завантаженні й підставляє вивід.

## Багатофайлові skills

\`SKILL.md\` ≤ 500 рядків; решта — у \`reference/\`, \`templates/\`, \`scripts/\`, на які SKILL.md посилається. Скрипти дають детермінованість: краще \`scripts/collect.sh\`, ніж «попроси модель зібрати PR-посилання». Сукупний бюджет описів усіх skills — ~25k символів; якщо перевищено, частина не завантажиться.

## Skill vs CLAUDE.md vs hook vs subagent vs MCP

| Потрібно… | Обирай |
|---|---|
| правило, яке завжди в контексті | CLAUDE.md / rules |
| процедуру на вимогу з кроками й шаблонами | skill |
| гарантію на події (завжди, детерміновано) | hook |
| ізольований контекст і/або інші tools | subagent (або skill із context: fork) |
| доступ до зовнішньої системи/даних | MCP або CLI |

## Skill-creator і evals для skills

Вбудований skill \`skill-creator\` інтерв'ює тебе, генерує SKILL.md, запускає A/B (задача зі skill і без нього у свіжих сесіях) і формує HTML-звіт. Команда \`claude plugin eval\` дозволяє тримати eval-набір для skill/plugin у репо і ганяти в CI — так ловлять **skill drift**, коли зміни в кодовій базі роблять skill застарілим.

## Troubleshooting

Не спрацьовує → перевір description і \`/skills\`; конфлікт пріоритетів → project > user > plugin; помилка виконання → скрипт без \`chmod +x\` або дозволи на tools; skill з'їдає контекст → перенеси вміст у reference/.

## Plugins

Plugin = пакет із \`.claude-plugin/plugin.json\` + \`skills/\`, \`agents/\`, \`hooks/hooks.json\`, \`.mcp.json\`, \`.lsp.json\`, commands. Встановлюється з marketplace (\`/plugin\`), локально \`--plugin-dir ./my-plugin\`, перезавантажується \`/reload-plugins\`, перевіряється \`claude plugin validate\`. Marketplace — це git-репо з \`marketplace.json\`; команда може мати приватний marketplace і версіонувати свої skills/hooks/агентів як залежність. Codex CLI має аналогічні skills (SKILL.md сумісний) і plugins; Ed Donner показує Ralph Loops plugin, Anthropic — skills для xlsx/pptx/pdf, які працюють і в API, і в Claude Code, і в Agent SDK.

:::warn Довіра
Skills і plugins з marketplace — це код, який виконується з твоїми правами. Стався до них як до npm-пакетів: читай SKILL.md і scripts перед встановленням, фіксуй версії, не став десятки «про запас».
:::
`,
      tasks: [
        { id: 'm9l2t1', kind: 'build', title: 'Багатофайловий skill із скриптом', md: `Запакуй процедуру команди (реліз-нотатки, міграція БД, генерація тестових даних, onboarding) як skill: SKILL.md ≤ 80 рядків, scripts/ з детермінованим кроком, templates/. Перевір тригер на 5 формулюваннях запиту (3 мають спрацювати, 2 — ні).` },
        { id: 'm9l2t2', kind: 'build', title: 'Плагін команди з marketplace', md: `Зібери plugin: 2 skills + 1 субагент (verifier) + hooks.json (Stop gate) + .mcp.json (якщо є). Опублікуй у приватному git-репо як marketplace, встанови в іншому репозиторії. Запусти claude plugin validate і eval на 3 задачах.` },
      ],
      quiz: [
        { q: 'Що модель бачить від skill до його спрацювання?', options: ['Весь SKILL.md', 'Лише name і description', 'Нічого'], answer: 1, explain: 'Прогресивне розкриття — тому description вирішує все.' },
        { q: 'Коли ставити disable-model-invocation: true?', options: ['Для read-only skills', 'Для skills із побічними ефектами, які має запускати лише людина', 'Завжди'], answer: 1, explain: 'Deploy, публікація, платежі — лише за явною командою.' },
        { q: 'Що таке skill drift?', options: ['Skill переміщено в іншу директорію', 'Skill застарів відносно кодової бази і дає гірші результати; ловиться eval-ами', 'Skill спрацьовує надто часто'], answer: 1, explain: 'claude plugin eval у CI — спосіб ловити дрейф.' },
      ],
      sources: [
        { t: 'Claude Code docs — Skills', u: 'https://code.claude.com/docs/en/skills' },
        { t: 'Claude Code docs — Plugins', u: 'https://code.claude.com/docs/en/plugins' },
        { t: 'Anthropic Academy — Introduction to Agent Skills', u: 'https://anthropic.skilljar.com/introduction-to-agent-skills' },
        { t: 'DeepLearning.AI — Agent Skills with Anthropic', u: 'https://www.deeplearning.ai/short-courses/agent-skills-with-anthropic/' },
        { t: 'Frontend Masters — Claude Code (Skills, Skill Creator, Plugins)', u: 'https://frontendmasters.com/courses/claude-code/' },
        { t: 'Udemy — OpenAI Codex 2026: MCP, Skills, SubAgents, Hooks Bootcamp', u: 'https://www.udemy.com/course/openai-codex-2026-mcp-skills-subagents-hooks-bootcamp/' },
      ],
    },
    {
      id: 'm9l3',
      title: 'MCP hands-on: сервер, клієнт, inspector, транспорти',
      minutes: 26,
      md: `
## Архітектура

**Host** (Claude Code, Claude Desktop, Cursor, Codex) містить **клієнтів**; кожен клієнт — одне з'єднання з **сервером**. Сервер надає **tools** (дії), **resources** (дані за URI), **prompts** (шаблони). Обмін — JSON-RPC 2.0: request / response / notification. При підключенні сторони узгоджують capabilities.

## Мінімальний сервер (Python, FastMCP)

\`\`\`python
# server.py
from mcp.server.fastmcp import FastMCP
import subprocess, json

mcp = FastMCP("repo-tools")

@mcp.tool()
def run_tests(path: str = "", concise: bool = True) -> str:
    """Запускає тести (pytest) для шляху. Повертає лише падіння, якщо concise=True."""
    r = subprocess.run(["pytest", "-q", "--tb=short", path], capture_output=True, text=True)
    out = r.stdout + r.stderr
    if concise:
        out = "\\n".join(l for l in out.splitlines() if "FAIL" in l or "Error" in l or l.startswith("=")) or "OK: усі тести пройшли"
    return out[:4000]

@mcp.resource("repo://conventions")
def conventions() -> str:
    """Конвенції проєкту для агента."""
    return open("docs/conventions.md").read()

@mcp.prompt()
def review(diff_ref: str) -> str:
    return f"Зроби adversarial review змін {diff_ref} проти PLAN.md. Звітуй про прогалини, не про стиль."

if __name__ == "__main__":
    mcp.run()   # stdio
\`\`\`

TypeScript SDK (\`@modelcontextprotocol/sdk\`) — той самий набір: \`server.tool()\`, \`server.resource()\`, \`server.prompt()\`.

## Inspector

\`npx @modelcontextprotocol/inspector python server.py\` — веб-UI, де видно tools зі схемами, можна викликати їх руками, читати resources, дивитись JSON-RPC. Перший крок дебагу будь-якого сервера, до підключення в агент.

## Підключення

- Claude Code: \`claude mcp add repo-tools -- python server.py\` (scope: local / project \`.mcp.json\` / user); \`/mcp\` показує статус; \`claude mcp add --transport http name https://…\`.
- Claude Desktop: \`claude_desktop_config.json\`; Cursor: \`.cursor/mcp.json\`; Codex: \`config.toml\` [mcp_servers].
- Tools з'являються як \`mcp__repo-tools__run_tests\` — так їх фільтрувати у hooks і allowlists.

## Клієнт у власному агенті

У циклі агента (Модуль «Побудова власного агента») клієнт MCP: \`initialize\` → \`tools/list\` → перетворити схеми у tool definitions для моделі → на \`tool_use\` викликати \`tools/call\` → повернути результат. Так один агент підключає десятки серверів без власного коду для кожного.

## Транспорти

- **stdio** — локальний процес; просто, безпечно, для CLI-агентів.
- **Streamable HTTP** — віддалений сервер; один endpoint, SSE для стрімінгу; з ревізії 2026-07 протокол stateless (\`server/discover\`), що спрощує масштабування. Auth — OAuth 2.1 (CIMD); деплой — як звичайний HTTP-сервіс.

## Просунуте

- **Tasks (розширення)** — довгі операції: \`tasks/get\`, \`tasks/update\`; так обгортають субагентів, збірки, довгі тести.
- **Notifications** — прогрес і логи під час довгого tool-виклику.
- **Multi round-trip requests** замінили server-initiated sampling/elicitation (сервер просить хост «запитай у користувача» або «зроби виклик моделі»).
- **Roots** (deprecated у 2026) → хост передає межі файлової системи інакше; перевіряй актуальну ревізію.
- **OpenTelemetry**: trace-context у \`_meta\` — трейси наскрізь від агента до сервера.

## Дизайн tools для MCP

Правила з Модуля 2.4: простір імен, стислі відповіді, \`concise/detailed\`, пагінація, помилки-інструкції. Плюс: детермінований порядок \`tools/list\` (кеш промпту), не більше 8–10 tools на сервер, опис ≤ 3 речень. Пам'ятай про вартість: описи всіх tools завантажуються у контекст (або через Tool Search Tool — на вимогу).

## Lab: браузерний агент

Playwright MCP (\`npx @playwright/mcp\`) дає tools navigate / click / fill / screenshot / snapshot. Цикл верифікації UI: агент змінює код → відкриває сторінку → робить accessibility snapshot → порівнює з очікуванням → скріншот як доказ у PR. DeepLearning.AI показує Figma MCP → код → Playwright MCP перевірка. Вивід браузера — недовірені дані (prompt injection зі сторінок).
`,
      tasks: [
        { id: 'm9l3t1', kind: 'build', title: 'Свій MCP-сервер + inspector', md: `Напиши сервер із 2–3 tools для свого репо (тихий тест-ранер, пошук по логах, статус CI), одним resource (конвенції) і одним prompt (review). Перевір в Inspector, підключи до Claude Code через .mcp.json, використай у задачі. Порівняй контекст із варіантом CLI-обгортки з Модуля 2.4.` },
        { id: 'm9l3t2', kind: 'build', title: 'UI-верифікація через Playwright MCP', md: `Підключи Playwright MCP. Дай агенту UI-задачу з вимогою: «перед завершенням відкрий сторінку, зроби snapshot і скріншот, підтверди критерії». Додай Stop hook, що вимагає наявності скріншота у PR. Запиши, скільки разів агент «оголосив перемогу» без перевірки до і після.` },
      ],
      quiz: [
        { q: 'Що дає MCP Inspector?', options: ['Автоматичні тести', 'Веб-UI для ручного виклику tools, перегляду resources і JSON-RPC до підключення в агент', 'Деплой сервера'], answer: 1, explain: 'Перший крок дебагу сервера.' },
        { q: 'Який транспорт для віддаленого сервера?', options: ['stdio', 'Streamable HTTP', 'WebSocket'], answer: 1, explain: 'stdio — локальний процес; Streamable HTTP — віддалений, з OAuth.' },
        { q: 'Як обгорнути довгу операцію (збірка, субагент) у MCP?', options: ['Збільшити таймаут', 'Розширення tasks: tasks/get polling та tasks/update', 'Неможливо'], answer: 1, explain: 'Ревізія 2026-07 винесла довгі операції в офіційне розширення.' },
      ],
      sources: [
        { t: 'MCP — Build a server (official docs)', u: 'https://modelcontextprotocol.io/docs/develop/build-server' },
        { t: 'MCP — Specification 2026-07-28 changelog', u: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog' },
        { t: 'Anthropic Academy — Introduction to MCP', u: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol' },
        { t: 'Anthropic Academy — MCP: Advanced Topics (transports, notifications)', u: 'https://anthropic.skilljar.com/model-context-protocol-advanced-topics' },
        { t: 'DeepLearning.AI — MCP: Build Rich-Context AI Apps with Anthropic', u: 'https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/' },
        { t: 'Claude Code docs — MCP', u: 'https://code.claude.com/docs/en/mcp' },
        { t: 'Playwright MCP', u: 'https://github.com/microsoft/playwright-mcp' },
      ],
    },
    {
      id: 'm9l4',
      title: 'Headless, GitHub Actions і routines: агент без людини за клавіатурою',
      minutes: 22,
      md: `
## Headless-режим

\`claude -p "промпт"\` запускає одну неінтерактивну сесію: читає stdin, друкує результат, завершується. Це будівельний блок для скриптів, CI й fan-out.

\`\`\`bash
# Один прогін з JSON-результатом і обмеженнями
git diff main...HEAD | claude -p "Зроби review цього diff за rubric у docs/review.md. Звітуй JSON." \\
  --output-format json --json-schema '{"type":"object","properties":{"findings":{"type":"array"}}}' \\
  --allowedTools "Read,Grep,Glob" --permission-mode plan --max-turns 20 \\
  --append-system-prompt "Не пропонуй зміни стилю."

# Стрім подій для UI/логів
claude -p "…" --output-format stream-json   # system/init, assistant, tool_use, result

# Fan-out по задачах у worktrees
for t in $(cat tasks.txt); do
  claude -p "Виконай задачу $t за spec/$t.md, запусти тести, закоміть" \\
    --worktree "$t" --allowedTools "Read,Edit,Write,Bash(npm test:*),Bash(git:*)" \\
    --max-turns 60 --output-format json > "logs/$t.json" &
done; wait
\`\`\`

JSON-результат містить \`result\`, \`total_cost_usd\`, \`num_turns\`, \`permission_denials\`, \`session_id\` (для \`--resume\`). \`--bare\` пропускає завантаження hooks/.mcp.json/CLAUDE.md для швидкого старту в довіреному контексті. Exit code ≠ 0 — сигнал для CI.

## Безпека без людини

Без інтерактивних дозволів агент або має явний allowlist (\`--allowedTools\`, \`Bash(git commit:*)\`-патерни), або працює в sandbox з \`--permission-mode\`. Бюджет: \`--max-turns\`, \`max_budget_usd\` (SDK), таймаут у CI. Stripe-правило: після 2 невдалих CI — людина.

## GitHub Actions

\`anthropics/claude-code-action\`: два режими — **інтерактивний** (\`@claude\` у issue/PR: агент відповідає, відкриває PR) і **автоматизація** (\`prompt:\` у workflow: review на кожен PR, щотижневий звіт, оновлення залежностей). Auth — API key у secrets або OIDC до Bedrock/Vertex. Приклад review на PR:

\`\`\`yaml
on: pull_request
jobs:
  review:
    runs-on: ubuntu-latest
    permissions: { contents: read, pull-requests: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Зроби review PR за docs/review-rubric.md. Перевір відповідність spec-ID у назві PR.
            Коментуй лише прогалини у вимогах, edge cases без тестів, безпеку. Стиль не коментуй.
          claude_args: "--max-turns 25 --allowedTools Read,Grep,Glob,Bash(gh pr comment:*)"
\`\`\`

Керування витратами: обмежуй тригери (лише PR до main, лише певні шляхи), \`--max-turns\`, кеш; збирай \`total_cost_usd\` у логи.

## Routines

Claude Code routines (2026) — запуск агента за розкладом, API-викликом або подією GitHub у хмарному середовищі з обмеженими конекторами. Типові: щоденний триаж issues, щотижневий doc-gardening, нічний Ralph-прогін стандартизації, звіт по метриках harness. Payload події (\`<routine-fire-payload>\`) — недовірені дані.

## П’ять способів запустити віддалено (Ed Donner)

GitHub app (\`@claude\` в issue), cloud sessions (Claude Code web/desktop), scheduled tasks у desktop, самостійні раннери (sprites.dev, власний контейнер з \`claude -p\`), Agent SDK у своєму сервісі. Обирай за тим, де мають жити секрети й де зручно рев'юїти результат.

## «Trust it»: верифікація неконтрольованих прогонів

Anthropic Academy присвячує цьому окремий урок: збирай транскрипти (\`transcript_path\`), артефакти (diff, вивід тестів, скріншоти), \`permission_denials\`; CI-ґейти обов'язкові; вибіркове людське review транскриптів раз на тиждень; eval-набір на регресії harness. Автономний merge — лише для вузьких класів (форматування, залежності з зеленим CI).

## Code review як продукт

Anthropic Code Review (GitHub app) і Copilot code review дають готовий review-агент; кастомний workflow (вище) — коли потрібна своя рубрика чи spec-перевірка. CS146S «квадрант review»: людина рев'юїть діагноз і вимоги, агент — механіку й покриття.
`,
      tasks: [
        { id: 'm9l4t1', kind: 'build', title: 'Review-бот у GitHub Actions', md: `Налаштуй claude-code-action на PR із рубрикою з docs/review-rubric.md, обмеженням tools і max-turns. Прожени на 3 PR. Порахуй вартість (total_cost_usd) і корисність знахідок. Додай перевірку spec-ID у назві PR.` },
        { id: 'm9l4t2', kind: 'build', title: 'Нічний routine / cron', md: `Створи routine або cron-скрипт із claude -p: doc-gardening або стандартизація логування у worktree з відкриттям PR. Умова зупинки — тести + max-turns. Вранці оціни PR: що прийняв, що ні, скільки коштувало.` },
      ],
      quiz: [
        { q: 'Що обов’язково при headless-запуску без людини?', options: ['Більша модель', 'Явний allowlist tools або sandbox, ліміти turns/бюджету, CI-ґейти', 'Вимкнути hooks'], answer: 1, explain: 'Немає інтерактивних дозволів — потрібні структурні межі.' },
        { q: 'Чим відрізняються два режими claude-code-action?', options: ['Ціною', 'Інтерактивний (@claude у issue/PR) vs автоматизація (prompt у workflow на подію)', 'Мовою'], answer: 1, explain: 'Обидва — той самий агент, різні тригери.' },
        { q: 'Що таке «Trust it» у курсі Anthropic?', options: ['Довіряти агенту без перевірки', 'Верифікувати неконтрольовані прогони через транскрипти, артефакти, CI-ґейти й вибіркове review', 'Функція автоапрува'], answer: 1, explain: 'Автономія без верифікації — не автономія, а ризик.' },
      ],
      sources: [
        { t: 'Claude Code docs — Headless / CLI reference', u: 'https://code.claude.com/docs/en/headless' },
        { t: 'Claude Code docs — GitHub Actions', u: 'https://code.claude.com/docs/en/github-actions' },
        { t: 'Claude Code docs — Routines', u: 'https://code.claude.com/docs/en/routines' },
        { t: 'Anthropic Academy — Claude Code in Action (Routines and Headless; GitHub Actions; Trust It)', u: 'https://anthropic.skilljar.com/claude-code-in-action' },
        { t: 'Ed Donner — AI Coder resources (5 ways to run Claude Code remotely)', u: 'https://edwarddonner.com/2026/02/17/ai-coder-vibe-coder-to-agentic-engineer/' },
        { t: 'Stanford CS146S — Week 7 AI-Augmented Code Review', u: 'https://themodernsoftware.dev/' },
      ],
    },
  ],
};
