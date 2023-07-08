# Описание процесса сборки и запуска приложений

## Установка зависимостей

1. Убедитесь, что у вас установлен Node.js и npm (Node Package Manager) версии 18 или выше.
2. Перейдите в корневую директорию проекта.
3. Выполните команду `npm install`, чтобы установить все необходимые зависимости проекта.

## Подготовка базы данных

1. Убедитесь, что MongoDB уже установлена и запущена на вашей машине.
2. В корне есть файл .enc.example скопируйте и переименуйте в .env
3. В файле `.env` укажите соответствующую строку подключения к базе данных (`DB_URI`).

## Запуск приложений

### `app.ts`

Это приложение эмулирует работу интернет-магазина и генерирует покупателей для сохранения в базе данных.

1. Убедитесь, что MongoDB запущена.
2. Запустите приложение, выполнив команду `npm run start:app`.

### `sync.ts`

Это приложение слушает изменения в коллекции `customers` и копирует анонимизированные данные в коллекцию `customers_anonymised`.

1. Убедитесь, что MongoDB запущена.
2. Запустите приложение, выполнив команду `npm run start:full-sync` (это со флагом --full-reindex) или же npm run start:sync (без флага --full-reindex).
   - Флаг `--full-reindex` запускает полную синхронизацию, при которой все данные копируются из `customers` в `customers_anonymised`.
   - Без флага `--full-reindex` приложение работает в режиме реалтайм синхронизации, слушая изменения и копируя только новые данные.

## Дополнительная информация

- Если хотите сразу оба файла запустить можете выполнить команду `npm run start` (без флага --full-reindex) или же `npm run start:full` (с флагом --full-reindex)
- Файл `.env` содержит переменные окружения, включая строку подключения к базе данных.
