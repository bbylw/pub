export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
    };

    if (url.pathname === '/api/nodes') {
      try {
        // 获取最新日期目录
        const apiUrl = 'https://api.github.com/repos/changfengoss/pub/contents/data';
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // 获取最新的日期目录
        const latestDir = data
          .filter(item => item.type === 'dir')
          .sort((a, b) => b.name.localeCompare(a.name))[0];

        // 获取该目录下的所有文件
        const filesResponse = await fetch(latestDir.url);
        const files = await filesResponse.json();

        // 过滤出所有的节点文件（通常是yaml或txt格式）
        const nodeFiles = files.filter(file => 
          file.name.endsWith('.yaml') || 
          file.name.endsWith('.txt') ||
          file.name.endsWith('.yml')
        );

        // 获取每个文件的实际内容
        const nodePromises = nodeFiles.map(async file => {
          const contentResponse = await fetch(file.download_url);
          const content = await contentResponse.text();
          return {
            name: file.name,
            download_url: file.download_url,
            content: content
          };
        });

        const nodes = await Promise.all(nodePromises);
        return new Response(JSON.stringify(nodes), { headers });
      } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: '获取节点失败', details: error.message }), { 
          status: 500,
          headers 
        });
      }
    }

    // 提供一个简单的HTML页面作为根路径响应
    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>节点查看器</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-100">
            <div class="container mx-auto px-4 py-8">
              <h1 class="text-3xl font-bold mb-8">实时节点列表</h1>
              <div id="nodeList" class="grid gap-4"></div>
            </div>
            <script>
              async function fetchNodes() {
                try {
                  const response = await fetch('/api/nodes');
                  const data = await response.json();
                  displayNodes(data);
                } catch (error) {
                  console.error('获取节点失败:', error);
                }
              }

              function displayNodes(nodes) {
                const nodeList = document.getElementById('nodeList');
                nodeList.innerHTML = '';
                nodes.forEach(node => {
                  const card = document.createElement('div');
                  card.className = 'bg-white p-4 rounded-lg shadow';
                  card.innerHTML = \`
                    <h3 class="font-bold">\${node.name}</h3>
                    <a href="\${node.download_url}" 
                       class="text-blue-500 hover:text-blue-700">
                       下载配置
                    </a>
                  \`;
                  nodeList.appendChild(card);
                });
              }

              document.addEventListener('DOMContentLoaded', fetchNodes);
              setInterval(fetchNodes, 5 * 60 * 1000);
            </script>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}; 