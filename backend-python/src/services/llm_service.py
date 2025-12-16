import logging
from src.models.model_manager import get_llm_model

logger = logging.getLogger(__name__)

def generate_response(prompt: str, user_id: str = "default", max_tokens: int = 256, temperature: float = 0.7, language: str = "ko"):
    """
    SOLAR-7B 모델로 텍스트 생성 (한국어/영어 지원)
    
    Args:
        prompt: 입력 프롬프트
        user_id: 사용자 ID
        max_tokens: 최대 토큰 수
        temperature: 생성 온도 (0.0 ~ 1.0)
        language: 언어 ('ko' 또는 'en')
    
    Returns:
        dict: 생성된 응답과 메타데이터
    """
    
    try:
        model = get_llm_model()
        
        if not model:
            # 모델이 로드되지 않은 경우 기본 응답 반환
            logger.warning("LLM model not loaded, using fallback response")
            fallback_msg = "죄송합니다. 모델 로드 중입니다." if language == "ko" else "Sorry, loading model. Please try again."
            return {
                'response': fallback_msg,
                'tokens_used': 0,
                'model': 'SOLAR-7B',
                'user_id': user_id,
                'language': language,
                'error': 'model_not_loaded'
            }
        
        # 언어에 따른 시스템 프롬프트
        if language == "ko":
            system_prompt = """당신은 Poly-i라는 친절한 상담 챗봇입니다.
- 사용자 질문에 정확하고 도움이 되는 답변
- 마크다운 형식 사용 (##, **, -)
- 3-5줄 정도로 간결하게"""
            prefix = "사용자: "
            suffix = "\n답변:"
        else:
            system_prompt = """You are Poly-i, a friendly counseling chatbot.
- Provide accurate and helpful answers
- Use markdown format (##, **, -)
- Keep it concise (3-5 lines)"""
            prefix = "User: "
            suffix = "\nResponse:"
        
        full_prompt = f"{system_prompt}\n\n{prefix}{prompt}{suffix}"
        
        # 모델 실행
        output = model(
            full_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.95,
            top_k=50,
            repeat_penalty=1.1,
            echo=False
        )
        
        response_text = output['choices'][0]['text'].strip()
        tokens_used = output['usage']['completion_tokens']
        
        return {
            'response': response_text,
            'tokens_used': tokens_used,
            'model': 'SOLAR-7B',
            'user_id': user_id,
            'language': language
        }
        
    except Exception as e:
        logger.error(f"LLM Generation Error: {str(e)}")
        error_msg = f"오류가 발생했습니다: {str(e)}" if language == "ko" else f"Error occurred: {str(e)}"
        return {
            'response': error_msg,
            'tokens_used': 0,
            'model': 'SOLAR-7B',
            'user_id': user_id,
            'language': language,
            'error': str(e)
        }

def create_system_prompt(intent: str = "general"):
    """
    의도별 시스템 프롬프트 생성
    
    Args:
        intent: 사용자 의도 (general, inquiry, complaint, feedback 등)
    
    Returns:
        str: 시스템 프롬프트
    """
    
    prompts = {
        "general": """당신은 Poly-i라는 친절한 상담 챗봇입니다.
- 사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요.
- 명확하고 간결한 언어를 사용하세요.
- 모르는 것은 솔직하게 인정하세요.""",
        
        "inquiry": """당신은 제품/서비스 문의를 담당하는 상담원입니다.
- 사용자의 질문에 구체적인 정보를 제공하세요.
- 필요하면 추가 정보 수집을 위해 명확한 질문을 하세요.
- 친절하고 전문적인 태도를 유지하세요.""",
        
        "complaint": """당신은 민원 처리 담당자입니다.
- 사용자의 불만을 공감하는 태도로 경청하세요.
- 문제를 이해하려고 노력하세요.
- 해결 방안을 적극적으로 제시하세요.
- 상황에 따라 인간 담당자로의 전환을 제안하세요.""",
        
        "feedback": """당신은 피드백을 수집하는 담당자입니다.
- 사용자의 의견을 개방적으로 받아들이세요.
- 명확한 피드백을 수집하세요.
- 감사의 마음을 표현하세요.""",
    }
    
    return prompts.get(intent, prompts["general"])
