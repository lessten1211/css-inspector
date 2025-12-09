import os
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json

from allin_llmflow.assets.asset_factory import AssetFactory
from allin_llmflow.assets.model_services import ChatModelService
from allin_llmflow.dataclasses.chat_message import ChatMessage

# 初始化 Flask 应用
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 你的ALLIN Token - 请替换为实际的 Token
os.environ["ALLIN_ASSET_STORAGE_TOKEN"] = "AIT5533445c69b99fa510ae9e0512b7b546"

# 加载聊天模型服务 - 请替换为实际的 service ID
try:
    chat_model_service: ChatModelService = AssetFactory.load_from_allin("<insert-your-directllm-service-here>")
    print("✅ AI 模型服务加载成功")
except Exception as e:
    print(f"❌ AI 模型服务加载失败: {e}")
    chat_model_service = None


@app.route('/api/chat', methods=['POST'])
def chat():
    """处理聊天请求"""
    try:
        if chat_model_service is None:
            return jsonify({
                "error": "AI 模型服务未初始化，请检查配置"
            }), 500

        data = request.json
        user_message = data.get('message', '')
        stream = data.get('stream', False)
        model = data.get('model', 'qwen2.5-72b-instruct')
        
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400

        # 构建消息历史
        messages = []
        if 'history' in data and isinstance(data['history'], list):
            for msg in data['history']:
                if msg.get('role') == 'user':
                    messages.append(ChatMessage.from_user(msg.get('content', '')))
                elif msg.get('role') == 'assistant':
                    messages.append(ChatMessage.from_assistant(msg.get('content', '')))
        
        # 添加当前消息
        messages.append(ChatMessage.from_user(user_message))

        # 流式响应
        if stream:
            def generate():
                collected_chunks = []
                
                def on_chunk(chunk):
                    collected_chunks.append(chunk)
                    # 发送 SSE 格式的数据
                    yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                
                try:
                    # 调用 AI 模型（流式）
                    replies = chat_model_service.infer(
                        messages=messages,
                        model=model,
                        timeout=60,
                        stream=True,
                        streaming_callbacks=[on_chunk]
                    )
                    
                    # 发送完成信号
                    full_response = ''.join(collected_chunks)
                    yield f"data: {json.dumps({'chunk': '', 'done': True, 'full_response': full_response})}\n\n"
                    
                except Exception as e:
                    error_msg = f"AI 调用错误: {str(e)}"
                    yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"
            
            return Response(generate(), mimetype='text/event-stream')
        
        # 非流式响应
        else:
            replies = chat_model_service.infer(
                messages=messages,
                model=model,
                timeout=60
            )
            
            return jsonify({
                "response": replies[0].content if replies else "无响应",
                "model": model
            })

    except Exception as e:
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({
        "status": "ok",
        "service": "AI Chat Service",
        "port": 5566,
        "model_loaded": chat_model_service is not None
    })


@app.route('/api/models', methods=['GET'])
def get_models():
    """获取可用模型列表"""
    return jsonify({
        "models": [
            {"id": "qwen2.5-72b-instruct", "name": "Qwen 2.5 72B"},
            {"id": "qwen2.5-32b-instruct", "name": "Qwen 2.5 32B"},
            {"id": "qwen2.5-14b-instruct", "name": "Qwen 2.5 14B"}
        ]
    })


if __name__ == '__main__':
    print("🚀 启动 AI 聊天服务...")
    print("📡 监听端口: 5566")
    print("🔗 健康检查: http://localhost:5566/api/health")
    print("💬 聊天接口: http://localhost:5566/api/chat")
    
    app.run(host='0.0.0.0', port=5566, debug=True)