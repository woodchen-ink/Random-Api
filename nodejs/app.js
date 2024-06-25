const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 5003;

// 外部 JSON 文件的 URL
const CSV_PATHS_URL = 'https://random-api.pages.dev/url.json';

/**
 * 处理客户端请求，并根据请求的URL路径获取对应的CSV文件中的随机一行的URL，然后重定向到该URL。
 */
async function handleRequest(req, res) {
  try {
    // 从CSV_PATHS_URL获取CSV文件路径配置
    const csvPathsResponse = await fetch(CSV_PATHS_URL);
    if (!csvPathsResponse.ok) {
      return res.status(500).send('CSV paths configuration could not be fetched.');
    }
    const csvPaths = await csvPathsResponse.json();

    // 解析请求的URL路径
    let path = req.path.slice(1); // 移除路径前的斜杠
    path = path.split('?')[0]; // 移除问号后的部分
    if (path.endsWith('/')) {
      path = path.slice(0, -1); // 移除路径后的斜杠
    }

    // 分割路径为前缀和后缀
    const pathSegments = path.split('/');
    const prefix = pathSegments[0];
    const suffix = pathSegments.slice(1).join('/');

    // 检查请求路径是否在CSV路径配置中
    if (prefix in csvPaths && suffix in csvPaths[prefix]) {
      // 根据配置获取对应的CSV文件URL
      const csvUrl = csvPaths[prefix][suffix];
      // 从CSV文件URL获取文件内容
      const fileArrayResponse = await fetch(csvUrl);
      if (fileArrayResponse.ok) {
        // 处理CSV文件内容，过滤空行和注释行
        const fileArrayText = await fileArrayResponse.text();
        const fileArray = fileArrayText.split('\n').filter(line => Boolean(line) && !line.trim().startsWith('#'));

        // 随机选择一行URL进行重定向
        const randomIndex = Math.floor(Math.random() * fileArray.length);
        const randomUrl = fileArray[randomIndex];

        return res.redirect(302, randomUrl);
      } else {
        return res.status(500).send('CSV file could not be fetched.');
      }
    } else {
      // 请求路径不在配置中，返回默认首页
      const indexHtmlResponse = await fetch('https://random-api.pages.dev');
      const indexHtml = await indexHtmlResponse.text();
      return res.type('html').send(indexHtml);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

// 处理所有路由
app.get('*', handleRequest);

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
