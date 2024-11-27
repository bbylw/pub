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
        // 获取今天的日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // 尝试今天和昨天的日期
        const dates = [
          `${year}_${month}_${day}`,
          `${year}_${month}_${String(today.getDate() - 1).padStart(2, '0')}`
        ];

        const possibleFiles = [
          'clash.yaml',
          'clash.txt',
          'all.yaml',
          'all.txt',
          'v2ray.txt',
          'v2ray.yaml'
        ];

        let nodes = [];

        // 遍历日期和可能的文件
        for (const date of dates) {
          for (const file of possibleFiles) {
            const fileUrl = `https://raw.githubusercontent.com/changfengoss/pub/main/data/${date}/${file}`;
            try {
              const response = await fetch(fileUrl, { method: 'HEAD' });
              if (response.ok) {
                nodes.push({
                  name: file,
                  download_url: fileUrl,
                  size: response.headers.get('content-length') || 0,
                  updated_at: new Date().toISOString(),
                  type: file.split('.').pop().toLowerCase(),
                  directory: date
                });
              }
            } catch (e) {
              console.error(`Error checking ${fileUrl}:`, e);
            }
          }
          
          // 如果在当前日期找到了节点，就不继续查找了
          if (nodes.length > 0) {
            break;
          }
        }

        if (nodes.length === 0) {
          throw new Error('No available nodes found');
        }

        console.log(`Found ${nodes.length} nodes`);
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