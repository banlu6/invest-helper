// 对话逻辑
let currentTopic = 'all';
let apiConfig = {
    enabled: false,
    provider: '',
    apiKey: '',
    apiUrl: '',
    model: ''
};

// 从localStorage加载API配置
function loadApiConfig() {
    const saved = localStorage.getItem('investApiConfig');
    if (saved) {
        try {
            apiConfig = JSON.parse(saved);
        } catch (e) {
            console.error('加载API配置失败', e);
        }
    }
}

// 保存API配置到localStorage
function saveApiConfig(config) {
    apiConfig = config;
    localStorage.setItem('investApiConfig', JSON.stringify(config));
}

// 发送消息
function sendMessage(customText) {
    const input = document.getElementById('chatInput');
    const text = customText || input.value.trim();
    
    if (!text) return;
    
    // 隐藏欢迎界面，显示消息容器
    const welcome = document.getElementById('welcomeScreen');
    const messages = document.getElementById('messagesContainer');
    const chatArea = document.getElementById('chatArea');
    
    if (welcome) welcome.style.display = 'none';
    if (messages) messages.style.display = 'flex';
    
    // 添加用户消息
    addMessage(text, 'user');
    
    // 清空输入框
    input.value = '';
    input.style.height = 'auto';
    
    // 显示"正在思考"
    const thinkingId = addThinking();
    
    // 延迟模拟思考过程
    setTimeout(() => {
        removeThinking(thinkingId);
        
        // 如果启用了API，调用外部API
        if (apiConfig.enabled && apiConfig.apiKey) {
            callExternalApi(text);
        } else {
            // 使用本地知识库
            const answer = findAnswer(text);
            addMessage(answer, 'bot');
        }
    }, 600 + Math.random() * 600);
    
    // 滚动到底部
    if (chatArea) {
        setTimeout(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 100);
    }
}

// 添加消息到聊天界面
function addMessage(content, type) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${type}-message`;
    
    const avatar = type === 'bot' ? '📈' : '👤';
    
    wrapper.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-bubble">${content}</div>
    `;
    
    messagesContainer.appendChild(wrapper);
    
    // 滚动到底部
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

// 添加"正在思考"提示
function addThinking() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return '';
    
    const id = 'thinking-' + Date.now();
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper bot-message';
    wrapper.id = id;
    wrapper.innerHTML = `
        <div class="message-avatar">📈</div>
        <div class="message-bubble">
            <span class="thinking-dots"><span></span><span></span><span></span></span>
        </div>
    `;
    messagesContainer.appendChild(wrapper);
    
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    return id;
}

// 移除"正在思考"提示
function removeThinking(id) {
    const thinking = document.getElementById(id);
    if (thinking) {
        thinking.remove();
    }
}

// 在知识库中查找答案
function findAnswer(question) {
    const q = question.toLowerCase().trim();
    
    // 根据当前主题确定搜索范围
    let searchCategories = [];
    if (currentTopic === 'all') {
        searchCategories = ['fund', 'stock', 'bond', 'mindset', 'strategy', 'general'];
    } else {
        searchCategories = [currentTopic, 'general'];
    }
    
    // 遍历所有分类找匹配
    let bestMatch = null;
    let bestScore = 0;
    
    for (const category of searchCategories) {
        const items = knowledgeBase[category];
        if (!items) continue;
        
        for (const item of items) {
            let score = 0;
            for (const keyword of item.keywords) {
                const kw = keyword.toLowerCase();
                // 完全匹配得分最高
                if (q === kw) {
                    score += 100;
                }
                // 包含关键词
                else if (q.includes(kw)) {
                    score += kw.length;
                }
                // 部分匹配
                else if (kw.includes(q) && q.length > 2) {
                    score += q.length * 0.5;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item.answer;
            }
        }
    }
    
    // 如果找到了足够匹配的答案
    if (bestScore > 3) {
        return bestMatch;
    }
    
    // 如果没找到，返回默认回复
    return getDefaultReply(question);
}

// 默认回复
function getDefaultReply(question) {
    return `
        <p>这个问题我需要再学习一下 📚</p>
        <p>关于 "<strong>${question}</strong>"，目前我的知识库中还没有详细的内容。</p>
        <p>你可以试试问我这些问题：</p>
        <p>• 什么是指数基金？</p>
        <p>• 价值投资是什么意思？</p>
        <p>• 定投有什么好处？</p>
        <p>• 股票和债券有什么区别？</p>
        <p>💡 你也可以在「AI 设置」中配置大模型API，就能问更多问题啦！</p>
    `;
}

// 处理输入框按键
function handleInputKeydown(event) {
    // Enter 发送，Shift+Enter 换行
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// 切换主题
function setTopic(topic) {
    currentTopic = topic;
    
    // 更新侧边栏按钮状态
    document.querySelectorAll('.topic-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.topic === topic) {
            btn.classList.add('active');
        }
    });
    
    // 更新顶部栏显示
    const topicNames = {
        all: '全部知识',
        fund: '基金入门',
        stock: '股票入门',
        bond: '债券入门',
        mindset: '投资心态',
        strategy: '投资策略'
    };
    
    const currentTopicEl = document.getElementById('currentTopic');
    if (currentTopicEl) {
        currentTopicEl.innerHTML = `<span class="topic-dot"></span><span>${topicNames[topic] || '全部知识'}</span>`;
    }
    
    // 更新侧边栏推荐问题
    updateSidebarSuggestions(topic);
}

// 更新侧边栏推荐问题
function updateSidebarSuggestions(topic) {
    const suggestions = {
        all: [
            "什么是指数基金？",
            "价值投资是什么？",
            "定投有什么好处？",
            "股票和债券的区别？",
            "新手怎么开始投资？"
        ],
        fund: [
            "什么是指数基金？",
            "基金定投有什么好处？",
            "如何挑选基金？",
            "主动基金和指数基金哪个好？",
            "什么是资产配置？"
        ],
        stock: [
            "什么是股票？",
            "价值投资是什么意思？",
            "市盈率怎么看？",
            "巴菲特的投资理念是什么？",
            "股票投资有什么风险？"
        ],
        bond: [
            "什么是债券？",
            "债券和股票有什么区别？",
            "什么是债券基金？",
            "利率和债券价格有什么关系？",
            "国债安全吗？"
        ],
        mindset: [
            "投资应该有什么样的心态？",
            "什么是复利效应？",
            "如何克服追涨杀跌？"
        ],
        strategy: [
            "新手怎么开始投资？",
            "什么是闲钱投资？",
            "为什么要长期投资？",
            "为什么不能借钱炒股？"
        ]
    };
    
    const list = document.getElementById('sidebarSuggestions');
    if (list && suggestions[topic]) {
        list.innerHTML = suggestions[topic].map(q => 
            `<button class="suggestion-chip" onclick="sendMessage('${q}')">${q}</button>`
        ).join('');
    }
}

// 调用外部API
async function callExternalApi(question) {
    try {
        let response;
        
        if (apiConfig.provider === 'openai' || apiConfig.provider === 'custom' || 
            apiConfig.provider === 'deepseek' || apiConfig.provider === 'zhipu' ||
            apiConfig.provider === 'qwen' || apiConfig.provider === 'moonshot' ||
            apiConfig.provider === 'siliconflow' || apiConfig.provider === 'doubao') {
            response = await callOpenAiCompatible(question);
        }
        
        if (response) {
            addMessage(response, 'bot');
        } else {
            addMessage(findAnswer(question), 'bot');
        }
    } catch (error) {
        console.error('API调用失败', error);
        addMessage(`
            <p>⚠️ API调用失败，已切换到本地知识库。</p>
            <p>错误信息：${error.message}</p>
            <p>你可以在「AI 设置」页面检查配置是否正确。</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;">
            ${findAnswer(question)}
        `, 'bot');
    }
}

// 调用OpenAI兼容API
async function callOpenAiCompatible(question) {
    if (!apiConfig.apiUrl || !apiConfig.apiKey || !apiConfig.model) {
        throw new Error('API配置不完整');
    }
    
    // 构建系统提示词
    const systemPrompt = `你是一个专业的投资教育助手，你的任务是帮助用户学习投资知识（股票、基金、债券等）。
请基于经典投资书籍和权威资料来回答问题，保持客观、理性。
重要提醒：
1. 不要提供具体的投资建议或推荐具体股票
2. 强调投资有风险，入市需谨慎
3. 用通俗易懂的语言解释概念
4. 回答要结构清晰，重点突出
5. 适当引用经典书籍或权威观点作为参考`;
    
    const response = await fetch(apiConfig.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
            model: apiConfig.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    let answer = data.choices?.[0]?.message?.content || '';
    
    // 将Markdown格式转换为简单HTML
    answer = markdownToHtml(answer);
    
    return answer;
}

// 简单的Markdown转HTML
function markdownToHtml(text) {
    // 代码块
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // 加粗
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 标题
    text = text.replace(/^### (.*$)/gm, '<h4>$1</h4>');
    text = text.replace(/^## (.*$)/gm, '<h3>$1</h3>');
    // 无序列表
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    // 段落
    text = text.replace(/\n\n/g, '</p><p>');
    text = '<p>' + text + '</p>';
    
    return text;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadApiConfig();
});
