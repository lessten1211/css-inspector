# AI 聊天服务

基于 Flask 和 allin-llmflow 的 AI 聊天后端服务。

## 快速开始

### 1. 安装依赖

```bash
cd "Python/Quantitative Finance"
pip install -r requirements.txt -i http://pypi.devops.xiaohongshu.com/simple/ --trusted-host pypi.devops.xiaohongshu.com
```

### 2. 配置环境变量

在 [`app.py`](app.py:15) 中修改以下配置：

```python
# 替换为你的 ALLIN Token
os.environ["ALLIN_ASSET_STORAGE_TOKEN"] = "你的实际Token"

# 替换为你的 DirectLLM Service ID
chat_model_service = AssetFactory.load_from_allin("你的服务ID")
```

### 3. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:5566` 启动。

## API 端点

### 健康检查
```
GET /api/health
```

### 聊天接口（流式）
```
POST /api/chat
Content-Type: application/json

{
  "message": "你好",
  "stream": true,
  "model": "qwen2.5-72b-instruct",
  "history": [
    {"role": "user", "content": "之前的消息"},
    {"role": "assistant", "content": "之前的回复"}
  ]
}
```

### 获取模型列表
```
GET /api/models
```

## 功能特性

- ✅ 支持流式响应（Server-Sent Events）
- ✅ 支持对话历史上下文
- ✅ 跨域支持（CORS）
- ✅ 多模型支持
- ✅ 错误处理和健康检查