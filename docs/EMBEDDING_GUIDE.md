# 임베딩 및 RAG 구현 가이드

## 임베딩 개요

### 임베딩이란?
텍스트를 고차원 벡터로 변환하여 의미적 유사도를 계산할 수 있게 하는 기술

```
"안녕하세요" → [0.1, 0.3, -0.2, ..., 0.5]  (384차원)
"반갑습니다" → [0.12, 0.28, -0.19, ..., 0.48]
            ↓
          유사도 높음 (코사인 유사도 ≈ 0.98)
```

---

## 임베딩 모델 선택

### 1. sentence-transformers/all-MiniLM-L6-v2 (추천)

**특징**:
- 384차원 벡터
- 경량 (22MB)
- 한국어 우수
- 빠른 처리 (GPU: ~1ms/문장)

**설정**:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["텍스트1", "텍스트2"])
# → numpy array (N, 384)
```

### 2. OpenAI Embedding API

**특징**:
- 1536차원 벡터
- 최고 품질
- API 비용 ($0.02/1M tokens)
- 네트워크 필요

**설정**:
```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=["텍스트1", "텍스트2"]
)
embeddings = [r.embedding for r in response.data]
```

### 3. 기타 옵션

| 모델 | 차원 | 속도 | 품질 | 비용 |
|------|------|------|------|------|
| all-mpnet-base-v2 | 768 | 중간 | 우수 | 무료 |
| paraphrase-MiniLM | 384 | 빠름 | 좋음 | 무료 |
| text-davinci-003 | 1536 | 느림 | 최고 | 유료 |

**현재 사용**: **all-MiniLM-L6-v2**

---

## Python 임베딩 서비스 구현

### 기본 임베딩 함수

```python
# backend-python/src/services/embedding_service.py

from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str):
    """텍스트를 임베딩으로 변환"""
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def embed_batch(texts: list):
    """여러 텍스트를 한번에 임베딩"""
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=True)
    return [e.tolist() for e in embeddings]
```

### Flask 라우트

```python
# backend-python/src/routes/embed_routes.py

from flask import Blueprint, request, jsonify
from src.services.embedding_service import embed_text, embed_batch

embed_bp = Blueprint('embed', __name__)

@embed_bp.route('/', methods=['POST'])
def embed_single():
    """단일 텍스트 임베딩"""
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'text required'}), 400
    
    embedding = embed_text(text)
    return jsonify({
        'embedding': embedding,
        'dimension': len(embedding),
        'text_length': len(text)
    })

@embed_bp.route('/batch', methods=['POST'])
def embed_batch_route():
    """배치 임베딩"""
    data = request.json
    texts = data.get('texts', [])
    
    embeddings = embed_batch(texts)
    return jsonify({
        'embeddings': embeddings,
        'count': len(embeddings),
        'dimension': len(embeddings[0]) if embeddings else 0
    })
```

---

## 데이터베이스 저장 및 검색

### 임베딩 저장 (SQLite)

```python
# backend-node/src/db/database.js

import sqlite3
import json

def save_embedding_to_db(user_id, text, embedding_vector, source='chat'):
    """임베딩을 데이터베이스에 저장"""
    
    conn = sqlite3.connect('data/polychat.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO embeddings 
        (user_id, text, vector, source, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        user_id,
        text,
        json.dumps(embedding_vector),  # JSON으로 저장
        source
    ))
    
    conn.commit()
    return cursor.lastrowid

# 인덱스 생성 (검색 속도 향상)
cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_user_id 
    ON embeddings(user_id)
""")
```

### 유사도 검색 (Semantic Search)

```python
# backend-python/src/services/embedding_service.py

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def find_similar_documents(query_embedding, db_embeddings, top_k=3):
    """쿼리 임베딩과 유사한 문서 검색"""
    
    query_vec = np.array(query_embedding).reshape(1, -1)
    db_vecs = np.array(db_embeddings)
    
    # 코사인 유사도 계산
    similarities = cosine_similarity(query_vec, db_vecs)[0]
    
    # 상위 K개 선택
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        results.append({
            'index': int(idx),
            'similarity': float(similarities[idx]),
            'rank': len(results) + 1
        })
    
    return results
```

---

## RAG (Retrieval-Augmented Generation) 구현

### 아키텍처

```
사용자 질문
    ↓
[1] 질문 임베딩
    ↓
[2] 유사 문서 검색
    ↓
[3] 컨텍스트 구성
    ↓
[4] LLM에 입력
    ↓
응답 생성
```

### 구현 코드

```python
# backend-node/src/services/ragService.js

import axios from 'axios';
import { getConversationHistory } from '../db/database.js';

const LLM_SERVER = 'http://localhost:5001';

/**
 * RAG 파이프라인
 */
async function ragQuery(userId, question) {
    try {
        // 1. 질문 임베딩
        const questionEmbedding = await getEmbedding(question);
        
        // 2. 관련 대화 검색
        const history = await getConversationHistory(userId, 50);
        const similarDocs = findSimilar(
            questionEmbedding, 
            history.map(h => JSON.parse(h.embedding))
        );
        
        // 3. 컨텍스트 구성
        let context = similarDocs
            .slice(0, 3)  // 상위 3개
            .map(doc => history[doc.index].response)
            .join('\n');
        
        // 4. LLM 호출
        const systemPrompt = `
당신은 도움이 되는 상담 챗봇입니다.
다음 컨텍스트를 고려하여 답변하세요:

${context}

사용자: ${question}`;
        
        const response = await axios.post(
            `${LLM_SERVER}/generate`,
            {
                prompt: systemPrompt,
                max_tokens: 512
            }
        );
        
        return response.data.response;
        
    } catch (error) {
        console.error('RAG Error:', error);
        throw error;
    }
}

// 코사인 유사도
function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitude = (vec) => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude(a) * magnitude(b));
}

function findSimilar(queryEmbedding, docEmbeddings, topK = 3) {
    const similarities = docEmbeddings.map((emb, idx) => ({
        index: idx,
        similarity: cosineSimilarity(queryEmbedding, emb)
    }));
    
    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
}
```

---

## 고급 기법

### 1. Semantic Caching

```python
# 자주 사용되는 임베딩 캐시
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_embed(text):
    """캐시된 임베딩"""
    return embed_text(text)
```

### 2. Chunking (긴 문서 분할)

```python
def chunk_text(text, chunk_size=256, overlap=50):
    """텍스트를 겹치는 청크로 분할"""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk:
            chunks.append(chunk)
    return chunks

# 사용
text = "매우 긴 텍스트..."
chunks = chunk_text(text)
embeddings = embed_batch(chunks)
```

### 3. Hybrid Search (임베딩 + BM25)

```python
from rank_bm25 import BM25Okapi

def hybrid_search(query, documents, embeddings, alpha=0.7):
    """벡터 검색과 키워드 검색 결합"""
    
    # 벡터 유사도
    query_emb = embed_text(query)
    vector_scores = [
        cosine_similarity(query_emb, emb) 
        for emb in embeddings
    ]
    
    # BM25 스코어
    tokenized = [doc.split() for doc in documents]
    bm25 = BM25Okapi(tokenized)
    bm25_scores = bm25.get_scores(query.split())
    
    # 가중치 결합
    combined_scores = [
        alpha * v + (1 - alpha) * b
        for v, b in zip(vector_scores, bm25_scores)
    ]
    
    return sorted(
        enumerate(combined_scores),
        key=lambda x: x[1],
        reverse=True
    )
```

---

## 성능 최적화

### 1. 배치 처리

```python
# 한 번에 여러 텍스트 임베딩
embeddings = model.encode(
    texts,
    batch_size=32,  # 배치 크기
    show_progress_bar=True
)
```

### 2. GPU 활용

```python
from sentence_transformers import SentenceTransformer

# GPU로 모델 이동
model = SentenceTransformer('all-MiniLM-L6-v2')
model = model.to('cuda')

# 추론
embeddings = model.encode(texts)  # 자동으로 GPU 사용
```

### 3. 임베딩 차원 축소

```python
from sklearn.decomposition import PCA

# 384차원 → 256차원으로 축소
pca = PCA(n_components=256)
reduced_embeddings = pca.fit_transform(embeddings)
```

---

## 임베딩 품질 평가

### Semantic Textual Similarity (STS) 벤치마크

```python
from sentence_transformers.util import semantic_search
import numpy as np

def evaluate_embedding_quality(pairs, labels):
    """
    pairs: [("문장1", "문장2"), ...]
    labels: [유사도점수, ...]  (0-1)
    """
    embeddings = [model.encode(text) for pair in pairs for text in pair]
    
    correlations = []
    for i, (text1, text2) in enumerate(pairs):
        emb1 = model.encode(text1)
        emb2 = model.encode(text2)
        
        similarity = cosine_similarity([emb1], [emb2])[0][0]
        correlations.append(similarity)
    
    # 스피어만 상관계수 계산
    from scipy.stats import spearmanr
    corr, pvalue = spearmanr(correlations, labels)
    
    return {'correlation': corr, 'pvalue': pvalue}
```

---

## 체크리스트

- [ ] 임베딩 모델 선택 및 설치
- [ ] 임베딩 라우트 구현
- [ ] 데이터베이스 저장 구조
- [ ] 유사도 검색 함수
- [ ] RAG 파이프라인 통합
- [ ] 캐싱 구현
- [ ] 성능 테스트
- [ ] 품질 평가

