# AI Agent 对接方案

本项目设计为可与主流 AI Agent 平台对接，让投资知识库成为 AI 智能体的"大脑"之一。

---

## 一、前端页面 AI 对话配置

用户可以在网页内直接配置自己的大模型 API，实现更智能的对话体验。

### 支持的模型服务商

| 服务商 | 模型示例 | 官方地址 |
|--------|----------|----------|
| OpenAI | gpt-4o, gpt-4o-mini | openai.com |
| DeepSeek | deepseek-chat, deepseek-reasoner | deepseek.com |
| 智谱 AI | glm-4-flash, glm-4-plus | bigmodel.cn |
| 通义千问 | qwen-turbo, qwen-plus | dashscope.aliyun.com |
| Kimi (月之暗面) | moonshot-v1-8k, moonshot-v1-32k | moonshot.cn |
| 自定义 | 任何 OpenAI 兼容格式 | - |

### 配置方式

1. 打开网站 → 点击 "AI 对接" 页面
2. 选择模型服务商
3. 填入你的 API Key
4. 填入模型名称
5. 勾选 "启用 AI 对话"
6. 点击 "保存配置"
7. （可选）点击 "测试连接" 验证配置是否正确

配置保存在浏览器本地（localStorage），不会上传到任何服务器。

### 隐私说明

- API Key 仅存储在用户自己的浏览器中
- 对话请求直接从用户浏览器发送到模型服务商
- 项目方不收集、不存储任何用户数据

---

## 二、对接 GPTs（OpenAI 自定义 GPT）

### 方式一：使用 Actions（知识库查询）

将投资知识库作为 GPTs 的外部知识库使用。

1. 部署你的项目到一个有域名的服务器（需要 HTTPS）
2. 在 GPTs 编辑器中，点击 "Configure" → "Add Actions"
3. 导入 OpenAPI schema（见下方示例）
4. 配置 API 鉴权（可选）
5. 保存后，你的 GPT 就可以调用知识库查询投资问题了

### OpenAPI Schema 示例

```yaml
openapi: 3.0.0
info:
  title: 投资学堂知识库 API
  description: 查询投资相关知识，包括基金、股票、债券等
  version: 1.0.0
servers:
  - url: https://your-domain.com/api
paths:
  /knowledge:
    get:
      summary: 查询知识库
      description: 根据关键词查询投资知识库中的相关内容
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
          description: 查询关键词或问题
      responses:
        '200':
          description: 成功返回相关知识
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      type: object
                      properties:
                        category:
                          type: string
                        question:
                          type: string
                        answer:
                          type: string
  /books:
    get:
      summary: 获取推荐书籍
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [beginner, value, advanced, mindset]
          description: 书籍分类
      responses:
        '200':
          description: 成功返回书籍列表
```

---

## 三、对接 LangChain

### 方式一：作为知识库检索工具

```python
from langchain.tools import tool
import requests

@tool
def invest_knowledge_search(query: str) -> str:
    """
    查询投资知识库，获取基金、股票、债券等投资相关知识。
    当用户询问投资相关问题时使用此工具。
    """
    response = requests.get(
        "https://your-domain.com/api/knowledge",
        params={"q": query}
    )
    data = response.json()
    
    # 格式化结果
    results = []
    for item in data.get("results", []):
        results.append(f"【{item['category']}】{item['question']}\n{item['answer']}")
    
    return "\n\n".join(results) if results else "未找到相关知识。"

# 在 Agent 中使用
from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI

tools = [invest_knowledge_search]

llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)

agent.run("什么是指数基金？它有什么优点？")
```

### 方式二：RAG（检索增强生成）

将知识库文档向量化后，用 RAG 方式增强 LLM 回答：

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

# 1. 加载知识库（从 knowledge.js 提取的结构化数据）
# 你需要先将 knowledge.js 中的内容转换为文本格式
from langchain.document_loaders import JSONLoader

loader = JSONLoader(
    file_path="./knowledge_data.json",
    jq_schema=".[]",
    text_content=False
)
documents = loader.load()

# 2. 创建向量数据库
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# 3. 创建 RAG 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 4. 使用
result = qa_chain.run("价值投资的核心原则是什么？")
print(result)
```

---

## 四、对接 Dify

Dify 是一个开源的 LLM 应用开发平台，支持可视化构建 AI 应用。

### 步骤

1. 部署 Dify（开源版或云服务）
2. 创建一个新应用，选择 "对话型"
3. 在 "知识库" 中，导入投资知识库数据
   - 方式一：将知识整理为 Markdown/TXT 文件上传
   - 方式二：使用 API 方式对接
4. 配置系统提示词：
   ```
   你是一位专业的投资教育助手，任务是帮助用户学习投资知识。
   请基于知识库中的内容来回答用户的问题。
   重要提醒：
   1. 不提供具体的投资建议或股票推荐
   2. 强调投资有风险，入市需谨慎
   3. 用通俗易懂的语言解释概念
   4. 回答要有条理，重点突出
   ```
5. 发布应用，可以通过网页、API、微信等多种渠道使用

---

## 五、对接扣子 Coze

扣子（Coze）是字节跳动推出的 AI Bot 开发平台。

### 步骤

1. 访问 [coze.cn](https://www.coze.cn)，注册登录
2. 创建一个新的 Bot
3. 在 "人设与提示词" 中配置：
   - 人设：专业的投资学习助手
   - 提示词：参考上面 Dify 的系统提示词
4. 在 "插件" 中，添加自定义插件
   - 配置你的知识库查询 API
   - 设置参数和返回值
5. 在 "知识库" 中，上传投资书籍和资料
6. 调试和发布
7. 可以发布到：豆包、微信公众号、飞书等平台

---

## 六、对接微信公众号/小程序

### 方案一：使用微信智能体平台

1. 访问微信公众平台 → 功能 → 智能体
2. 创建智能体，配置提示词和知识库
3. 可以把投资知识库导入为智能体的知识库
4. 用户在公众号对话中就可以直接问投资问题了

### 方案二：自己开发后端

1. 使用微信公众号开发者模式
2. 用户发送消息 → 你的后端接收 → 调用大模型 + 知识库 → 返回回答
3. 可以使用 Python/Node.js 等开发

---

## 七、对接飞书机器人

### 步骤

1. 在飞书开放平台创建企业自建应用
2. 添加 "机器人" 能力
3. 配置消息接收地址（你的后端服务）
4. 后端收到消息后，调用大模型 + 知识库生成回答
5. 通过飞书 API 将回答发送回用户

---

## 八、知识库数据格式说明

如果你需要对接后端 API，以下是知识库数据的标准格式：

### 知识点格式

```json
{
  "category": "fund",
  "keywords": ["什么是指数基金", "指数基金是什么", "ETF"],
  "answer": "指数基金是...",
  "source": "《指数基金投资指南》"
}
```

### 分类说明

| 分类 ID | 分类名称 | 内容范围 |
|---------|----------|----------|
| fund | 基金 | 基金入门、指数基金、定投、基金挑选、资产配置等 |
| stock | 股票 | 股票基础、价值投资、估值方法、巴菲特理念、风险等 |
| bond | 债券 | 债券基础、债券基金、国债、利率关系等 |
| mindset | 投资心态 | 投资心理、复利效应、常见误区等 |
| strategy | 投资策略 | 新手入门步骤、长期投资、闲钱投资、风险控制等 |

---

## 九、后端 API 实现参考

如果你需要部署带后端 API 的版本，可以参考以下实现：

### Node.js (Express) 示例

```javascript
const express = require('express');
const app = express();

// 加载知识库（从 knowledge.js 提取）
const knowledgeBase = require('./knowledge-base.json');

// 跨域支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 知识库查询接口
app.get('/api/knowledge', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = [];
  
  for (const category of Object.keys(knowledgeBase)) {
    for (const item of knowledgeBase[category]) {
      const matched = item.keywords.some(kw => 
        kw.toLowerCase().includes(query) || query.includes(kw.toLowerCase())
      );
      if (matched) {
        results.push({
          category,
          question: item.keywords[0],
          answer: item.answer,
          source: item.source || ''
        });
      }
    }
  }
  
  res.json({ results: results.slice(0, 10) });
});

// 书籍列表接口
app.get('/api/books', (req, res) => {
  const category = req.query.category;
  const bookData = require('./book-data.json');
  
  if (category && bookData[category]) {
    res.json({ books: bookData[category] });
  } else {
    res.json({ books: bookData });
  }
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

### Python (Flask) 示例

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

with open('knowledge-base.json', 'r', encoding='utf-8') as f:
    knowledge_base = json.load(f)

@app.route('/api/knowledge')
def search_knowledge():
    query = request.args.get('q', '').lower()
    results = []
    
    for category, items in knowledge_base.items():
        for item in items:
            matched = any(
                kw.lower() in query or query in kw.lower()
                for kw in item['keywords']
            )
            if matched:
                results.append({
                    'category': category,
                    'question': item['keywords'][0],
                    'answer': item['answer']
                })
    
    return jsonify({'results': results[:10]})

if __name__ == '__main__':
    app.run(port=3000)
```

---

## 十、安全建议

1. **API Key 安全**：如果部署了带后端的版本，API Key 一定要放在服务端，不要暴露在前端
2. **速率限制**：为 API 接口添加限流，防止滥用
3. **内容审核**：对接大模型时，建议添加内容审核机制
4. **免责声明**：务必在显著位置标明"内容仅供参考，不构成投资建议"

---

更多对接方式持续更新中，欢迎贡献你的对接方案！
