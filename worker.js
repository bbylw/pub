export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // 缓存5分钟
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

        // 获取该目录下的节点文件
        const nodesResponse = await fetch(latestDir.url);
        const nodesData = await nodesResponse.json();
        
        return new Response(JSON.stringify(nodesData), { headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: '获取节点失败' }), { 
          status: 500,
          headers 
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}; 