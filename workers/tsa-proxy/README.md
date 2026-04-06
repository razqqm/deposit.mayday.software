# mayday-tsa-proxy

Тонкий Cloudflare Worker, который форвардит запросы от
[mayday.software](https://mayday.software) к публичным RFC 3161 TSA и
OpenTimestamps calendar-серверам.

**Зачем он нужен.** И публичные TSA (FreeTSA, DigiCert, Sectigo), и
большинство OTS-календарей не отдают `Access-Control-Allow-Origin`,
поэтому браузер не может постучаться к ним напрямую. Worker — единственная
причина существования бэкенда в этом проекте; он не хранит данные, не
ведёт логов и не имеет секретов.

## Маршруты

| Метод | Путь | Назначение |
|---|---|---|
| `OPTIONS` | `*` | CORS preflight (отдаёт `Access-Control-Allow-Origin: *`) |
| `POST` | `/tsa/:provider` | Форвард `application/timestamp-query` к RFC 3161 TSA |
| `POST` | `/ots/:calendar` | Форвард 32-байтового SHA-256 digest к OTS calendar |

Allowlist провайдеров вшит в [src/index.ts](src/index.ts):

- TSA: `freetsa`, `digicert`, `sectigo`
- OTS calendars: `alice`, `bob`, `finney`, `catallaxy`

Клиент не может попросить Worker сходить в произвольный URL.

## Локальная разработка

```bash
cd workers/tsa-proxy
npm install
npm run dev          # → http://localhost:8787
```

В другом терминале — фронт против локального Worker:

```bash
cd ../../frontend
# Прокинь WORKER_BASE через window-переменную перед бутстрапом,
# либо отредактируй worker-config.ts.
npm start
```

Простой smoke-test через openssl:

```bash
# Сгенерировать TSQ
echo "hello" > /tmp/hello.txt
openssl ts -query -data /tmp/hello.txt -sha256 -no_nonce -cert -out /tmp/hello.tsq

# Отправить через Worker
curl -X POST http://localhost:8787/tsa/freetsa \
     -H "Content-Type: application/timestamp-query" \
     --data-binary @/tmp/hello.tsq \
     -o /tmp/hello.tsr

# Прочитать ответ
openssl ts -reply -in /tmp/hello.tsr -text
```

## Деплой

```bash
npx wrangler login   # один раз
npm run deploy
```

После деплоя Worker доступен по адресу
`https://mayday-tsa-proxy.<account>.workers.dev`. Этот URL прописывается
в `frontend/src/app/shared/services/deposit/anchors/worker-config.ts`
как `DEFAULT_WORKER_BASE`.

## Что это НЕ делает

- Не хранит ничего — никаких KV, D1, R2.
- Не логирует тела запросов / ответов.
- Не модифицирует TSA-ответы — байты идут как есть.
- Не пытается «улучшить» подпись TSA или валидировать её — это работа клиента.
- Не пытается стать платным сервисом — никакой rate-limit логики, кроме CF defaults.
