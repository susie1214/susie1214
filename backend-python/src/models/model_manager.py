import torch
from sentence_transformers import SentenceTransformer
import os
from pathlib import Path

# 전역 모델 저장소
_models = {}

def initialize_models():
    """모델 초기화 (서버 시작시 한번만 실행)"""
    global _models
    
    # LLM 모델 초기화 (SOLAR-7B GGUF)
    print("📥 Loading SOLAR-7B Model...")
    try:
        from llama_cpp import Llama
        
        model_path = os.getenv(
            'LLM_MODEL_PATH',
            './models/solar-10.7b-instruct-v1.0.Q4_K_M.gguf'
        )
        
        # 절대 경로로 변환
        if not os.path.isabs(model_path):
            model_path = os.path.join(os.path.dirname(__file__), '..', '..', model_path)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"  Model path: {model_path}")
        print(f"  Model size: {os.path.getsize(model_path) / (1024**3):.2f} GB")
        
        _models['llm'] = Llama(
            model_path=model_path,
            n_gpu_layers=40,           # GPU 레이어 수
            n_ctx=4096,                # 컨텍스트 길이
            max_tokens=512,            # 최대 생성 토큰
            temperature=0.7,           # 온도 (창의성)
            top_p=0.95,                # Top-p 샘플링
            verbose=False
        )
        print("✅ SOLAR-7B Model loaded successfully")
        print(f"  GPU Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"  GPU: {torch.cuda.get_device_name(0)}")
        
    except ImportError:
        print("⚠️  llama-cpp-python not installed. Install with: pip install llama-cpp-python")
        print("    Using mock model for development")
        _models['llm'] = None
    except FileNotFoundError as e:
        print(f"❌ {e}")
        _models['llm'] = None
    except Exception as e:
        print(f"❌ Failed to load SOLAR-7B Model: {e}")
        _models['llm'] = None
    
    # 임베딩 모델 초기화
    print("📥 Loading Embedding Model...")
    try:
        _models['embedding'] = SentenceTransformer(
            'sentence-transformers/all-MiniLM-L6-v2',
            cache_folder='./models/embeddings',
            local_files_only=False
        )
        print("✅ Embedding Model loaded")
    except Exception as e:
        print(f"⚠️ Failed to load embedding model: {e}")
        print("   Retrying with local files only...")
        try:
            _models['embedding'] = SentenceTransformer(
                'all-MiniLM-L6-v2',
                local_files_only=True
            )
            print("✅ Embedding Model loaded (offline)")
        except:
            print("❌ Embedding model unavailable - using CPU inference only")
            _models['embedding'] = None

def get_llm_model():
    """LLM 모델 반환"""
    return _models.get('llm')

def get_embedding_model():
    """임베딩 모델 반환"""
    return _models.get('embedding')

def is_gpu_available():
    """GPU 가용성 확인"""
    return torch.cuda.is_available()
