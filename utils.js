// utils.js
const { Buffer } = require('buffer');

function generateHTML(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
</head>
<body>
${body}
</body>
</html>`;
}

// Просте санітизування для уникнення XSS (замінюємо <, >, &, ")
function sanitize(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendResponse(res, statusCode, html) {
  const body = Buffer.from(html, 'utf-8');
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length,
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

module.exports = { generateHTML, sanitize, sendResponse };
