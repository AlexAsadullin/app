// Сборка учебной копии: копирует index.html в public/ и пишет public/config.js
// с адресом вебхука из переменной окружения WEBHOOK_URL.
// Адрес в репозиторий не кладём — только в переменные окружения Vercel.
// Если переменная не задана для окружения, в журнале сборки будет видно «undefined» (случай F02).

const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, 'public');
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(out, 'index.html'));

const url = process.env.WEBHOOK_URL;
fs.writeFileSync(
  path.join(out, 'config.js'),
  'window.WEBHOOK_URL = ' + JSON.stringify(url === undefined ? 'undefined' : url) + ';\n'
);

// В журнал пишем только, задана ли переменная, а не её значение.
console.log('config.js записан: WEBHOOK_URL = ' + (url ? 'задана' : 'undefined'));
