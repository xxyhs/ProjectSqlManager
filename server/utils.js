const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, exec } = require('child_process');
/// 判断字符串是否相等
module.exports.stringEqual = (str1, str2, senstive = true) => {
  if (senstive) return str1 === str2
  return (str1 || '').toLocaleLowerCase() === (str2 || '').toLocaleLowerCase()
}

/// return json
function sendJSON (res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

module.exports.sendJSON = sendJSON

// parse request json body
module.exports.parseJsonBody = (req, res) => {
  return new Promise((resolve, reject) => {
    let body = "";
    // collect data chunks
    req.on("data", chunk => {
      body += chunk.toString();
    });

    // finished receiving
    req.on("end", () => {
      try {
        if (body) {
          const json = JSON.parse(body);
          req.body = json
          resolve(true)
        } else {
          req.body = null
          resolve(true)
        }
        
      } catch {
        sendJSON(res, 415, { error: 'body is not a valid json' });
        reject('request body parse failed')
      }
    });
  })
}

function listSqls (dir, rootDir) {
  let result = []
  const nameRegex = /--\s*Name:\s*(.*)/;
  const descriptionRegex = /--\s*Description:\s*(.*)/;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result = result.concat(listSqls(fullPath, dir));
    } else if (entry.isFile() && fullPath.toLowerCase().endsWith(".sql")) {
      let code = fullPath.replaceAll(rootDir || dir, '').replaceAll('.sql', '').replaceAll(path.sep, '.');
      if (code.startsWith('.')) {
        code = code.slice(1)
      }
      const fileStat = fs.statSync(fullPath)
      const rawContent = fs.readFileSync(fullPath, { encoding: 'utf-8' }) || '';
      let sqlContent = ''
      const lines = rawContent.split('\n');
      const nameMatchs = rawContent.match(nameRegex);
      const name = nameMatchs ? nameMatchs[1] : '';
      const descriptionMatchs = rawContent.match(descriptionRegex);
      let description = descriptionMatchs ? descriptionMatchs[1] : null
      lines.forEach(line => {
        if (!line.trim().startsWith('--')) {
          sqlContent += `${line}\n`
        }
      });
      result.push({
        fullPath,
        code,
        createTime: fileStat.ctimeMs,
        lastModifyTime: fileStat.mtimeMs,
        name,
        description,
        rawContent,
        sqlContent: sqlContent.trimEnd()
      });
    }
  }
  return result;
}

function getDrives() {
  const platform = os.platform();

  if (platform === "win32") {
    // Windows: 遍历 A-Z
    const drives = [];
    for (let i = 65; i <= 90; i++) {
      const drive = String.fromCharCode(i) + ":\\";
      if (fs.existsSync(drive)) {
        drives.push(drive);
      }
    }
    return drives;
  } else if (platform === "linux") {
    // Linux: 读取 /proc/mounts
    const mounts = fs.readFileSync("/proc/mounts", "utf8")
      .split("\n")
      .map(line => line.split(" ")[1])
      .filter(Boolean);
    return [...new Set(mounts)];
  } else if (platform === "darwin") {
    // macOS: df -Hl 获取挂载点
    const output = execSync("df -Hl", { encoding: "utf8" });
    const lines = output.split("\n").slice(1);
    const mounts = lines
      .map(line => line.trim().split(/\s+/).pop())
      .filter(Boolean);
    return [...new Set(mounts)];
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

function safeReadDir(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    if (err.code === "EACCES" || err.code === "EPERM") {
      // 没权限，返回空数组
      return [];
    }
    throw err; // 其他错误继续抛出
  }
}

function listDir (dir) {
  if (!dir) {
    return getDrives().map(t => ({
      name: t,
      fullPath: t,
      hasChildren: safeReadDir(t).some(s => s.isDirectory())
    }))
  }
  const entries = safeReadDir(dir, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory())
    .map(entry => {
      const fullPath = path.join(dir, entry.name)
      return {
        name: entry.name,
        fullPath,
        hasChildren: safeReadDir(fullPath).some(s => s.isDirectory())
      }
    });
}
module.exports.listDir = listDir;

/// 遍历文件夹
module.exports.listSqls = listSqls;

/// 常见mime
module.exports.mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

module.exports.openBrowser = (url) => {
  let cmd = '';
  switch (process.platform) {
    case 'win32':
      cmd = `start ${url}`;
      break;
    case 'darwin':
      cmd = `open ${url}`;
      break;
    case 'linux':
      cmd = `xdg-open ${url}`;
      break;
    default:
      console.error('Unsupported platform');
      process.exit(1);
  }
  exec(cmd, (err) => {
    if (err) {
      console.error(`Failed to auto open browser with url: ${url}`, err);
    }
  });
}