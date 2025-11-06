// routes.js
const querystring = require('querystring');
const { generateHTML, sanitize, sendResponse } = require('./utils');

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 MB

function handleGET(req, res, pathname) {
  switch (pathname) {
    case '/':
      sendResponse(res, 200, generateHTML('Home', '<h1>Home</h1><p>Welcome to the Home Page</p>'));
      break;
    case '/about':
      sendResponse(res, 200, generateHTML('About', '<h1>About</h1><p>Learn more about us</p>'));
      break;
    case '/contact':
      sendResponse(res, 200, generateHTML('Contact', '<h1>Contact</h1><p>Get in touch</p>'));
      break;
    default:
      sendResponse(res, 404, generateHTML('404', '<h1>404 Not Found</h1><p>Page Not Found</p>'));
  }
}

function handlePOST(req, res, pathname) {
  if (pathname !== '/submit') {
    sendResponse(res, 404, generateHTML('404', '<h1>404 Not Found</h1><p>Page Not Found</p>'));
    return;
  }

  // Перевіримо заголовок Content-Type (очікуємо application/x-www-form-urlencoded)
  const contentType = (req.headers['content-type'] || '').split(';')[0];
  if (contentType !== 'application/x-www-form-urlencoded') {
    sendResponse(res, 400, generateHTML('400', '<h1>400 Bad Request</h1><p>Expected application/x-www-form-urlencoded</p>'));
    return;
  }

  let body = '';
  let size = 0;

  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      // Надто великий запит
      res.writeHead(413, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>413 Payload Too Large</h1><p>Request body too large.</p>');
      req.destroy();
      return;
    }
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const parsed = querystring.parse(body);
      const name = sanitize(parsed.name || '');
      const email = sanitize(parsed.email || '');

      if (!name.trim() || !email.trim()) {
        sendResponse(res, 400, generateHTML('400', '<h1>400 Bad Request</h1><p>Invalid form data</p>'));
        return;
      }

      const content = generateHTML('Form Submitted', `<h1>Form Submitted</h1><p>Name: ${name}</p><p>Email: ${email}</p>`);
      sendResponse(res, 200, content);
    } catch (err) {
      console.error('Error parsing POST body:', err);
      sendResponse(res, 500, generateHTML('500', '<h1>500 Internal Server Error</h1><p>Server Error</p>'));
    }
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    sendResponse(res, 500, generateHTML('500', '<h1>500 Internal Server Error</h1><p>Server Error</p>'));
  });
}

module.exports = { handleGET, handlePOST };
