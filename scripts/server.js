const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // URL decode & remove query params
  let reqPath = '/';
  try {
    reqPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    reqPath = req.url.split('?')[0];
  }

  let filePath = path.join(ROOT_DIR, reqPath === '/' ? 'index.html' : reqPath);

  // Security: Prevent directory traversal outside root
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      // If requested path not found and has no extension, fallback to index.html (SPA support)
      if (statErr.code === 'ENOENT') {
        const rootIndex = path.join(ROOT_DIR, 'index.html');
        return fs.readFile(rootIndex, (fallbackErr, indexContent) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(indexContent, 'utf-8');
        });
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`Server Error: ${statErr.code}`);
    }

    // Handle Directory request (EISDIR fix): serve index.html
    if (stats.isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        filePath = dirIndex;
      } else {
        filePath = path.join(ROOT_DIR, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Server Error: ${readErr.code}`);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
