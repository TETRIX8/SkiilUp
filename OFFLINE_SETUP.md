# Настройка офлайн функциональности SkillUp

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd SkiilUp
npm install
# или
pnpm install
```

### 2. Запуск в режиме разработки
```bash
npm run dev
# или
pnpm dev
```

### 3. Сборка для продакшена
```bash
npm run build
# или
pnpm build
```

## 📱 Тестирование офлайн функциональности

### 1. Откройте DevTools
- Нажмите F12 или Ctrl+Shift+I
- Перейдите во вкладку "Application" (Chrome) или "Storage" (Firefox)

### 2. Проверьте IndexedDB
- В левом меню найдите "IndexedDB"
- Откройте "skillup-db"
- Проверьте хранилища: disciplines, topics, assignments, achievements, userData

### 3. Тестирование офлайн режима
1. **Включите офлайн режим:**
   - DevTools → Network → поставьте галочку "Offline"
   - Или в Chrome: DevTools → Network → выберите "Offline" в dropdown

2. **Проверьте работу:**
   - Обновите страницу
   - Навигация должна работать
   - Данные должны загружаться из кэша
   - Появится индикатор "Офлайн"

3. **Верните онлайн режим:**
   - Снимите галочку "Offline" в DevTools
   - Данные автоматически синхронизируются

### 4. Демо панель
- Перейдите в Профиль → вкладка "Офлайн"
- Используйте кнопки для тестирования:
  - "Тестировать офлайн функциональность"
  - "Принудительная синхронизация"
  - "Очистить кэш"

## 🔧 Настройка Service Worker

### Автоматическая регистрация
Service Worker регистрируется автоматически при загрузке приложения.

### Проверка регистрации
1. DevTools → Application → Service Workers
2. Должен быть активный SW с файлом `sw.js`
3. Статус: "activated and running"

### Обновление Service Worker
```javascript
// В консоли браузера
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.update());
});
```

## 📊 Мониторинг производительности

### Статистика хранилища
```javascript
// В консоли браузера
import { getStorageStats } from './src/lib/db.js';
getStorageStats().then(console.log);
```

### Очистка кэша
```javascript
// В консоли браузера
import { clearAllData } from './src/lib/db.js';
clearAllData().then(() => console.log('Кэш очищен'));
```

## 🐛 Устранение неполадок

### Проблема: Данные не кэшируются
**Решение:**
1. Проверьте консоль на ошибки
2. Убедитесь, что IndexedDB поддерживается браузером
3. Проверьте квоты хранилища

### Проблема: Синхронизация не работает
**Решение:**
1. Проверьте подключение к интернету
2. Откройте DevTools → Application → IndexedDB → queue
3. Проверьте наличие запросов в очереди

### Проблема: Service Worker не обновляется
**Решение:**
1. Очистите кэш браузера
2. Перезагрузите страницу с Ctrl+F5
3. Проверьте файл `public/sw.js`

## 📱 Мобильное тестирование

### Chrome DevTools
1. Откройте DevTools
2. Нажмите на иконку устройства (Ctrl+Shift+M)
3. Выберите устройство для тестирования
4. Включите офлайн режим

### Реальное мобильное устройство
1. Подключите устройство к той же сети
2. Откройте IP адрес сервера разработки
3. Включите режим "В самолете"
4. Проверьте работу офлайн

## 🔒 Безопасность

### HTTPS обязателен
Service Worker работает только по HTTPS в продакшене.

### Локальная разработка
Для localhost Service Worker работает по HTTP.

### Проверка безопасности
```bash
# Проверка HTTPS
curl -I https://your-domain.com
# Должен вернуть 200 OK
```

## 📈 Оптимизация

### Размер кэша
- Максимальный размер: ~50MB
- Автоматическая очистка устаревших данных
- Сжатие данных при необходимости

### Производительность
- Ленивая загрузка данных
- Фоновая синхронизация
- Умное кэширование

## 🚀 Деплой

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Загрузите папку dist в Netlify
```

### Собственный сервер
```bash
npm run build
# Скопируйте содержимое dist/ на сервер
# Убедитесь, что HTTPS настроен
```

## 📚 Дополнительные ресурсы

- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Offline Storage](https://web.dev/offline-storage/)

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера
2. Изучите DevTools → Application
3. Проверьте файл `OFFLINE_FEATURES.md`
4. Создайте issue в репозитории

---

**Удачного тестирования! 🎉**
