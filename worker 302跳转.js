// 外部 JSON 文件的 URL
const CSV_PATHS_URL = 'https://random-api.pages.dev/url.json';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 处理请求
async function handleRequest(request) {
  const csvPathsResponse = await fetch(CSV_PATHS_URL);
  if (!csvPathsResponse.ok) {
    return new Response('CSV paths configuration could not be fetched.', { status: 500 });
  }
  const csvPaths = await csvPathsResponse.json();

  const url = new URL(request.url);
  let path = url.pathname.slice(1); // 移除路径前的斜杠
  path = path.split('?')[0]; // 移除问号后的部分
  if (path.endsWith('/')) {
    path = path.slice(0, -1); // 移除路径后的斜杠
  }

  // 分割路径得到前缀和后缀
  const pathSegments = path.split('/');
  const prefix = pathSegments[0];
  const suffix = pathSegments.slice(1).join('/');

  // 如果路径是 CSV 资源路径
  if (prefix in csvPaths && suffix in csvPaths[prefix]) {
    const csvUrl = csvPaths[prefix][suffix];
    const fileArrayResponse = await fetch(csvUrl);
    if (fileArrayResponse.ok) {
      const fileArrayText = await fileArrayResponse.text();
      const fileArray = fileArrayText.split('\n').filter(Boolean); // 过滤掉空行

      const randomIndex = Math.floor(Math.random() * fileArray.length);
      const randomUrl = fileArray[randomIndex];

      // 返回302重定向到randomUrl,1更快，2方便排查
      return Response.redirect(randomUrl, 302);
    } else {
      return new Response('CSV file could not be fetched.', { status: 500 });
    }
  } else {
    // 如果不是 CSV 资源路径，返回 index.html 内容
    const indexHtmlResponse = await fetch('https://random-api.pages.dev');
    return new Response(indexHtmlResponse.body, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
