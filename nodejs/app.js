const express = require('express');
const fetch = require('node-fetch');
const LRU = require('lru-cache');
const compression = require('compression');
const winston = require('winston');
require('winston-daily-rotate-file');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const app = express();
const port = 5003;

// 外部 JSON 文件的 URL
const CSV_PATHS_URL = 'https://random-api-file.czl.net/url.json';

// 设置缓存
let csvPathsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000 *60 * 24; // 24小时

const csvCache = new LRU({
  max: 100, // 最多缓存100个CSV文件
  maxAge: 1000 * 60 * 60 * 24 // 缓存24小时
});

//日志名称格式
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
// 自定义日志格式
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: `;
  
  if (typeof message === 'object') {
    msg += JSON.stringify(message, null, 2);
  } else {
    msg += message;
  }

  if (metadata.logs) {
    msg += '\n' + metadata.logs.map(log => JSON.stringify(log, null, 2)).join('\n');
  }

  return msg;
});
// 设置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '7d', //日志保存的时间，超过这个时间的会自动删除旧文件
      zippedArchive: false // 禁用压缩
    })
  ]
});

// 日志缓冲
let logBuffer = [];

// 增强的日志中间件
app.use((req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress,
    method: req.method,
    path: req.originalUrl,
    protocol: req.protocol,
    host: req.get('Host'),
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer') || 'N/A',
    accept: req.get('Accept'),
    acceptEncoding: req.get('Accept-Encoding'),
    acceptLanguage: req.get('Accept-Language')
  };

  // 立即输出到控制台
  logger.info(logEntry);

  // 添加到缓冲区，用于每小时写入文件
  logBuffer.push(logEntry);

  next();
});

// 每小时输出一次日志到文件
setInterval(() => {
  if (logBuffer.length > 0) {
    logger.info('Hourly log', { logs: logBuffer });
    logBuffer = [];
  }
}, 60 * 60 * 1000); // 每小时

async function getCsvPaths() {
  const now = Date.now();
  if (!csvPathsCache || now - lastFetchTime > CACHE_DURATION) {
    const response = await fetch(CSV_PATHS_URL);
    if (response.ok) {
      csvPathsCache = await response.json();
      lastFetchTime = now;
    }
  }
  return csvPathsCache;
}

async function getCsvContent(url) {
  if (csvCache.has(url)) {
    return csvCache.get(url);
  }
  const response = await fetch(url);
  if (response.ok) {
    const content = await response.text();
    csvCache.set(url, content);
    return content;
  }
  return null;
}

async function handleRequest(req, res) {
  try {
    const csvPaths = await getCsvPaths();
    if (!csvPaths) {
      return res.status(500).send('CSV paths configuration could not be fetched.');
    }

    let path = req.path.slice(1);
    path = path.split('?')[0];
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    const pathSegments = path.split('/');
    const prefix = pathSegments[0];
    const suffix = pathSegments.slice(1).join('/');

    if (prefix in csvPaths && suffix in csvPaths[prefix]) {
      const csvUrl = csvPaths[prefix][suffix];
      const fileArrayText = await getCsvContent(csvUrl);
      if (fileArrayText) {
        const fileArray = fileArrayText.split('\n').filter(line => Boolean(line) && !line.trim().startsWith('#'));
        const randomUrl = fileArray[Math.floor(Math.random() * fileArray.length)];
        return res.redirect(302, randomUrl);
      } else {
        return res.status(500).send('CSV file could not be fetched.');
      }
    } else {
      const indexHtmlResponse = await fetch('https://random-api-file.czl.net');
      const indexHtml = await indexHtmlResponse.text();
      return res.type('html').send(indexHtml);
    }
  } catch (error) {
    console.error('Error:', error);
    logger.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

// 处理所有路由
app.get('*', handleRequest);

// 使用 cluster 模块
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app.listen(port, () => {
    console.log(`Worker ${process.pid} started on port ${port}`);
  });
}
