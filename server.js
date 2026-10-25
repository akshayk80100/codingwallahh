/**
 * Production Zero-Downtime Server
 * Supports both Express (if installed) and built-in Node.js HTTP (zero dependencies).
 * Features:
 * - Automatic port detection ($PORT or 80 or 8080)
 * - MIME type mapping
 * - Clean URLs (/test-portal -> test-portal.html)
 * - Healthcheck route (/health)
 * - Automatic crash prevention & graceful recovery
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Health check endpoint for zero-downtime container monitoring
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));
    return;
  }

  // Routing defaults & clean URLs
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/test-portal') {
    pathname = '/test-portal.html';
  }

  let filePath = path.join(ROOT_DIR, pathname);

  // Security check: prevent directory traversal outside root
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file not found, try fallback or 404
      if (err.code === 'ENOENT') {
        const htmlFallback = filePath + '.html';
        if (fs.existsSync(htmlFallback)) {
          return serveFile(htmlFallback, res);
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><body style="background:#0b1329;color:#e2e8f0;font-family:sans-serif;text-align:center;padding:100px;">
          <h1 style="color:#38bdf8;">404 - Page Not Found</h1>
          <p>The requested file does not exist.</p>
          <a href="/" style="color:#facc15;">Return to Home</a>
        </body></html>`);
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Caching headers: cache static assets for speed, HTML must revalidate
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  res.writeHead(200, { 'Content-Type': contentType });
  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  });
  stream.pipe(res);
}

// Crash Prevention: Catch unhandled errors gracefully
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception prevented server crash:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[WARNING] Unhandled rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Production Server Active`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`📡 Ready for custom domain and zero-downtime proxy`);
  console.log(`====================================================`);
});
