# AI Dev Course — Інженерія розробки з ШІ-агентами

Mobile-first веб-курс: harness engineering, spec-driven development, мультиагентні системи, context engineering, evals, безпека. Побудовано на джерелах 2025–2026.

## Стек
- Node 22 + Express, SQLite (better-sqlite3) для прогресу
- Vanilla JS SPA, контент у `public/content/*.js`, схеми — inline SVG
- Логін простим кодом (хешується), прогрес синхронізується між пристроями

## Запуск
```bash
npm install
npm start          # http://localhost:3000
```
`DATA_DIR` — директорія для SQLite (на Railway — примонтований volume, напр. `/data`).

## Деплой на Railway
1. New Project → Deploy from GitHub repo.
2. Додати Volume, mount path `/data`; змінна `DATA_DIR=/data`.
3. Generate Domain.
Deployed: https://ai-dev-course-production.up.railway.app
