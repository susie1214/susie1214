# Poly-i 챗봇 - 세부 설계 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [아키텍처](#아키텍처)
4. [LLM 설정](#llm-설정)
5. [임베딩 전략](#임베딩-전략)
6. [프롬프트 엔지니어링](#프롬프트-엔지니어링)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [API 문서](#api-문서)
9. [배포 가이드](#배포-가이드)

---

## 프로젝트 개요

**Poly-i**는 아이폰 스타일의 모던 UI를 갖춘 상담 챗봇 시스템입니다.

### 특징
- 🎨 아이폰 스타일의 트렌디한 Blue 계열 UI
- 💬 SOLAR-7B 로컬 LLM 기반 대화
- 🗄️ SQLite 기반 대화 히스토리 저장
- 🔍 OpenAI/HuggingFace 임베딩 지원
- 📊 의도 분석 및 감정 트래킹
- 🚀 웹 기반 배포 (홈페이지 탑재 가능)

---

## 기술 스택

| 계층 | 기술 | 버전 | 설명 |
|------|------|------|------|
| **프론트엔드** | React | 18.2.0 | 사용자 인터페이스 |
| | Tailwind CSS | 3.3.0 | 스타일링 |
| | Zustand | 4.4.0 | 상태관리 |
| | Vite | 5.0.0 | 번들러 |
| **백엔드** | Node.js | 18+ | API 서버 |
| | Express | 4.18.2 | 웹 프레임워크 |
| | SQLite3 | 5.1.6 | 데이터베이스 |
| **AI/ML** | Python | 3.10+ | LLM 서버 |
| | Flask | 3.0.0 | Python API |
| | SOLAR-7B | GGUF | 로컬 LLM |
| | sentence-transformers | 2.2.2 | 임베딩 모델 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    브라우저 / 웹앱                           │
│              (React Frontend - PORT 3000)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/CORS
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
│ Node.js API  │  │  Database  │  │   Static   │
│ (PORT 5000)  │  │  (SQLite)  │  │   Files    │
└───────┬──────┘  └────────────┘  └────────────┘
        │
    HTTP/JSON
        │
┌───────▼──────────────────────────────────────────┐
│      Python LLM Server (PORT 5001)              │
│  ┌──────────────┐        ┌──────────────┐      │
│  │ SOLAR-7B     │        │  Embeddings  │      │
│  │ (GGUF+GPU)   │        │  (HF/OpenAI) │      │
│  └──────────────┘        └──────────────┘      │
└───────────────────────────────────────────────────┘
```

### 통신 흐름

```
User → Frontend → Node.js API → Python LLM Server
                ↓
           SQLite DB (대화 저장)
```

---

## LLM 설정

### SOLAR-7B GGUF 모델 설정

#### 1. 모델 다운로드

```bash
# Hugging Face에서 양자화된 모델 다운로드
# TheBloke의 SOLAR-10.7B-Instruct-v1.0-GGUF 버전 권장

wget https://huggingface.co/TheBloke/SOLAR-10.7B-Instruct-v1.0-GGUF/resolve/main/solar-10.7b-instruct-v1.0.Q4_K_M.gguf
# → backend-python/models/ 폴더에 저장
```

#### 2. 양자화 방식

| 양자화 | GPU 메모리 | 속도 | 품질 | 추천 |
|--------|-----------|------|------|------|
| Q8_0 | 12GB | 느림 | 최고 | ⭐ 품질 중시 |
| Q5_K_M | 10GB | 중간 | 우수 | ⭐ 권장 |
| Q4_K_M | 6-8GB | 빠름 | 좋음 | ⭐⭐⭐ 가장 권장 |
| Q3_K_M | 4-5GB | 매우빠름 | 괜찮음 | 저사양 환경 |

**현재 설정: Q4_K_M (6-8GB VRAM 최적화)**

#### 3. Python 초기화 코드

```python
from llama_cpp import Llama

# 모델 로드 (app.py의 initialize_models 함수 내)
model = Llama(
    model_path="./models/solar-10.7b-instruct-v1.0.Q4_K_M.gguf",
    n_gpu_layers=40,  # GPU에 로드할 레이어 수
    n_ctx=4096,       # 컨텍스트 길이
    max_tokens=512,   # 최대 생성 토큰
    temperature=0.7,  # 창의성 (0.0~1.0)
    top_p=0.95,       # 핵심 샘플링
    verbose=False
)

# 추론
response = model("질문을 입력하세요", max_tokens=512)
```

---

## 임베딩 전략

### 1. 선택 옵션

#### OpenAI 임베딩 (클라우드 기반)
```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")
response = client.embeddings.create(
    model="text-embedding-3-small",  # 1536차원
    input="임베딩할 텍스트"
)
embedding = response.data[0].embedding
```

**장점**: 고품질, 관리 용이
**단점**: API 비용, 인터넷 필요

#### HuggingFace 임베딩 (로컬)
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(["텍스트1", "텍스트2"])
```

**장점**: 무료, 빠름, 프라이빗
**단점**: 메모리 필요

### 2. 구현 선택 (현재)

**sentence-transformers/all-MiniLM-L6-v2** 사용
- 384차원 벡터
- 가볍고 빠름 (6GB VRAM 환경에 적합)
- 한국어 지원

### 3. 임베딩 저장 및 RAG

```python
# 임베딩 저장 (SQLite)
def save_embedding(text, embedding_vector, user_id):
    db.execute("""
        INSERT INTO embeddings (user_id, text, vector)
        VALUES (?, ?, ?)
    """, (user_id, text, json.dumps(embedding_vector)))

# 유사 문서 검색 (RAG)
def find_similar(query_embedding, top_k=3):
    # 코사인 유사도로 상위 K개 검색
    results = db.execute("""
        SELECT * FROM embeddings 
        ORDER BY similarity(?, vector) DESC
        LIMIT ?
    """, (query_embedding, top_k))
    return results
```

---

## 프롬프트 엔지니어링

### 1. 시스템 프롬프트 템플릿

```python
SYSTEM_PROMPT = """당신은 Poly-i라는 친절한 상담 챗봇입니다.

## 역할
- 사용자의 질문에 정확하고 도움이 되는 답변 제공
- 정중하고 전문적인 언어 사용
- 불명확한 부분은 명확히 묻기

## 행동 규칙
- 정확한 정보만 제공 (추측은 하지 않기)
- 복잡한 내용은 간단하게 설명
- 모르는 것은 솔직하게 인정
- 필요시 인간 담당자로의 전환 제안

## 응답 형식
- 명확하고 간결하게
- 마크다운 사용 가능
- 이모지는 자제

## 대화 컨텍스트
사용자 ID: {user_id}
이전 메시지 {conversation_history}
"""
```

### 2. 사용자 메시지 포맷

```python
USER_MESSAGE = """사용자: {message}

상황: {context}
의도: {intent}
감정: {sentiment}"""
```

### 3. 의도별 프롬프트 조정

```python
INTENT_PROMPTS = {
    "greeting": "친근하고 따뜻하게 인사하기",
    "inquiry": "구체적인 정보 제공, 필요시 명확한 질문",
    "complaint": "공감 표현, 문제 이해, 해결 방안 제시",
    "feedback": "피드백 수용, 감사 표현",
    "technical": "단계별 설명, 기술 용어 최소화",
}
```

---

## 데이터베이스 스키마

### SQLite 테이블 구조

```sql
-- 사용자 테이블
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 대화 히스토리
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    embedding_id TEXT,
    intent TEXT,
    sentiment REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- 임베딩 저장소
CREATE TABLE embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    vector BLOB NOT NULL,  -- JSON 형식의 벡터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);

-- 상담원 정보
CREATE TABLE advisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    advisor_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'online',
    assigned_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 세션 정보
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
```

---

## API 문서

### Node.js Backend APIs

#### 1. 메시지 전송
```
POST /chat
Content-Type: application/json

Request:
{
  "message": "안녕하세요",
  "userId": "user_123"
}

Response:
{
  "reply": "안녕하세요! Poly-i입니다. 무엇을 도와드릴까요?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. 대화 히스토리 조회
```
GET /chat/history?userId=user_123

Response:
{
  "userId": "user_123",
  "history": [
    {
      "id": 1,
      "user_id": "user_123",
      "message": "안녕하세요",
      "response": "안녕하세요!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Python LLM Server APIs

#### 1. 텍스트 생성
```
POST /generate
Content-Type: application/json

Request:
{
  "prompt": "Python이란?",
  "user_id": "user_123",
  "max_tokens": 512,
  "temperature": 0.7
}

Response:
{
  "response": "Python은 프로그래밍 언어입니다...",
  "tokens_used": 45,
  "model": "SOLAR-7B"
}
```

#### 2. 임베딩 생성
```
POST /embed
Content-Type: application/json

Request:
{
  "text": "안녕하세요"
}

Response:
{
  "embedding": [0.1, 0.2, 0.3, ...],
  "dimension": 384,
  "model": "all-MiniLM-L6-v2"
}
```

---

## 배포 가이드

### 로컬 개발 환경 설정

#### 1. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

#### 2. Node.js 백엔드 실행

```bash
cd backend-node
npm install
cp .env.example .env
npm run dev
# → http://localhost:5000
```

#### 3. Python LLM 서버 실행

```bash
cd backend-python
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# 모델 다운로드 후
python app.py
# → http://localhost:5001
```

### 프로덕션 배포

#### 1. Docker 구성 (권장)

```dockerfile
# backend-node/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]

# backend-python/Dockerfile
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "app.py"]
```

#### 2. docker-compose.yml

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend-node
    ports:
      - "5000:5000"
    environment:
      - PYTHON_LLM_URL=http://python-llm:5001
    depends_on:
      - python-llm
  
  python-llm:
    build: ./backend-python
    ports:
      - "5001:5001"
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### 환경 변수 설정

**frontend/.env**
```
VITE_API_URL=https://api.example.com
```

**backend-node/.env**
```
NODE_ENV=production
PORT=5000
PYTHON_LLM_URL=http://python-llm:5001
DATABASE_PATH=/data/polychat.db
```

**backend-python/.env**
```
FLASK_ENV=production
PYTHON_PORT=5001
LLM_MODEL_PATH=/models/solar-10.7b-instruct-v1.0.Q4_K_M.gguf
```

---

## 성능 최적화

### 1. 프론트엔드
- Vite 최적화 빌드
- 이미지 최적화
- 코드 스플리팅

### 2. 백엔드
- 응답 캐싱
- 데이터베이스 인덱싱
- 요청 큐잉

### 3. LLM
- 배치 처리
- 결과 캐싱
- GPU 최적화

---

## 보안 고려사항

1. **API 인증**: JWT 토큰 추가
2. **Rate Limiting**: 요청 제한
3. **HTTPS**: SSL/TLS 인증서
4. **데이터 암호화**: 민감 정보 암호화
5. **입력 검증**: XSS/SQL Injection 방지

---

## 문제 해결

### LLM 모델 로드 실패
```bash
# GPU 확인
nvidia-smi

# VRAM 부족시 더 작은 모델로 변경
# Q3_K_M (4-5GB) 또는 Q4_K_M (6-8GB)
```

### 느린 응답 속도
- GPU 레이어 수 증가
- 배치 처리 활성화
- 모델 양자화 확인

### 메모리 누수
- LLM 세션 정리
- 데이터베이스 연결 종료
- 임베딩 캐시 제한

---

## 향후 개선 계획

- [ ] Retrieval-Augmented Generation (RAG) 통합
- [ ] 실시간 협업 필터링
- [ ] 다국어 지원
- [ ] 음성 입력/출력
- [ ] 모바일 앱
- [ ] 상담원 대시보드

