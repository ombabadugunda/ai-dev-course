export default {
  id: 'm10',
  icon: '⚙️',
  title: 'Побудова власного агента',
  subtitle: 'Agent loop і диспетчер tools з нуля, стрімінг і structured outputs, durable execution з чекпоінтами та approval gates, Claude Agent SDK.',
  intro: `Найкращий спосіб зрозуміти harness — зібрати його. Цей розділ іде шляхом learn-claude-code, Vizuara та Frontend Masters: ~100 рядків циклу, потім tools, hooks, збереження стану, і нарешті — Agent SDK, що дає все це «з коробки».`,
  lessons: [
    {
      id: 'm10l1',
      title: 'Agent loop своїми руками: цикл, tools, стрімінг, structured outputs',
      minutes: 28,
      md: `
## Один цикл + bash

Теза learn-claude-code: «Bash is all you need» — агентність походить від моделі; harness — це tools, знання, спостереження й дозволи. Мінімальний агент:

\`\`\`python
# loop.py — ~60 рядків, Python, Anthropic SDK
import anthropic, json, subprocess, pathlib
client = anthropic.Anthropic()

TOOLS = [
  {"name": "bash", "description": "Виконати shell-команду у робочій директорії. Повертає stdout+stderr (обрізано до 8k).",
   "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}},
  {"name": "read_file", "description": "Прочитати файл (до 400 рядків, з offset).",
   "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "offset": {"type": "integer"}}, "required": ["path"]}},
  {"name": "write_file", "description": "Записати файл повністю.",
   "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
]

def run_bash(command):  return subprocess.run(command, shell=True, capture_output=True, text=True, timeout=120).__dict__
def read_file(path, offset=0):
    lines = pathlib.Path(path).read_text().splitlines()[offset:offset+400]
    return "\\n".join(f"{i+offset+1}: {l}" for i, l in enumerate(lines))
def write_file(path, content): pathlib.Path(path).write_text(content); return f"wrote {len(content)} bytes"
HANDLERS = {"bash": lambda a: json.dumps({k: str(v)[:8000] for k, v in run_bash(a["command"]).items() if k in ("stdout","stderr","returncode")}),
            "read_file": lambda a: read_file(**a), "write_file": lambda a: write_file(**a)}

def agent(task, system, max_turns=40):
    messages = [{"role": "user", "content": task}]
    for turn in range(max_turns):
        resp = client.messages.create(model="claude-sonnet-4-5", max_tokens=8000, system=system, tools=TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                try: out = HANDLERS[block.name](block.input)
                except Exception as e: out = f"ERROR: {e}"
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(out)[:8000]})
        messages.append({"role": "user", "content": results})
    return "max_turns reached"
\`\`\`

Це і є agentic loop з Модуля 0: модель → \`tool_use\` → диспетчер → \`tool_result\` → знову модель, доки \`stop_reason == "end_turn"\` або ліміт. Усе інше — нашарування на цей цикл.

## Диспетчер tools

- Одна функція на tool; реєстр \`name → handler\`; схема — JSON Schema \`input_schema\`. Опис tool — це документація для маршрутизації (Модуль 2.4).
- Кілька \`tool_use\` в одній відповіді — виконуй паралельно (asyncio / threads), результати повертай усі разом в одному user-повідомленні.
- Помилки — у \`tool_result\` з \`is_error: true\` і текстом-інструкцією; модель вчиться на них у межах сесії (Manus).
- Обрізання і пагінація за замовчуванням — інакше один \`cat\` з'їсть контекст.
- Дозволи: \`before_tool(name, input) → allow | deny | ask\` — перший hook твого harness (learn-claude-code s03–s04).

## Блоки повідомлень

Відповідь містить блоки \`text\`, \`tool_use\`, \`thinking\` (extended thinking — увімкни для планування, вимкни для рутинних кроків: «reasoning sandwich»). Зберігай блоки як є — API вимагає повертати thinking-блоки без змін у наступних ходах.

## Стрімінг

\`client.messages.stream(...)\` дає події \`content_block_start / delta / stop\`. Для UI: показуй текст по мірі надходження, а виклики tools — як картки з їхнім статусом. У Claude Code це \`--output-format stream-json\`: \`system/init → assistant → tool_use → tool_result → result\`. Стрімінг tool-викликів (часткові JSON-аргументи) — для довгих \`write_file\`.

## Structured outputs

Коли фінальна відповідь має бути машиночитаною (звіт review, план задач): або tool «submit_result» з JSON Schema як єдиний дозволений вихід, або \`output_format\`/json-schema режим API. Валідуй схемою і при помилці повертай моделі текст помилки — ще один цикл.

## Провайдерна абстракція

Vizuara \`provider.py\`, Scott Moss «model flexibility»: інтерфейс \`complete(messages, tools) → {blocks, stop_reason}\` з адаптерами для Anthropic / OpenAI / локальних (Ollama, LM Studio через OpenAI-сумісний API). Дає model routing (Модуль 7): дешева модель для explore, сильна — для плану.

## Lab: baseline vs мінімальний harness

Walking Labs Project 01: одна й та сама задача (наприклад, «додай endpoint + тест») трьома способами — (а) чат без tools, (б) цикл вище, (в) цикл + CLAUDE.md + Stop-перевірка тестами. Виміряй completion, кількість ходів, токени. Різниця між (б) і (в) — це і є harness.

## Як це роблять Claude Code, pi, Hermes, Codex

Той самий цикл + ~15 tools (Read/Edit/Bash/Grep/Glob/WebFetch/Agent…) + системний промпт із «планом → діями → верифікацією» + hooks + компакція + субагенти. Boris Cherny (Claude Code): «ми вирізали 80 % системного промпту» — простота циклу і якість tools важать більше за довгі інструкції. Vizuara D5 і learn-claude-code s15 розбирають ці харнеси по файлах.
`,
      tasks: [
        { id: 'm10l1t1', kind: 'build', title: 'Свій агент за 100 рядків', md: `Реалізуй цикл із трьома tools (bash, read_file, write_file) на Anthropic SDK (Python або TS). Додай: обрізання виводів, паралельні tool-виклики, before_tool-дозвіл (deny на rm -rf), max_turns. Дай задачу «створи функцію X з тестом і запусти тести». Скільки ходів? Де він помилявся?` },
        { id: 'm10l1t2', kind: 'build', title: 'Стрімінг + structured output', md: `Додай стрімінг подій у консоль (текст і картки tools) і фінальний structured output через tool submit_result зі схемою {summary, files_changed[], tests_passed}. Валідуй схему; при помилці — повертай моделі і продовжуй цикл.` },
        { id: 'm10l1t3', kind: 'practice', title: 'Baseline vs harness', md: `Прожени одну задачу трьома способами (чат / цикл / цикл + інструкції + Stop-перевірка). Заповни таблицю: completion, ходи, токени, кількість твоїх втручань. Запиши висновок у 3 речення.` },
      ],
      quiz: [
        { q: 'Що зупиняє agent loop?', options: ['Лише max_turns', 'stop_reason end_turn (немає tool_use), ліміт ходів або бюджету', 'Порожній stdout'], answer: 1, explain: 'Умова зупинки має бути явною; інакше — doom loop.' },
        { q: 'Як повертати помилку tool моделі?', options: ['Кидати exception і зупиняти цикл', 'tool_result з is_error та текстом-інструкцією, щоб модель виправилась', 'Ігнорувати'], answer: 1, explain: 'Помилки в контексті — навчальний сигнал у межах сесії.' },
        { q: 'Навіщо провайдерна абстракція?', options: ['Для краси', 'Щоб маршрутизувати ролі на різні моделі (дешева для explore, сильна для плану) і не залежати від вендора', 'Для стрімінгу'], answer: 1, explain: 'Основа model routing і agent replaceability.' },
      ],
      sources: [
        { t: 'shareAI-lab/learn-claude-code — s01 Agent Loop, s02 Tool Use, s03 Permission', u: 'https://github.com/shareAI-lab/learn-claude-code' },
        { t: 'Anthropic Academy — Building with the Claude API (tool use, streaming, structured data)', u: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api' },
        { t: 'Vizuara — Harness Engineering Workshop materials (Odysseus reference harness)', u: 'https://harness-material.vercel.app/' },
        { t: 'Frontend Masters — Harness Engineering & Agent Orchestration (Scott Moss)', u: 'https://frontendmasters.com/courses/agent-harness/' },
        { t: 'Walking Labs — Project 01: Baseline vs Minimal Harness', u: 'https://walkinglabs.github.io/learn-harness-engineering/en/' },
        { t: 'DeepLearning.AI — Building Coding Agents with Tool Execution (E2B)', u: 'https://www.deeplearning.ai/short-courses/building-coding-agents-with-tool-execution/' },
        { t: 'Boris Cherny — We Cut 80% of Claude Code’s Prompt (talk)', u: 'https://www.youtube.com/watch?v=qyPCVqFUyDo' },
      ],
    },
    {
      id: 'm10l2',
      title: 'Durable execution: чекпоінти, сесії, відновлення, approval gates',
      minutes: 24,
      md: `
## Чому довгі прогони помирають

Падіння процесу, rate limit, переповнення контексту, закрита вкладка, людина, що пішла спати. Якщо стан агента живе лише в оперативній пам'яті — усе з початку, з повторною оплатою токенів. Walking Labs L05/L12: continuity і clean state — властивості harness, а не моделі.

## Event-sourced сесія

Записуй кожен хід моделі й кожен tool-виклик у append-only лог (JSONL у файлі або таблиця в Postgres/SQLite): \`{seq, type: "assistant"|"tool_call"|"tool_result"|"user", payload, ts, cost}\`. При рестарті — відтвори \`messages\` із логу й продовж з місця зупинки **без повторного обчислення**. Це те, що Claude Code зберігає у \`~/.claude/projects/<repo>/<session>.jsonl\` і використовує для \`--resume\` / \`--continue\` / \`/rewind\`.

\`\`\`python
# session.py — ескіз
class Session:
    def __init__(self, path): self.path = path; self.events = self._load()
    def append(self, ev): ev["seq"] = len(self.events); self.events.append(ev); open(self.path, "a").write(json.dumps(ev) + "\\n")
    def messages(self): return rebuild_messages(self.events)          # assistant/tool_result → API messages
    def checkpoint(self, label): self.append({"type": "checkpoint", "label": label})
    def rewind(self, seq): self.events = self.events[:seq]; self._rewrite()
\`\`\`

## Чекпоінти й ідемпотентність

Scott Moss (DBOS + Postgres): обгортай побічні дії у чекпоінти — якщо крок «створити PR» уже виконаний, при replay не виконуй знову. Ідемпотентні ключі для зовнішніх викликів; чекпоінт на значущих одиницях (коміт, прогін тестів), не на кожному токені. Наприкінці сесії — чистий стан: закомічено, задокументовано, без half-done файлів.

## Task system і фонові задачі

learn-claude-code s10–s12: граф задач на диску (\`tasks.json\` з \`blockedBy/blocks\`, статуси), фонові задачі (процес, що пише статус у файл), cron. Claude Code agent teams використовують саме такий спільний task list. CC Mirror — відкрита реалізація conductor/worker з JSON-задачами.

## Human-in-the-loop

Approval gate — це чекпоінт, що чекає на людину: агент доходить до небезпечного tool (\`git push\`, deploy, платіж), записує подію \`approval_requested\`, зупиняється; людина відповідає (CLI, web, Slack), процес відновлюється з логу. В Agent SDK — callback \`canUseTool\`; у Claude Code — permission prompts і \`--permission-prompts none\` для unattended з allowlist. Scott Moss і Vizuara D4 будують це як окремий шар «supervision»: routing між спеціалістами + approvals.

## Graph runtimes

LangGraph робить те саме фреймворком: стан як typed dict, вузли, ребра, **checkpointer** (SQLite/Postgres) зберігає стан після кожного вузла, \`interrupt()\` — pause-for-human, time-travel по чекпоінтах. Walking Labs L14: «від одиничних циклів до graph engineering» — коли процес має фіксовану структуру (spec → plan → implement → verify), краще описати його графом у коді, ніж сподіватися, що модель дотримається порядку (learn-claude-code s16 Workflow Runtime).

## Self-healing і goal loop

Retry з фідбеком помилки (тест впав → лог у контекст → повтор); circuit breaker після N спроб; goal loop (s17): окремий evaluator вирішує, чи ціль досягнута, і лише він може зупинити цикл. Ralph loop (Модуль 2.6) — це goal loop з файловою системою як пам'яттю.

## Чекліст durable-агента (Osmani + Moss)

1. Лог подій append-only; відновлення без повторного обчислення.
2. Чекпоінти на значущих одиницях; ідемпотентні побічні дії.
3. Явна умова «done» і бюджети (turns, $, час).
4. Approval gates для незворотного; відновлення після відповіді людини.
5. Окремий evaluator; чистий стан наприкінці; секрети поза логом.
`,
      tasks: [
        { id: 'm10l2t1', kind: 'build', title: 'Сесія з відновленням', md: `Додай до свого агента event-log (JSONL або SQLite), resume після kill -9 посеред задачі, і /rewind до чекпоінта. Перевір: убий процес після 5 tool-викликів, віднови — агент має продовжити, не повторюючи виконані кроки.` },
        { id: 'm10l2t2', kind: 'build', title: 'Approval gate', md: `Зроби before_tool, який для git push / deploy пише approval_requested і зупиняє процес; окремий CLI-скрипт approve/deny; відновлення з логу після відповіді. Протестуй deny — агент має отримати причину як tool_result і запропонувати альтернативу.` },
        { id: 'm10l2t3', kind: 'practice', title: 'LangGraph з checkpointer', md: `Опиши процес spec → plan → implement → verify як граф у LangGraph з SQLite checkpointer і interrupt() перед implement. Порівняй із власним циклом: що фреймворк дав безкоштовно, що ускладнив.` },
      ],
      quiz: [
        { q: 'Що дає event-sourced лог сесії?', options: ['Красиві логи', 'Відновлення після падіння без повторного обчислення й можливість rewind', 'Швидшу модель'], answer: 1, explain: 'Стан агента — це лог; пам’ять процесу — кеш.' },
        { q: 'Що таке approval gate у термінах durable execution?', options: ['Кнопка в UI', 'Чекпоінт, що чекає на рішення людини, з відновленням із логу після відповіді', 'Hook форматування'], answer: 1, explain: 'HITL = пауза + persist + resume.' },
        { q: 'Коли краще граф у коді, ніж вільний цикл моделі?', options: ['Завжди', 'Коли процес має фіксовану структуру фаз, яку модель має гарантовано дотримати', 'Ніколи'], answer: 1, explain: 'Workflow runtime для структури, agent loop для гнучкості.' },
      ],
      sources: [
        { t: 'Frontend Masters — Harness Engineering & Agent Orchestration (Durable Execution, HITL)', u: 'https://frontendmasters.com/courses/agent-harness/' },
        { t: 'Vizuara — Harness Engineering Workshop (D4 Durability, Recovery & Orchestration)', u: 'https://harnessengineering.vizuara.ai/' },
        { t: 'shareAI-lab/learn-claude-code — s10 Task System, s11 Background, s12 Cron, s16 Workflow Runtime, s17 Goal Loop', u: 'https://github.com/shareAI-lab/learn-claude-code' },
        { t: 'Addy Osmani — Long-running Agents (checklist)', u: 'https://addyosmani.com/blog/long-running-agents/' },
        { t: 'Hugging Face Agents Course — Unit 2.3 LangGraph', u: 'https://huggingface.co/learn/agents-course/unit0/introduction' },
        { t: 'Walking Labs — L05, L12, L14', u: 'https://walkinglabs.github.io/learn-harness-engineering/en/' },
      ],
    },
    {
      id: 'm10l3',
      title: 'Claude Agent SDK: власний агент на рушії Claude Code',
      minutes: 22,
      md: `
## Що це і коли обирати

Claude Agent SDK (Python / TypeScript) — той самий рушій, що всередині Claude Code (цикл, tools Read/Edit/Bash/Grep/Glob/WebFetch, hooks, субагенти, skills, CLAUDE.md, MCP, компакція, сесії), доступний як бібліотека для твоїх застосунків.

| Потрібно… | Обирай |
|---|---|
| працювати в терміналі/IDE | Claude Code CLI |
| повний контроль над циклом і tools | Client SDK (Модуль 10.1) |
| coding-агент усередині свого продукту/сервісу, з готовими tools, hooks, субагентами | **Agent SDK** |
| хостинг і sandbox від Anthropic без власної інфраструктури | Managed Agents (Claude Platform) |

## Мінімальний приклад (Python)

\`\`\`python
from claude_agent_sdk import query, ClaudeAgentOptions

opts = ClaudeAgentOptions(
    system_prompt="Ти інженер у репозиторії. Працюй за CLAUDE.md. Показуй докази (вивід тестів).",
    allowed_tools=["Read", "Grep", "Glob", "Edit", "Bash(npm test:*)", "Bash(git:*)"],
    permission_mode="acceptEdits",
    model="claude-sonnet-4-5",
    max_turns=50,
    cwd="/repo",
)
async for msg in query(prompt="Реалізуй FR-012 за specs/012.md і запусти тести", options=opts):
    if msg.type == "assistant": print(msg.text)           # стрімінг тексту
    elif msg.type == "tool_use": print("→", msg.name)      # картка tool
    elif msg.type == "result": print(msg.total_cost_usd, msg.num_turns)
\`\`\`

TypeScript: \`import { query } from "@anthropic-ai/claude-agent-sdk"\` — той самий інтерфейс.

## Ключові можливості

- **Custom tools як in-process MCP-сервер**: \`@tool\`-декоратори → сервер у тому ж процесі; агент бачить їх як \`mcp__myserver__name\`. Плюс підключення зовнішніх MCP.
- **Hooks** — ті самі події (PreToolUse, PostToolUse, Stop…) як Python/TS-callbacks — без shell-скриптів.
- **Subagents** — \`agents={"verifier": {...}}\` програмно; \`Agent(...)\`-обмеження, хто кого спавнить.
- **canUseTool** — callback для approval UI: показати користувачу, дочекатись, повернути allow/deny — HITL з Модуля 10.2 у 10 рядків.
- **Sessions** — resume / fork: продовжити або розгалужити сесію; \`interrupt()\`.
- **Structured outputs**, стрімінг у web-UI (SSE), \`max_budget_usd\`.
- Завантаження CLAUDE.md, skills (\`.claude/skills\`), plugins за шляхом — щоб твій продукт ділив harness із CLI.

## Патерни застосунків

- **Внутрішній «bot-інженер»**: Slack → Agent SDK у контейнері з репо → PR. Ed Donner: «large codebases with Claude Agent SDK».
- **Research-агент зі skills**: DLAI урок «Skills with the Claude Agent SDK» — skills для xlsx/pptx + власні.
- **Оркестратор**: lead на SDK спавнить субагентів (Модуль 4.2), результати у файли, verifier перед відповіддю.
- **Продуктовий асистент**: обмежені tools (лише твої MCP), read-only FS, canUseTool для будь-якого запису.

## Що ти отримав безкоштовно порівняно з Модулем 10.1

Компакцію, session log, permissions-модель, tool-набір із обрізанням/пагінацією, hooks, субагентів, skills, MCP-клієнт, вивід stream-json. Ціна — залежність від рушія і його дефолтів; тому Vizuara/learn-claude-code радять спершу зібрати свій цикл, щоб розуміти, що саме SDK робить за тебе.

## Managed Agents

Claude Platform 101: hosted-агенти в sandbox Anthropic — задача, tools, файли; без власного контейнера. Для швидких пілотів і коли секрети не мають покидати периметр Anthropic.
`,
      tasks: [
        { id: 'm10l3t1', kind: 'build', title: 'Агент на SDK + approval UI', md: `Побудуй маленький сервіс (CLI або web): приймає задачу, запускає query() з обмеженими tools і canUseTool, який показує запит на запис/git і чекає відповіді. Стрімінг у консоль/SSE. Виведи вартість і кількість ходів.` },
        { id: 'm10l3t2', kind: 'build', title: 'Custom tools + verifier-субагент', md: `Додай in-process MCP-tool (наприклад, статус CI або пошук по трекеру) і субагента verifier з Модуля 2.5. Порівняй з агентом із 10.1: що стало простіше, що менш контрольовано.` },
      ],
      quiz: [
        { q: 'Коли обирати Agent SDK замість Client SDK?', options: ['Завжди', 'Коли потрібен coding-агент із готовими tools, hooks, субагентами і сесіями у своєму застосунку', 'Для чат-ботів без tools'], answer: 1, explain: 'Client SDK — повний контроль; Agent SDK — рушій Claude Code як бібліотека.' },
        { q: 'Що робить canUseTool?', options: ['Реєструє tool', 'Callback-дозвіл на кожен tool-виклик — основа approval UI (HITL)', 'Вимикає tools'], answer: 1, explain: 'Human-in-the-loop у кілька рядків.' },
      ],
      sources: [
        { t: 'Claude Code docs — Agent SDK overview', u: 'https://code.claude.com/docs/en/agent-sdk/overview' },
        { t: 'Claude Code docs — Agent SDK subagents', u: 'https://code.claude.com/docs/en/agent-sdk/subagents' },
        { t: 'DeepLearning.AI — Agent Skills with Anthropic (Skills with the Claude Agent SDK)', u: 'https://www.deeplearning.ai/short-courses/agent-skills-with-anthropic/' },
        { t: 'Frontend Masters — Claude Code (Lydia Hallie, Agent SDK)', u: 'https://frontendmasters.com/courses/claude-code/' },
        { t: 'Anthropic Academy — Claude Platform 101 (Managed Agents)', u: 'https://anthropic.skilljar.com/claude-platform-101' },
      ],
    },
  ],
};
