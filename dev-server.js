const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const publicDir = path.join(root, 'public');
const logPath = path.join(root, 'actions.log');
let port = Number(process.env.PORT || 8000);
const explicitPort = Boolean(process.env.PORT);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const allowedActions = new Set(['page_loaded','form_submit_attempt','rate_limit_blocked','submission_started','response_429','response_http_error','response_success','request_timeout','request_error','cooldown_expired']);

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'POST' && pathname === '/__log') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const input = JSON.parse(body);
        if (!allowedActions.has(input.action)) { res.writeHead(400); return res.end('Unknown action'); }
        const record = {
          time: typeof input.time === 'string' ? input.time : new Date().toISOString(),
          action: input.action,
          environment: 'локально',
        };
        if (Number.isFinite(input.status)) record.status = input.status;
        if (Number.isFinite(input.retryAfterSeconds)) record.retryAfterSeconds = input.retryAfterSeconds;
        if (typeof input.errorName === 'string') record.errorName = input.errorName.slice(0, 80);
        fs.appendFile(logPath, JSON.stringify(record) + '\n', error => {
          if (error) { res.writeHead(500); return res.end('Log write failed'); }
          res.writeHead(204); res.end();
        });
      } catch (_) { res.writeHead(400); res.end('Invalid JSON'); }
    });
    return;
  }
  if (req.method !== 'GET') { res.writeHead(405); return res.end('Method not allowed'); }
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  const file = path.resolve(publicDir, rel);
  if (!file.startsWith(publicDir + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(content);
  });
});

function listen() {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' && !explicitPort && port < 8010) {
      port += 1;
      console.log(`Порт занят; пробую ${port}…`);
      listen();
      return;
    }
    console.error(`Не удалось запустить локальный сервер: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Local site: http://localhost:${port}/ (log: ${logPath})`);
  });
}

listen();
