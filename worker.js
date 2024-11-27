export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理转换请求
    if (url.pathname === '/convert') {
      try {
        const { input, format } = await request.json();
        const result = await convertNodes(input, format);
        return new Response(JSON.stringify({ result }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>节点转换器 - Nodes Hub</title>
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
                display: flex;
                justify-content: space-between;
                align-items: center;
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
              .input-group {
                background-color: #2b2b2b;
                padding: 2rem;
                border-radius: 0.5rem;
                margin-bottom: 2rem;
              }
              .input-label {
                display: block;
                margin-bottom: 0.5rem;
                color: #f90;
                font-weight: bold;
              }
              .input-field {
                width: 100%;
                padding: 0.8rem;
                background-color: #1b1b1b;
                border: 1px solid #f90;
                border-radius: 0.3rem;
                color: #ffffff;
                margin-bottom: 1rem;
              }
              .convert-btn {
                background-color: #f90;
                color: #000000;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 0.3rem;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .convert-btn:hover {
                background-color: #ff8c00;
              }
              .result {
                background-color: #2b2b2b;
                padding: 1rem;
                border-radius: 0.5rem;
                white-space: pre-wrap;
                display: none;
              }
              .github-link {
                color: #f90;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border: 1px solid #f90;
                border-radius: 0.3rem;
                transition: all 0.2s;
              }
              .github-link:hover {
                background-color: #f90;
                color: #000000;
              }
              .format-select {
                padding: 0.8rem;
                background-color: #1b1b1b;
                border: 1px solid #f90;
                border-radius: 0.3rem;
                color: #ffffff;
                margin-bottom: 1rem;
                width: 100%;
              }
              .format-select option {
                background-color: #1b1b1b;
                color: #ffffff;
              }
            </style>
          </head>
          <body>
            <header class="header">
              <a href="/" class="logo">Nodes Hub</a>
              <a href="https://github.com/changfengoss/pub/tree/main/data" 
                 class="github-link" 
                 target="_blank"
                 rel="noopener noreferrer">
                获取最新节点
              </a>
            </header>
            <div class="container">
              <div class="input-group">
                <label class="input-label">节点内容转换</label>
                <textarea id="input" 
                          class="input-field" 
                          rows="10" 
                          placeholder="请粘贴节点内容..."></textarea>
                <select id="format" class="format-select">
                  <option value="clash">Clash</option>
                  <option value="v2ray">V2Ray</option>
                  <option value="ss">Shadowsocks</option>
                  <option value="ssr">ShadowsocksR</option>
                  <option value="trojan">Trojan</option>
                </select>
                <button onclick="convertFormat()" class="convert-btn">转换格式</button>
              </div>
              <pre id="result" class="result"></pre>
            </div>
            <script>
              // Base64 编码/解码函数
              function base64Decode(str) {
                return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
              }

              function base64Encode(str) {
                return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
              }

              // 解析 URL 编码的参数
              function parseQueryString(url) {
                const params = {};
                const searchParams = new URLSearchParams(url.split('?')[1]);
                for (const [key, value] of searchParams) {
                  params[key] = decodeURIComponent(value);
                }
                return params;
              }

              // 解析不同格式的节点
              function parseNode(input) {
                const nodes = [];
                const lines = input.split('\\n').filter(line => line.trim());

                for (const line of lines) {
                  try {
                    if (line.startsWith('ss://')) {
                      // 解析 SS 节点
                      const url = new URL(line);
                      const base64 = url.username + (url.password ? ':' + url.password : '');
                      const decoded = base64Decode(base64);
                      const [method, password] = decoded.split(':');
                      nodes.push({
                        type: 'ss',
                        server: url.hostname,
                        port: url.port,
                        method,
                        password,
                        name: decodeURIComponent(url.hash.slice(1))
                      });
                    } else if (line.startsWith('vmess://')) {
                      // 解析 V2Ray 节点
                      const json = JSON.parse(base64Decode(line.slice(8)));
                      nodes.push({
                        type: 'vmess',
                        server: json.add,
                        port: json.port,
                        uuid: json.id,
                        alterId: json.aid,
                        network: json.net,
                        name: json.ps
                      });
                    }
                    // 可以添加更多格式的解析
                  } catch (e) {
                    console.error('Failed to parse node:', line, e);
                  }
                }
                return nodes;
              }

              // 转换为不同格式
              function convertToFormat(nodes, format) {
                switch (format) {
                  case 'clash':
                    return generateClashConfig(nodes);
                  case 'v2ray':
                    return generateV2RayConfig(nodes);
                  // 可以添加更多格式的转换
                  default:
                    throw new Error('不支持的格式');
                }
              }

              // 生成 Clash 配置
              function generateClashConfig(nodes) {
                const config = {
                  port: 7890,
                  'socks-port': 7891,
                  'allow-lan': true,
                  mode: 'Rule',
                  'log-level': 'info',
                  proxies: nodes.map(node => {
                    if (node.type === 'ss') {
                      return {
                        name: node.name,
                        type: 'ss',
                        server: node.server,
                        port: node.port,
                        cipher: node.method,
                        password: node.password
                      };
                    } else if (node.type === 'vmess') {
                      return {
                        name: node.name,
                        type: 'vmess',
                        server: node.server,
                        port: node.port,
                        uuid: node.uuid,
                        alterId: node.alterId,
                        network: node.network
                      };
                    }
                  })
                };
                return JSON.stringify(config, null, 2);
              }

              // 生成 V2Ray 配置
              function generateV2RayConfig(nodes) {
                const config = {
                  outbounds: nodes.map(node => {
                    if (node.type === 'vmess') {
                      return {
                        protocol: 'vmess',
                        settings: {
                          vnext: [{
                            address: node.server,
                            port: node.port,
                            users: [{
                              id: node.uuid,
                              alterId: node.alterId
                            }]
                          }]
                        },
                        tag: node.name
                      };
                    }
                  }).filter(Boolean)
                };
                return JSON.stringify(config, null, 2);
              }

              async function convertFormat() {
                const input = document.getElementById('input').value;
                const format = document.getElementById('format').value;
                const result = document.getElementById('result');
                
                if (!input.trim()) {
                  alert('请输入节点内容');
                  return;
                }

                try {
                  const nodes = parseNode(input);
                  if (nodes.length === 0) {
                    throw new Error('未能识别任何有效节点');
                  }
                  const converted = convertToFormat(nodes, format);
                  result.textContent = converted;
                  result.style.display = 'block';
                } catch (error) {
                  alert('转换失败: ' + error.message);
                }
              }
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