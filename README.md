# ШМЯКОДРОМ — слизни-рогатки (Telegram Mini App)

Пиксельная мини-игра: тянешь слизня назад, как рогатку, отпускаешь, он летит, отскакивает и шмякается блином. Нужно собрать 3 конфеты и попасть в банку «ДОМ».
Сделано на чистом HTML5 Canvas и JS, без сборки и без зависимостей.

## Что внутри
- `index.html`: точка входа
- `game.js`: движок, физика, экраны, звук (синтез через WebAudio), интеграция с Telegram
- `levels.js`: 10 уровней. Их легко править: блоки, батуты, шипы, лифты, бамперы, порталы
- `assets/`: атласы 5 слизней (64×64, оттяжка 128×64)
- `telegram-web-app.js`: локальная копия SDK Telegram. Без Telegram игра тоже работает

Прогресс (звёзды, выбранный слизень, звук) хранится в localStorage.

## Персонажи
| Слизень | Перк |
|---|---|
| Желейка | супер-прыгучая, реже шмякается |
| Лужица | почти не отскакивает, прилипает |
| Ёжик | шипы не страшны, отпрыгивает от них |
| Пончик | +1 бросок, катится |
| Лавыч | мощный бросок, тяжёлый |

## Локальный запуск
```bash
cd slime-game
python3 -m http.server 8080
# открыть http://localhost:8080
```
Через file:// не открывай: браузер не загрузит картинки.

## Как подключить к Telegram-боту
Telegram открывает Mini App только по **HTTPS**.

### 1. Выложить папку на хостинг (бесплатно)
- **GitHub Pages:** создай репозиторий, залей содержимое папки, затем Settings → Pages → Branch: main / root. Ссылка будет вида `https://<ник>.github.io/<репо>/`
- **Netlify:** зайди на app.netlify.com/drop и перетащи туда папку. Ссылку дадут сразу
- **Vercel:** `npx vercel` в папке игры
- **Cloudflare Pages:** Workers & Pages → Create → Upload assets

### 2. Создать бота и Mini App через @BotFather
1. `/newbot`: задай имя и username, получишь токен.
2. Вариант A, кнопка меню. `/mybots` → бот → Bot Settings → Menu Button → Configure, вставь HTTPS-ссылку и текст «Играть». Кнопка появится слева от поля ввода.
3. Вариант B, отдельное Mini App с прямой ссылкой. `/newapp` → выбери бота → название, описание, картинка 640×360 → URL игры → short name, например `shmyak`. Ссылка будет `https://t.me/<бот>/shmyak`, её можно кидать в любые чаты.
4. Опционально: `/mybots` → Bot Settings → Configure Mini App → Enable, тогда игра откроется прямо из профиля бота.

### 3. (Опционально) маленький бот с кнопкой «Играть»
Python, aiogram 3 (`pip install aiogram`):
```python
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

TOKEN = "ТОКЕН_ОТ_BOTFATHER"
GAME_URL = "https://<ник>.github.io/<репо>/"
dp = Dispatcher()

@dp.message(CommandStart())
async def start(m: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🐌 Играть", web_app=WebAppInfo(url=GAME_URL))]])
    await m.answer("Слизни заряжены. Тяни и шмякай!", reply_markup=kb)

async def main():
    await dp.start_polling(Bot(TOKEN))

asyncio.run(main())
```

## Что сделано под Telegram
`Telegram.WebApp.ready()`, `expand()`, `disableVerticalSwipes()` (чтобы свайп вниз не закрывал игру при оттяжке), цвет шапки, системная кнопка «Назад», вибрация (HapticFeedback) при запуске, шмяке, конфетах и победе. Все вызовы обёрнуты в проверки, поэтому в обычном браузере ничего не ломается.

## Управление и тех. детали
- Тапни в любом месте поля и тяни в сторону, противоположную полёту. Точки показывают траекторию. Отпусти, чтобы запустить. Клавиши: R перезапуск, Esc назад.
- Пиксели честные: внутреннее разрешение около 240×470, масштаб только целый, `image-rendering: pixelated`.
- Физика идёт с фиксированными подшагами (4 на кадр).
- Сменить уровни можно в `levels.js`. Координаты поля 240×440, пол обычно `[0,420,240,20,'g']`.
