from flask import Blueprint, request, jsonify
import logging
from src.services.llm_service import generate_response

generate_bp = Blueprint('generate', __name__)
logger = logging.getLogger(__name__)

@generate_bp.route('/', methods=['POST'])
def generate():
    """
    텍스트 생성 엔드포인트 (한국어/영어 지원)
    
    Request:
    {
        "prompt": "질문 또는 프롬프트",
        "user_id": "사용자ID (선택사항)",
        "max_tokens": 256,
        "temperature": 0.7,
        "language": "ko" 또는 "en"
    }
    
    Response:
    {
        "response": "생성된 응답",
        "tokens_used": 123,
        "model": "SOLAR-7B",
        "language": "ko"
    }
    """
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        user_id = data.get('user_id', 'default')
        max_tokens = data.get('max_tokens', 256)
        temperature = data.get('temperature', 0.7)
        language = data.get('language', 'ko')  # 기본값: 한국어
        
        if not prompt:
            return jsonify({'error': 'prompt is required'}), 400
        
        # LLM 서비스 호출
        response = generate_response(
            prompt=prompt,
            user_id=user_id,
            max_tokens=max_tokens,
            temperature=temperature,
            language=language
        )
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Generate Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
