# Consultant Chat

Мини-страница «Чат с консультантом»: список встреч (SSR + TanStack Query) и чат по WebSocket с очередью сообщений, reconnect и дедупликацией.

## Требования к окружению

- Node.js 20+
- pnpm 10+

## Установка

```bash
pnpm install
```

## Запуск

Next.js и WebSocket-сервер запускаются отдельными процессами.

```bash
pnpm dev   # Next.js на http://localhost:3000
pnpm ws    # WebSocket echo-сервер на ws://localhost:8081
```

Либо оба процесса параллельно одной командой:

```bash
pnpm dev:all
```

Страница чата: [http://localhost:3000/chat](http://localhost:3000/chat)

## Команды

```bash
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest (unit-тесты)
pnpm build       # production build
```

## Архитектура

```text
app/
  api/meetings/route.ts   # Route Handler, отдаёт мок-встречи
  chat/
    layout.tsx             # оборачивает страницу в QueryProvider (client)
    page.tsx                # Server Component: prefetch + hydration
  layout.tsx                # корневой layout (server)
  page.tsx                  # редирект на /chat

components/
  providers/query-provider.tsx   # минимальный client-компонент с QueryClientProvider
  meetings/meetings-section.tsx  # client-компонент, использует useQuery
  chat/
    chat.tsx                 # оркестрация чата (client)
    message-list.tsx
    message-form.tsx
    connection-status.tsx

features/
  meetings/{api,queries,types}.ts
  chat/
    model/{types,reducer}.ts       # чистая state machine чата
    hooks/use-chat-websocket.ts    # WebSocket lifecycle + очередь

lib/
  meetings/get-meetings.ts     # единственный источник мок-данных
  react-query/get-query-client.ts

server.js   # standalone WebSocket echo-сервер (ws://localhost:8081)
```

### Граница Server/Client Components

- `app/layout.tsx` и `app/chat/page.tsx` — Server Components. `page.tsx` делает `prefetchQuery` через общую функцию `getMeetings` (без HTTP-запроса к собственному API) и передаёт дегидрированный кэш через `HydrationBoundary`.
- `app/chat/layout.tsx` — тонкая обёртка, добавляющая `QueryProvider` (единственный обязательный client-компонент на уровне layout).
- `MeetingsSection` и `Chat` — Client Components: работают с интерактивностью (refetch, WebSocket), но получают начальные данные из серверного кэша, а не делают собственный первый запрос.
- Весь WebSocket-код (`use-chat-websocket.ts`) выполняется только в браузере и не импортируется ни в одном Server Component.

### SSR + TanStack Query hydration

`lib/meetings/get-meetings.ts` — единая серверная функция с мок-данными. Она используется в двух местах:

1. В Route Handler `GET /api/meetings` — для клиентских запросов после гидрации (кнопка «Обновить» вызывает `fetch('/api/meetings')`).
2. В `app/chat/page.tsx` — напрямую, без HTTP, для `queryClient.prefetchQuery`.

`queryKey` (`["meetings"]`) одинаковый на сервере и клиенте, поэтому после гидрации `useQuery` в `MeetingsSection` сразу видит серверные данные без повторного запроса и без мигания пустого состояния. При отключённом JavaScript список встреч уже присутствует в HTML, так как рендерится на сервере.

### Очередь сообщений, reconnect и дедупликация

Состояние чата — `useReducer` с чистым редьюсером (`features/chat/model/reducer.ts`), полностью покрытым unit-тестами. WebSocket lifecycle инкапсулирован в хуке `use-chat-websocket.ts`:

- При отправке сообщение сразу добавляется в ленту со статусом `queued` (optimistic UI), пользователь не ждёт сервер.
- Если соединение открыто — сообщение сразу отправляется и переходит в `sending`.
- Если соединения нет — сообщение остаётся в ленте в статусе `queued` с кнопкой «Повторить».
- Echo от сервера одновременно подтверждает исходное сообщение (`sending → delivered`) и добавляется в ленту как ответ консультанта.
- Дедупликация: `pendingIdsRef` хранит id сообщений, ожидающих echo; повторный echo с уже обработанным id игнорируется на уровне хука, а редьюсер дополнительно защищён от повторного добавления сообщения консультанта с тем же id.
- При разрыве соединения все сообщения в статусе `sending` возвращаются в `queued` (`PENDING_RETURNED_TO_QUEUE`), после восстановления соединения очередь автоматически «пролетает» (`flushQueue`) с теми же id.
- Reconnect — exponential backoff `1000 → 2000 → 4000 → 8000 → 10000` мс с небольшим jitter, счётчик попыток сбрасывается при успешном `open`. Переподключение управляется одним таймером в ref; при unmount таймер и сокет корректно очищаются, повторное открытие сокета при уже активном соединении исключено, потому что новый `connect()` вызывается только из `scheduleReconnect` или при монтировании эффекта (deps `[]`).
- Некорректный (не JSON или не соответствующий форме `OutgoingPayload`) payload от сервера тихо отбрасывается и не ломает интерфейс.

### Ограничения echo-сервера и at-least-once semantics

Тестовый `server.js` — простой echo-сервер: он не хранит состояние, не подтверждает доставку отдельным ack-сообщением и самостоятельно закрывает соединение через 25–35 секунд, эмулируя нестабильную сеть.

Модель доставки на клиенте — **at-least-once с дедупликацией по id**. Настоящую **exactly-once** доставку невозможно гарантировать без:

- серверных acknowledgements, отдельных от бизнес-данных;
- персистентного состояния «что было доставлено» на сервере;
- серверной дедупликации при получении дублей от клиента.

В рамках тестового задания сервер не хранит очередь на время дисконнекта — очередь целиком находится в памяти клиента и живёт до перезагрузки страницы (localStorage и восстановление после полной перезагрузки не требуются по условиям задания).

## Известные ограничения

- Очередь сообщений хранится только в памяти вкладки; обновление страницы её очищает.
- Echo-сервер закрывает соединение по таймеру намеренно — это часть проверки reconnect-логики, а не баг.
- Список встреч полностью захардкожен (обновление не меняет данные, только повторно их запрашивает).

## Время выполнения

TODO: указать фактическое время перед сдачей.
