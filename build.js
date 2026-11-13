// Учебная сборка для демонстрации F02.
// WEBHOOK_URL — публичный адрес назначения формы, он попадёт в браузер.
// Никогда не передавайте сюда токены, пароли или другие секреты.
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, 'public');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(out, 'index.html'));

const webhookUrl = process.env.WEBHOOK_URL;
const environment = process.env.VERCEL_ENV || process.env.APP_ENV || 'локально';
const config = {
  // Отсутствующая настройка намеренно представляется строкой "undefined",
  // чтобы в учебном опыте запрос воспроизводил F02: POST /undefined.
  webhookUrl: webhookUrl || 'undefined',
  environment,
  configured: Boolean(webhookUrl),
};
fs.writeFileSync(
  path.join(out, 'config.js'),
  'window.APP_CONFIG = ' + JSON.stringify(config) + ';\n'
);

// Значение адреса никогда не печатаем в журнал.
console.log(`Сборка окружения: ${environment}`);
console.log(`WEBHOOK_URL = ${webhookUrl ? 'задана' : 'undefined'}`);
