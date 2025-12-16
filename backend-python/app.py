from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from src.routes.generate_routes import generate_bp
from src.routes.embed_routes import embed_bp
from src.models.model_manager import initialize_models

# 환경변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# 모델 초기화
print("🔄 Loading SOLAR-7B Model...")
initialize_models()

# Blueprint 등록
app.register_blueprint(generate_bp, url_prefix='/generate')
app.register_blueprint(embed_bp, url_prefix='/embed')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'service': 'Poly-i Python LLM Server',
        'timestamp': __import__('datetime').datetime.now().isoformat()
    })

@app.route('/info', methods=['GET'])
def info():
    return jsonify({
        'model': 'SOLAR-7B',
        'quantization': 'GGUF (Q4_K_M)',
        'embedding_model': 'sentence-transformers/all-MiniLM-L6-v2',
        'max_tokens': 512,
        'device': 'cuda' if __import__('torch').cuda.is_available() else 'cpu'
    })

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5001))
    print(f"🚀 Starting Python LLM Server on port {port}")
    app.run(debug=os.getenv('DEBUG', False), port=port, host='0.0.0.0')
