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
        // 1. 首先获取 data 目录下的所有文件夹
        const apiUrl = 'https://api.github.com/repos/changfengoss/pub/contents/data';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch directory list: ${response.status}`);
        }

        const directories = await response.json();
        
        // 2. 获取最新的日期文件夹
        const latestDir = directories
          .filter(item => item.type === 'dir')
          .sort((a, b) => b.name.localeCompare(a.name))[0];

        if (!latestDir) {
          throw new Error('No date directories found');
        }

        console.log('Latest directory:', latestDir.name);

        // 3. 获取该文件夹下的所有文件
        const filesResponse = await fetch(latestDir.url);
        if (!filesResponse.ok) {
          throw new Error(`Failed to fetch files: ${filesResponse.status}`);
        }

        const files = await filesResponse.json();
        
        // 4. 过滤并处理节点文件
        const nodeFiles = files.filter(file => {
          const name = file.name.toLowerCase();
          return name.endsWith('.txt') || 
                 name.endsWith('.yaml') || 
                 name.endsWith('.yml');
        });

        const nodes = nodeFiles.map(file => ({
          name: file.name,
          download_url: file.download_url,
          size: file.size,
          updated_at: new Date().toISOString(),
          type: file.name.split('.').pop().toLowerCase(),
          directory: latestDir.name
        }));

        if (nodes.length === 0) {
          throw new Error(`No node files found in directory ${latestDir.name}`);
        }

        console.log(`Found ${nodes.length} nodes in ${latestDir.name}`);
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