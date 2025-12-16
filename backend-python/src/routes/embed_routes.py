from flask import Blueprint, request, jsonify
import logging
from src.services.embedding_service import generate_embedding

embed_bp = Blueprint('embed', __name__)
logger = logging.getLogger(__name__)

@embed_bp.route('/', methods=['POST'])
def embed():
    """
    임베딩 생성 엔드포인트
    
    Request:
    {
        "text": "임베딩할 텍스트"
    }
    
    Response:
    {
        "embedding": [...],
        "dimension": 384,
        "model": "all-MiniLM-L6-v2"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'text is required'}), 400
        
        # 임베딩 서비스 호출
        embedding_data = generate_embedding(text)
        
        return jsonify(embedding_data), 200
        
    except Exception as e:
        logger.error(f"Embedding Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
