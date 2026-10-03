// 主应用逻辑

// 渲染书籍列表（用于books.html）
function renderBooks() {
    const categories = [
        { id: 'beginner', title: '🌱 入门启蒙（新手必读）' },
        { id: 'value', title: '💎 价值投资（经典必看）' },
        { id: 'advanced', title: '📚 进阶提升（深入学习）' },
        { id: 'mindset', title: '🧠 投资心理（修炼内功）' }
    ];
    
    const container = document.getElementById('booksContainer');
    if (!container) return;
    
    let html = '';
    
    for (const cat of categories) {
        const books = bookData[cat.id];
        if (!books || books.length === 0) continue;
        
        html += `
            <div class="book-category">
                <h2>${cat.title}</h2>
                <div class="book-grid">
        `;
        
        for (const book of books) {
            html += `
                <div class="book-card">
                    <div class="book-header">
                        <div class="book-cover">${book.cover}</div>
                        <div class="book-info">
                            <h3>${book.title}</h3>
                            <div class="book-author">${book.author}</div>
                            <div class="book-rating">⭐ ${book.rating}</div>
                        </div>
                    </div>
                    <p class="book-desc">${book.desc}</p>
                    <div class="book-tags">
                        ${book.tags.map(tag => `<span class="book-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 初始化API配置页面
function initApiPage() {
    const configForm = document.getElementById('apiConfigForm');
    if (!configForm) return;
    
    // 加载已保存的配置
    const saved = localStorage.getItem('investApiConfig');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            document.getElementById('apiProvider').value = config.provider || '';
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('apiUrl').value = config.apiUrl || '';
            document.getElementById('apiModel').value = config.model || '';
            document.getElementById('apiEnabled').checked = config.enabled || false;
            
            toggleCustomUrl(config.provider);
        } catch (e) {
            console.error('加载配置失败', e);
        }
    }
    
    // 服务商切换
    document.getElementById('apiProvider').addEventListener('change', function() {
        toggleCustomUrl(this.value);
    });
    
    // 保存配置
    configForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const config = {
            enabled: document.getElementById('apiEnabled').checked,
            provider: document.getElementById('apiProvider').value,
            apiKey: document.getElementById('apiKey').value,
            apiUrl: document.getElementById('apiUrl').value,
            model: document.getElementById('apiModel').value
        };
        
        saveApiConfig(config);
        
        // 显示成功提示
        const statusMsg = document.getElementById('statusMessage');
        statusMsg.textContent = '✅ 配置已保存！返回对话页面即可使用AI回答。';
        statusMsg.className = 'status-msg success';
        
        setTimeout(() => {
            statusMsg.className = 'status-msg';
        }, 3000);
    });
    
    // 测试连接
    document.getElementById('testConnection').addEventListener('click', async function() {
        const statusMsg = document.getElementById('statusMessage');
        statusMsg.textContent = '⏳ 正在测试连接...';
        statusMsg.className = 'status-msg';
        statusMsg.style.display = 'block';
        statusMsg.style.background = '#f1f5f9';
        statusMsg.style.color = '#475569';
        
        const config = {
            enabled: true,
            provider: document.getElementById('apiProvider').value,
            apiKey: document.getElementById('apiKey').value,
            apiUrl: document.getElementById('apiUrl').value,
            model: document.getElementById('apiModel').value
        };
        
        // 临时使用这个配置测试
        const tempConfig = { ...apiConfig };
        Object.assign(apiConfig, config);
        
        try {
            const testResult = await callOpenAiCompatible('你好，请回复"连接成功"四个字。');
            statusMsg.textContent = '✅ 连接成功！API配置正常。';
            statusMsg.className = 'status-msg success';
        } catch (error) {
            statusMsg.textContent = '❌ 连接失败：' + error.message;
            statusMsg.className = 'status-msg error';
        }
        
        // 恢复原配置
        Object.assign(apiConfig, tempConfig);
    });
}

function toggleCustomUrl(provider) {
    const customUrlGroup = document.getElementById('customUrlGroup');
    if (!customUrlGroup) return;
    
    // 预设服务商的默认URL和推荐模型
    const defaultConfigs = {
        openai: {
            url: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o-mini'
        },
        deepseek: {
            url: 'https://api.deepseek.com/v1/chat/completions',
            model: 'deepseek-chat'
        },
        zhipu: {
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4-flash'
        },
        qwen: {
            url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            model: 'qwen-turbo'
        },
        moonshot: {
            url: 'https://api.moonshot.cn/v1/chat/completions',
            model: 'moonshot-v1-8k'
        },
        siliconflow: {
            url: 'https://api.siliconflow.cn/v1/chat/completions',
            model: 'Qwen/Qwen2.5-7B-Instruct'
        },
        doubao: {
            url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            model: 'doubao-lite-4k'
        }
    };
    
    if (provider === 'custom') {
        customUrlGroup.style.display = 'block';
    } else {
        customUrlGroup.style.display = 'none';
        if (defaultConfigs[provider]) {
            document.getElementById('apiUrl').value = defaultConfigs[provider].url;
            // 如果模型输入框是空的，自动填入推荐模型
            if (!document.getElementById('apiModel').value) {
                document.getElementById('apiModel').value = defaultConfigs[provider].model;
            }
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    renderBooks();
    initApiPage();
});
