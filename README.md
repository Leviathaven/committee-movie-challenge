# Cinema Challenge / Киночеллендж 🎬

Интерактивный летний киночеллендж с карточками тем, подсказками, таймерами автоматического открытия и визуальными анимациями!

## 🚀 Как запустить проект локально

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите в режиме разработки:
   ```bash
   npm run dev
   ```
3. Откройте страницу по адресу: [http://localhost:3000](http://localhost:3000)

---

## 🌍 Бесплатный хостинг на GitHub Pages

Вы можете опубликовать этот проект абсолютно бесплатно на GitHub Pages. Благодаря настроенной относительной адресации (`base: './'` в `vite.config.ts`), проект будет корректно загружать все скрипты, стили, изображения и шрифты при любом адресе репозитория.

### Способ 1: Автоматический деплой через GitHub Actions (Рекомендуется)

1. Создайте в репозитории файл по пути `.github/workflows/deploy.yml` со следующим содержимым:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main
         - master # Срабатывает при пуше в эти ветки

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'

         - name: Install dependencies
           run: npm ci || npm install

         - name: Build
           run: npm run build

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. Инициализируйте репозиторий, закоммитьте код и отправьте его на GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
   git push -u origin main
   ```

3. Перейдите в настройки репозитория на GitHub:
   * **Settings** -> **Pages**.
   * В разделе **Build and deployment** -> **Source** выберите **GitHub Actions**.

После этого при каждом пуше проект будет автоматически собираться и разворачиваться на вашем GitHub Pages!

---

### Способ 2: Ручной деплой через ветку `gh-pages`

Если вы предпочитаете не использовать GitHub Actions, вы можете воспользоваться пакетом `gh-pages`:

1. Установите вспомогательный пакет:
   ```bash
   npm install -D gh-pages
   ```
2. Добавьте скрипты в `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Запустите публикацию:
   ```bash
   npm run deploy
   ```
   Утилита автоматически соберет проект в папку `dist` и отправит ее содержимое в ветку `gh-pages` в вашем репозитории.
