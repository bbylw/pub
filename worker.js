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
        // 首先获取主页面内容来找到最新的日期目录
        const mainPageResponse = await fetch('https://github.com/changfengoss/pub/tree/main/data');
        if (!mainPageResponse.ok) {
          throw new Error('Failed to fetch main page');
        }
        
        const html = await mainPageResponse.text();
        
        // 从HTML中提取日期目录
        const dateMatch = html.match(/href="\/changfengoss\/pub\/tree\/main\/data\/(202\d_\d{2}_\d{2})"/);
        if (!dateMatch) {
          throw new Error('No date directory found');
        }
        
        const latestDate = dateMatch[1];
        const baseUrl = `https://raw.githubusercontent.com/changfengoss/pub/main/data/${latestDate}`;
        
        // 尝试获取不同类型的节点文件
        const fileTypes = [
          'clash',
          'all',
          'ss',
          'ssr',
          'v2ray',
          'trojan'
        ];
        
        const nodes = [];
        
        // 对每种类型尝试不同的文件扩展名
        for (const type of fileTypes) {
          for (const ext of ['.yml', '.yaml', '.txt']) {
            const fileName = `${type}${ext}`;
            const fileUrl = `${baseUrl}/${fileName}`;
            
            try {
              // 使用 HEAD 请求检查文件是否存在
              const checkResponse = await fetch(fileUrl, { method: 'HEAD' });
              if (checkResponse.ok) {
                nodes.push({
                  name: fileName,
                  download_url: fileUrl,
                  size: parseInt(checkResponse.headers.get('content-length') || '0'),
                  updated_at: new Date().toISOString(),
                  type: type,
                  directory: latestDate
                });
              }
            } catch (e) {
              console.error(`Error checking ${fileName}:`, e);
            }
          }
        }

        if (nodes.length === 0) {
          throw new Error(`No node files found in directory ${latestDate}`);
        }

        console.log(`Found ${nodes.length} nodes in ${latestDate}`);
        return new Response(JSON.stringify(nodes), { headers });

      } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ 
          error: '获取节点失败', 
          details: error.message,
          timestamp: new Date().toISOString()
        }), { 
          status: 500,
          headers 
        });
      }
    }

    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>节点列表 - 高速节点</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                background-color: #1b1b1b;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
              }
              .header {
                background-color: #000000;
                padding: 1rem;
                position: fixed;
                width: 100%;
                top: 0;
                z-index: 100;
              }
              .logo {
                color: #ffffff;
                font-size: 2rem;
                font-weight: bold;
                text-decoration: none;
                background-color: #f90;
                padding: 0.3rem 0.6rem;
                border-radius: 0.3rem;
              }
              .container {
                max-width: 1200px;
                margin: 6rem auto 2rem;
                padding: 0 1rem;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.5rem;
              }
              .card {
                background-color: #2b2b2b;
                border-radius: 0.5rem;
                overflow: hidden;
                transition: transform 0.2s;
              }
              .card:hover {
                transform: translateY(-5px);
              }
              .card-header {
                background-color: #000000;
                padding: 1rem;
                font-size: 1.1rem;
              }
              .card-body {
                padding: 1rem;
              }
              .stats {
                display: flex;
                justify-content: space-between;
                color: #999;
                font-size: 0.9rem;
                margin-bottom: 1rem;
              }
              .download-btn {
                background-color: #f90;
                color: #000000;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 0.3rem;
                display: block;
                text-align: center;
                font-weight: bold;
                transition: background-color 0.2s;
              }
              .download-btn:hover {
                background-color: #ff8c00;
              }
              .loading {
                text-align: center;
                padding: 2rem;
                font-size: 1.2rem;
                color: #f90;
              }
            </style>
          </head>
          <body>
            <header class="header">
              <a href="/" class="logo">Nodes Hub</a>
            </header>
            <div class="container">
              <div id="nodeList" class="grid">
                <div class="loading">加载中...</div>
              </div>
            </div>
            <script>
              async function fetchNodes() {
                try {
                  const response = await fetch('/api/nodes');
                  if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                  }
                  const data = await response.json();
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  displayNodes(data);
                } catch (error) {
                  console.error('获取节点失败:', error);
                  document.getElementById('nodeList').innerHTML = 
                    '<div class="loading">获取节点失败: ' + error.message + '<br>请稍后重试</div>';
                }
              }

              function displayNodes(nodes) {
                const nodeList = document.getElementById('nodeList');
                if (!nodes || !nodes.length) {
                  nodeList.innerHTML = '<div class="loading">暂无可用节点</div>';
                  return;
                }
                
                nodeList.innerHTML = nodes.map(node => {
                  const date = new Date(node.updated_at).toLocaleString();
                  const size = (node.size / 1024).toFixed(1) + ' KB';
                  return \`
                    <div class="card">
                      <div class="card-header">\${node.name}</div>
                      <div class="card-body">
                        <div class="stats">
                          <span>大小: \${size}</span>
                          <span>目录: \${node.directory}</span>
                        </div>
                        <a href="\${node.download_url}" 
                           class="download-btn" 
                           target="_blank"
                           rel="noopener noreferrer">
                          下载配置
                        </a>
                      </div>
                    </div>
                  \`;
                }).join('');
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