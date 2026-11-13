const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUiPath = require('swagger-ui-dist').getAbsoluteFSPath();
const root = __dirname;
const port = Number(process.env.PORT || 8000);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file;
  if (req.method === 'GET' && pathname === '/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({ message: 'Hello, world!' }));
  }
  if (pathname === '/swagger' || pathname === '/swagger/') file = path.join(root, 'swagger-local.html');
  else if (pathname === '/openapi.json') file = path.join(root, 'openapi.json');
  else if (pathname.startsWith('/swagger-ui/')) {
    const relative = path.normalize(pathname.slice('/swagger-ui/'.length));
    file = path.resolve(swaggerUiPath, relative);
    if (!file.startsWith(path.resolve(swaggerUiPath) + path.sep)) {
      res.writeHead(403); return res.end('Forbidden');
    }
  } else {
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    file = path.resolve(root, 'public', relative);
    if (!file.startsWith(path.resolve(root, 'public') + path.sep)) {
      res.writeHead(403); return res.end('Forbidden');
    }
  }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Сайт: http://localhost:${port}/`);
  console.log(`Swagger: http://localhost:${port}/swagger`);
});
