const http = require("http");
const path = require("path");
const process = require('process');
const fs = require("fs");
const { sendJSON, listSqls, parseJsonBody, stringEqual, listDir, openBrowser } = require("./utils");
const serveFold= require('./staticfilehost');

const uiPath = process.env.NODE_ENV === 'production' ? path.join(__dirname, '../psm-ui/dist') : path.join(__dirname, '../static-files')

let SQLsRoot = process.cwd();

const server = http.createServer(async (req, res) => {
  // 静态文件挂账
  const staticHost = serveFold(uiPath);
  const sendedFile = staticHost(req, res);
  if (sendedFile || res.headersSent || res.writableEnded || !res.writable) {
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const url = new URL(req.url, `http://${req.headers.host}`)
  const contentType = req.headers["content-type"] || "application/octet-stream";
  if (stringEqual(contentType, 'application/json', false)) {
    await parseJsonBody(req);
  }
  if (stringEqual(req.method, "OPTIONS", false)) {
    res.writeHead(204);
    res.end();
    return;
  }
  if (stringEqual(url.pathname, '/api/path/setting', false) && stringEqual(req.method, 'get', false)) {
    sendJSON(res, 200, {
      cwd: process.cwd(),
      dir: SQLsRoot 
    });
  } else if (stringEqual(url.pathname, '/api/path/setting', false) && stringEqual(req.method, 'put', false)) {
    const destDir = req.body.dir;
    if (!destDir) {
      sendJSON(res, 400, {
        msg: 'invalid dir provided'
      });
      return;
    }
    const dirStat = fs.statSync(destDir, { throwIfNoEntry: false });
    if (dirStat) {
      SQLsRoot = destDir;
      sendJSON(res, 200, {
        cwd: process.cwd(),
        dir: SQLsRoot 
      });
    } else {
      sendJSON(res, 400, {
        msg: 'invalid dir provided'
      });
    }
  } else if (stringEqual(url.pathname, '/api/sql/list', false) && stringEqual(req.method, 'get', false)) {
    const dirStat = fs.statSync(SQLsRoot, { throwIfNoEntry: false });
    if (dirStat) {
      try {
        var sqlInfos = listSqls(SQLsRoot)
        sendJSON(res, 200, sqlInfos);
      } catch (ex) {
        console.log(ex)
        sendJSON(res, 500, {
          msg: `sql file parse error`
        });
      }
    } else {
      sendJSON(res, 400, {
        msg: `${SQLsRoot} can not access`
      });
    }
  } else if (stringEqual(url.pathname, '/api/sql/update', false) && stringEqual(req.method, 'put', false)) {
    // 更新sql
    const sqlInfo = req.body;
    if (stringEqual(sqlInfo.code, 'Example', false)) {
      sendJSON(res, 400, {
        msg: 'can not update example sql file'
      });
      return;
    }
    const fullPath = `${path.join(SQLsRoot, ...sqlInfo.code.split('.'))}.sql`;
    let newFullPath
    const fullContent = `-- Name: ${sqlInfo.name}\r\n-- Description: ${sqlInfo.description}\r\n${sqlInfo.sqlContent}`;
    if (sqlInfo.newCode) {
      newFullPath = `${path.join(SQLsRoot, ...sqlInfo.newCode.split('.'))}.sql`;
    }
    const oldFile = fs.statSync(fullPath, { throwIfNoEntry: false })
    if (newFullPath) {
      const newFle = fs.statSync(newFullPath, { throwIfNoEntry: false })
      if (newFle) {
        sendJSON(res, 400, {
          msg: 'code is existed!'
        })
        return
      } else {
        fs.mkdirSync(path.dirname(newFullPath), { recursive: true })
      }
    }
    if (oldFile) {
      fs.writeFileSync(newFullPath || fullPath, fullContent);
      if (newFullPath) {
        fs.unlinkSync(fullPath);
        // 如果文件夹空了 删除空文件夹
        if (path.dirname(fullPath) !== SQLsRoot) {
          var subEntries = fs.readdirSync(path.dirname(fullPath), { withFileTypes: true });
          if (subEntries.length === 0) {
            fs.rmdirSync(path.dirname(fullPath))
          }
        }
      }
      sendJSON(res, 200, {
        msg: 'success'
      });
    } else {
      sendJSON(res, 400, {
        msg: 'file not existed'
      });
    }
  } else if (stringEqual(url.pathname, '/api/sql/create', false) && stringEqual(req.method, 'post', false)) {
    // 创建Sql文件
    const sqlInfo = req.body;
    const fullPath = `${path.join(SQLsRoot, ...sqlInfo.code.split('.'))}.sql`;
    const oldFile = fs.statSync(fullPath, { throwIfNoEntry: false })
    if (oldFile) {
      sendJSON(res, 400, {
        msg: 'file existed'
      });
    } else {
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true })
      const fullContent = `-- Name: ${sqlInfo.name}\r\n-- Description: ${sqlInfo.description}\r\n${sqlInfo.sqlContent}`;
      fs.writeFileSync(fullPath, fullContent);
      sendJSON(res, 200, {
        msg: 'success'
      });
    }
  } else if (stringEqual(url.pathname, '/api/sql/delete', false) && stringEqual(req.method, 'delete', false)) {
    // 创建Sql文件
    const code = url.searchParams.get('code');
    if (SQLsRoot === process.cwd() && code === 'Example' ) {
      sendJSON(res, 400, {
        msg: 'can not delete example sql file'
      });
      return;
    }
    const fullPath = `${path.join(SQLsRoot, ...code.split('.'))}.sql`;
    const oldFile = fs.statSync(fullPath, { throwIfNoEntry: false });
    if (oldFile) {
      fs.unlinkSync(fullPath)
      // 如果文件夹空了 删除空文件夹
      if (path.dirname(fullPath) !== SQLsRoot) {
        var subEntries = fs.readdirSync(path.dirname(fullPath), { withFileTypes: true });
        if (subEntries.length === 0) {
          fs.rmdirSync(path.dirname(fullPath))
        }
      }
      sendJSON(res, 200, {
        msg: 'success'
      });
    } else {
      sendJSON(res, 404, {
        msg: 'Not Found'
      });
    }
  } else if (stringEqual(url.pathname, '/api/dir/list', false) && stringEqual(req.method, 'get', false)) {
    const dir = url.searchParams.get('dir');
    try {
      const dirs = listDir(dir);
      sendJSON(res, 200, dirs);
    }
    catch (ex) {
      console.error(ex)
      sendJSON(res, 500, {
        msg: `dir list error`
      });
    }
  } else {
    if (url.pathname.startsWith('/api')) {
      sendJSON(res, 404, { msg: 'Not Found' })
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end('Not Found');
    }
  }
})
const PORT = process.env.NODE_ENV === 'production' ? 0 : 3000
server.listen(PORT, () => {
  const address = server.address();
  console.log(`Server running at http://localhost:${address.port}`)
  console.log('if the browser not open automatically, please open it manually.');
  openBrowser(`http://localhost:${address.port}`);
});