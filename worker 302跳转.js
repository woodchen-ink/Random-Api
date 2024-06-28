// 外部 JSON 文件的 URL
const CSV_PATHS_URL = 'https://random-api-file.czl.net/url.json';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * 处理客户端请求，并根据请求的URL路径获取对应的CSV文件中的随机一行的URL，然后重定向到该URL。
 * 
 * @param {Request} request 客户端发起的请求对象。
 * @returns {Response} 根据不同的情况返回不同的响应对象。如果能够成功获取CSV路径配置且请求的路径在配置中找到对应的CSV文件，
 *                      则重定向到该CSV文件中随机一行的URL；如果CSV路径配置无法获取或请求的路径未在配置中找到，
 *                      则返回相应的错误页面或默认首页。
 */
async function handleRequest(request) {
  // 从CSV_PATHS_URL获取CSV文件路径配置
  const csvPathsResponse = await fetch(CSV_PATHS_URL);
  // 配置获取失败时，返回500错误响应
  if (!csvPathsResponse.ok) {
    return new Response('CSV paths configuration could not be fetched.', { status: 500 });
  }
  // 将配置响应体解析为JSON对象
  const csvPaths = await csvPathsResponse.json();

  // 解析请求的URL路径
  const url = new URL(request.url);
  let path = url.pathname.slice(1); // 移除路径前的斜杠
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
    // 文件内容获取失败时，返回500错误响应
    if (fileArrayResponse.ok) {
      // 处理CSV文件内容，过滤空行和注释行
      const fileArrayText = await fileArrayResponse.text();
      const fileArray = fileArrayText.split('\n').filter(line => Boolean(line) && !line.trim().startsWith('#'));

      // 随机选择一行URL进行重定向
      const randomIndex = Math.floor(Math.random() * fileArray.length);
      const randomUrl = fileArray[randomIndex];

      return Response.redirect(randomUrl, 302);
    } else {
      return new Response('CSV file could not be fetched.', { status: 500 });
    }
  } else {
    // 请求路径不在配置中，返回默认首页
    const indexHtmlResponse = await fetch('https://random-api-file.czl.net');
    return new Response(indexHtmlResponse.body, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

