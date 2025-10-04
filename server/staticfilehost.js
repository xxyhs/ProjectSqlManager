const { stringEqual, mimeTypes } = require('./utils')
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateETag(stats) {
  // 基于文件大小和修改时间生成哈希
  const str = `${stats.size}-${stats.mtimeMs}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

function serveFold (rootDir) {
  return function(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    let sendedFile = false;
    if (stringEqual(req.method, 'get', false)) {
      let filePath = path.join(rootDir, url.pathname)
      if (stringEqual(url.pathname, '/')) {
        filePath = path.join(rootDir, 'index.html')
      }
      if (filePath.startsWith(rootDir)) {
        const fileStat = fs.statSync(filePath, { throwIfNoEntry: false });
        if (fileStat && fileStat.isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeType = mimeTypes[ext] || "application/octet-stream";
          sendedFile = true;
          if (filePath.endsWith('.html')) {
            res.writeHead(200, {
              "Content-Type": mimeType,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            })
            fs.createReadStream(filePath).pipe(res);
          } else {
            const etag = generateETag(fileStat);
            const lastModified = fileStat.mtime.toUTCString();
            if (stringEqual(req.headers["if-none-match"], etag, false) || stringEqual(req.headers["if-modified-since"], lastModified, false)) {
              res.writeHead(304); // Not Modified
              res.end();
              return;
            }
            res.writeHead(200, {
              "Content-Type": mimeType,
              "Cache-Control": "public, max-age=3600", // 缓存 1 小时
              "ETag": etag,
              "Last-Modified": lastModified
            });
            fs.createReadStream(filePath).pipe(res);
          }
        }
      }
    }
    return sendedFile;
  }
}

module.exports = serveFold