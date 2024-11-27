async function fetchNodes() {
    try {
        const response = await fetch('你的CF Workers域名/api/nodes');
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
        card.innerHTML = `
            <h3 class="font-bold">${node.name}</h3>
            <p class="text-gray-600">${node.type}</p>
            <a href="${node.download_url}" 
               class="text-blue-500 hover:text-blue-700">
               下载配置
            </a>
        `;
        nodeList.appendChild(card);
    });
}

// 页面加载时获取节点
document.addEventListener('DOMContentLoaded', fetchNodes);

// 每5分钟刷新一次
setInterval(fetchNodes, 5 * 60 * 1000); 