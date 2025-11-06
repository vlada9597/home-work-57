// server.js
const http = require('http');
const url = require('url');
const { handleGET, handlePOST } = require('./routes');

const DEFAULT_PORT = 3000;
let PORT = Number(process.env.PORT) || DEFAULT_PORT;

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    if (req.method === 'GET') {
      handleGET(req, res, pathname);
    } else if (req.method === 'POST') {
      handlePOST(req, res, pathname);
    } else {
      // Метод не дозволений
      res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>405 Method Not Allowed</h1>');
    }
  } catch (err) {
    console.error('Unhandled server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 Internal Server Error</h1><p>Server Error</p>');
  }
});

function startServer(port, tries = 0) {
  server.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    // Якщо хочеш автоматичний fallback: збільшити порт на 1 і пробувати знову (обережно).
    // Тут ми не робимо автоперезапуску, лише виводимо пораду.
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
