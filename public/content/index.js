import m0 from './m0.js';
import m1 from './m1.js';
import m2 from './m2.js';
import m3 from './m3.js';
import m4 from './m4.js';
import m5 from './m5.js';
import m6 from './m6.js';
import m7 from './m7.js';
import m8 from './m8.js';
import m9 from './m9.js';
import m10 from './m10.js';
import { SOURCES_MD } from './sources.js';

export const COURSE = {
  title: 'Інженерія розробки з ШІ-агентами: Harness, Spec-Driven, Multi-Agent',
  subtitle: 'Від vibe coding до agentic engineering: context engineering, harness engineering, hooks/skills/MCP, власний агент, spec-driven development, мультиагентні системи, evals, безпека та метрики — за первинними джерелами 2025–2026.',
  modules: [m0, m1, m2, m9, m10, m3, m4, m5, m6, m7, m8],
  learn: [
    'Пояснити agentic loop і чому «агент = модель + harness», і виміряти вплив harness на результат',
    'Керувати контекстом: бюджет уваги, CLAUDE.md/AGENTS.md, компакція, субагенти-файрволи, Research → Plan → Implement',
    'Спроєктувати harness за моделлю guides/sensors: лінтери з remediation, hooks з exit-кодами, permissions, sandbox',
    'Писати hooks, skills, plugins і MCP-сервери; запускати агентів headless, у GitHub Actions і routines',
    'Зібрати власний agent loop з tools, стрімінгом, durable execution і approval gates; використовувати Claude Agent SDK',
    'Вести spec-driven development: constitution, EARS/Given-When-Then, Spec Kit / Kiro / OpenSpec / BMAD, реконсиляція',
    'Обирати архітектуру мультиагентної системи за даними (Anthropic, Cognition, Google, MAST) і використовувати subagents / agent teams / worktrees',
    'Будувати evals: error analysis, валідований LLM-as-judge, trajectory evals, регресія в CI; спостережуваність і метрики',
    'Захищати агентні системи: модель загроз, prompt injection, SSRF, sandbox, найменші привілеї, людина в контурі',
    'Оптимізувати вартість: маршрутизація моделей, кеш промпту, локальні моделі; впроваджувати в команді за DORA 2025',
  ],
  requirements: `
- Досвід розробки (будь-яка мова) і базові навички git, тестів, CI.
- Доступ до хоча б одного coding-агента (Claude Code, Codex CLI, Cursor, Copilot, Gemini CLI або OpenCode) і API-ключ для практики з власним агентом.
- Реальний репозиторій, у якому можна змінювати конфігурацію та CI — усі практичні завдання виконуються в ньому.
`,
  description: `
Цей курс — не «як промптити Claude», а інженерна дисципліна роботи з coding-агентами у 2026 році. Він побудований на первинних джерелах: інженерних постах OpenAI (harness engineering, 1 млн рядків коду без ручного написання), Anthropic (long-running agents, multi-agent research system, context engineering), Cognition, LangChain, Stripe, Thoughtworks; дослідженнях ETH Zürich (AGENTS.md), UC Berkeley (MAST), Google Research (scaling agent systems); документації Claude Code, Spec Kit, Kiro, OpenSpec, MCP, A2A; і програмах курсів Anthropic Academy, DeepLearning.AI, Frontend Masters, Udemy, Vizuara, Stanford CS146S, Berkeley MOOC.

Одинадцять розділів ідуть від ментальної моделі агента до капстоуну: context engineering → harness engineering → розширення (hooks, skills, plugins, MCP, headless) → побудова власного агента → spec-driven development → мультиагентні системи → evals та observability → безпека → команда й метрики. Кожна лекція має завдання у твоєму репозиторії, тест для самоперевірки й посилання на першоджерела.

Результат — не сертифікат, а робочий harness, spec-процес, субагенти й eval-набір у твоєму проєкті, які працюватимуть без тебе.
`,
  audience: `
- Розробники, які вже користуються coding-агентами і хочуть відтворюваного інженерного процесу замість «промпт → код → молимось».
- Тімліди й архітектори, що відповідають за впровадження агентів у команді: harness, безпека, метрики, адопція.
- Технічні продакт-менеджери та аналітики, які пишуть spec-и для агентів (розділи Spec-Driven Development і Context Engineering).
- Інженери, що будують власні агентні продукти на Claude Agent SDK, LangGraph чи власному циклі.
`,
  sourcesMd: SOURCES_MD,
};
