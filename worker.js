export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>节点工具导航 - Nodes Hub</title>
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
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
                font-size: 1.2rem;
                font-weight: bold;
                color: #f90;
              }
              .card-body {
                padding: 1rem;
              }
              .card-description {
                color: #ccc;
                margin-bottom: 1rem;
                line-height: 1.5;
                min-height: 4.5rem;
              }
              .card-link {
                display: inline-block;
                background-color: #f90;
                color: #000000;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 0.3rem;
                font-weight: bold;
                transition: background-color 0.2s;
              }
              .card-link:hover {
                background-color: #ff8c00;
              }
              .tag {
                display: inline-block;
                background-color: #444;
                color: #fff;
                padding: 0.2rem 0.5rem;
                border-radius: 0.2rem;
                font-size: 0.8rem;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
              }
            </style>
          </head>
          <body>
            <header class="header">
              <a href="/" class="logo">Nodes Hub</a>
            </header>
            <div class="container">
              <div class="grid">
                <div class="card">
                  <div class="card-header">节点仓库</div>
                  <div class="card-body">
                    <p class="card-description">
                      每日更新的节点仓库，包含多种格式的配置文件。
                    </p>
                    <a href="https://github.com/changfengoss/pub/tree/main/data" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      访问仓库
                    </a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">v2rayN</div>
                  <div class="card-body">
                    <p class="card-description">
                      强大的 Windows 平台代理工具，支持多种协议和订阅，界面友好，功能丰富。
                    </p>
                    <span class="tag">Windows</span>
                    <a href="https://github.com/2dust/v2rayN" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      下载地址
                    </a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">Hiddify</div>
                  <div class="card-body">
                    <p class="card-description">
                      多平台通用的代理客户端，支持多种协议，界面美观，使用简单。自动更新，智能分流。
                    </p>
                    <span class="tag">全平台</span>
                    <a href="https://github.com/hiddify/hiddify-next" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      项目主页
                    </a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">Karing</div>
                  <div class="card-body">
                    <p class="card-description">
                      基于 sing-box 内核的代理客户端，支持多种协议和订阅，界面美观，功能丰富。支持 iCloud 同步。
                    </p>
                    <span class="tag">全平台</span>
                    <a href="https://github.com/KaringX/karing" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      项目主页
                    </a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">FClash</div>
                  <div class="card-body">
                    <p class="card-description">
                      基于 ClashMeta 的多平台代理客户端，开源无广告，界面简洁，使用方便。支持 WebDAV 同步。
                    </p>
                    <span class="tag">全平台</span>
                    <a href="https://github.com/chen08209/FlClash" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      项目主页
                    </a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">Clash Verge</div>
                  <div class="card-body">
                    <p class="card-description">
                      基于 Tauri 的现代化 Clash 图形客户端，界面美观，性能优秀。
                    </p>
                    <span class="tag">全平台</span>
                    <a href="https://github.com/zzzgydi/clash-verge" 
                       class="card-link" 
                       target="_blank"
                       rel="noopener noreferrer">
                      下载地址
                    </a>
                  </div>
                </div>
              </div>
            </div>
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