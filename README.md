# FOMO fighters — Wiki

Статическая вики по игре FOMO fighters. Astro SSG + Vue islands, EN (без префикса) и RU (`/ru`).

## Требования

- **Node.js >= 22.12.0** (см. `engines` в `package.json`).

## Старт

```bash
npm install
npm run dev
```

Откроется `http://localhost:4321`.

## Скрипты

| Скрипт            | Действие                                      |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | dev-сервер с HMR                               |
| `npm run build`   | прод-билд в `dist/`                            |
| `npm run preview` | локальный preview прод-билда                   |
| `npm run check`   | type-check `.astro` + TS                        |

Остальные скрипты (`sync:mono`, `sync:images`, `check:assets`, `compare:heroes`, `sync:patch*`, `patch:*`, `sync:fandom*`) синхронизируют игровые данные и ассеты из монорепо — см. их исходники в `scripts/`.

## Публикация

Готовый SSG-билд лежит в `dist/` и **коммитится в репозиторий**. На VPS nginx отдаёт `dist/` как статику напрямую — Node-процесс в проде не нужен.

```bash
npm run build
```

Закоммитьте обновлённый `dist/` вместе с исходниками в том же PR/коммите.

### VPS

- `deploy/fomowiki.nginx.conf` — конфиг nginx (static root на `dist/`, legacy-редиректы `/vip`, `/dawn-fund`, `/fomopass`, `/en/*`).
- `scripts/update-from-git.sh` — безопасный `git pull` + локальная пересборка на сервере (sanity-check, что `dist/` соответствует исходникам).
- `scripts/force-sync-from-remote.sh` — деструктивный full reset до `origin/<branch>` (на случай расхождений).

## Стек

- **Astro 7** (SSG)
- **Vue 3** для интерактивных островов (language switcher, quest tabs, skill tree, troop race panel, hero level progression)
- **Tailwind CSS**
- **TypeScript**
