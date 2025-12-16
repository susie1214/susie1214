import logging
from src.models.model_manager import get_embedding_model

logger = logging.getLogger(__name__)

def generate_embedding(text: str):
    """
    텍스트 임베딩 생성
    
    Args:
        text: 임베딩할 텍스트
    
    Returns:
        dict: 임베딩 벡터와 메타데이터
    """
    
    try:
        model = get_embedding_model()
        if not model:
            raise Exception("Embedding Model not loaded")
        
        # 임베딩 생성
        embedding = model.encode(text, convert_to_numpy=True)
        
        return {
            'embedding': embedding.tolist(),
            'dimension': len(embedding),
            'model': 'all-MiniLM-L6-v2',
            'text_length': len(text)
        }
        
    except Exception as e:
        logger.error(f"Embedding Generation Error: {str(e)}")
        raise

def similarity_search(query_embedding: list, embeddings_db: list, top_k: int = 5):
    """
    코사인 유사도를 사용한 유사 문서 검색
    
    Args:
        query_embedding: 쿼리 임베딩
        embeddings_db: 데이터베이스의 임베딩 목록
        top_k: 상위 K개 결과 반환
    
    Returns:
        list: 유사도순으로 정렬된 인덱스
    """
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity
    
    try:
        query_vec = np.array(query_embedding).reshape(1, -1)
        db_vecs = np.array(embeddings_db)
        
        similarities = cosine_similarity(query_vec, db_vecs)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [
            {
                'index': int(idx),
                'similarity': float(similarities[idx])
            }
            for idx in top_indices
        ]
        
    except Exception as e:
        logger.error(f"Similarity Search Error: {str(e)}")
        raise
