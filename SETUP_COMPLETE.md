# Poly-i 프로젝트 - 최종 설정 및 실행 가이드

## ✅ 완료된 사항

### 1. 프로젝트 구조
- ✅ README.md 작성 (깔끔한 개발자 스타일)
- ✅ .gitignore 설정 (.env 파일 제외)
- ✅ 프로젝트 폴더 구조 정리

### 2. 모델 검증
- ✅ SOLAR-7B 모델 확인: `C:\polychat\backend-python\models\solar-10.7b-instruct-v1.0.Q4_K_M.gguf` (6.02GB)
- ✅ 모델 성공적으로 로드됨
- ✅ Embedding 모델 (all-MiniLM-L6-v2) 로드됨

### 3. 환경 변수 설정
- ✅ backend-node/.env 생성
- ✅ backend-python/.env 생성
- ✅ 루트 .env 파일 생성 (OpenAI API KEY 포함)

### 4. 패키지 설치
- ✅ Node.js 패키지 설치 (frontend, backend-node)
- ✅ Python 패키지 설치 (venv에서)
  - Flask, sentence-transformers, llama-cpp-python 등

### 5. 서버 실행 확인
- ✅ Python Flask LLM Server (포트 5001) - SOLAR-7B 로드됨
- ✅ Node.js Express API (포트 5000) - SQLite 연결됨
- ✅ React Vite Frontend (포트 3001) - 실행 중

---

## 🚀 실행 방법

### 터미널 1: Python LLM 서버
```bash
cd C:\polychat\backend-python
.\venv\Scripts\python app.py
```
**기대 출력:**
```
✅ SOLAR-7B Model loaded successfully
✅ Embedding Model loaded
🚀 Running on http://127.0.0.1:5001
```

### 터미널 2: Node.js API 서버
```bash
cd C:\polychat\backend-node
npm run dev
```
**기대 출력:**
```
✅ SQLite Database connected
🚀 Server running on http://localhost:5000
```

### 터미널 3: React 프론트엔드
```bash
cd C:\polychat\frontend
npm run dev
```
**기대 출력:**
```
VITE ready in ... ms
➜  Local:   http://localhost:3001/
```

---

## 🌐 접근 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:3001 | Poly-i 아이폰 UI |
| API | http://localhost:5000 | Node.js REST API |
| LLM Server | http://localhost:5001 | Python Flask LLM |
| Health Check | http://localhost:5000/health | 서버 상태 확인 |
| LLM Info | http://localhost:5001/info | LLM 모델 정보 |

---

## 📁 환경 변수 파일 위치

### backend-node/.env
```
NODE_ENV=development
PORT=5000
PYTHON_LLM_URL=http://localhost:5001
DATABASE_PATH=./data/polychat.db
```

### backend-python/.env
```
FLASK_ENV=development
PYTHON_PORT=5001
LLM_MODEL_PATH=./models/solar-10.7b-instruct-v1.0.Q4_K_M.gguf
USE_GPU=True
```

### 루트 .env (선택사항)
```
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
```

> **⚠️ 주의**: .env 파일은 Git에 커밋되지 않습니다. (.gitignore 참고)

---

## 🔧 문제 해결

### Port Already In Use
```bash
# 포트 찾기 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# 또는 다른 포트 사용
```

### SOLAR-7B 모델 로드 실패
```bash
# 모델 경로 확인
Test-Path C:\polychat\backend-python\models\solar-10.7b-instruct-v1.0.Q4_K_M.gguf

# 모델 다운로드 경로: 
# https://huggingface.co/TheBloke/SOLAR-10.7B-Instruct-v1.0-GGUF
```

### 데이터베이스 에러
```bash
# data 폴더 생성 확인
Test-Path C:\polychat\backend-node\data

# 폴더 없으면 생성
mkdir C:\polychat\backend-node\data
```

---

## 📊 기술 스택 확인

```bash
# Node.js 버전
node --version

# Python 버전  
python --version

# npm 버전
npm --version

# pip 패키지 확인
C:\polychat\backend-python\venv\Scripts\pip list | findstr -E "flask|sentence|torch|llama"
```

---

## 🔄 다음 단계

1. **API 테스트**
   - Postman 또는 curl로 API 엔드포인트 테스트
   - 채팅 기능 동작 확인

2. **UI 개선**
   - 프롬프트 엔지니어링 (docs/PROMPT_GUIDE.md)
   - 임베딩/RAG 통합 (docs/EMBEDDING_GUIDE.md)

3. **배포**
   - Docker 이미지 생성
   - 클라우드 배포 (AWS, GCP, Azure 등)

4. **모니터링**
   - 로그 수집
   - 성능 모니터링

---

## 📚 문서 참고

- [README.md](./README.md) - 프로젝트 개요
- [DESIGN_DOCUMENT.md](./docs/DESIGN_DOCUMENT.md) - 아키텍처 & 설계
- [QUICK_START.md](./docs/QUICK_START.md) - 빠른 시작 가이드
- [PROMPT_GUIDE.md](./docs/PROMPT_GUIDE.md) - 프롬프트 작성법
- [EMBEDDING_GUIDE.md](./docs/EMBEDDING_GUIDE.md) - RAG 구현

---

## 📝 마지막 체크리스트

- [x] README.md 작성
- [x] .gitignore 설정
- [x] .env 파일 생성 (API KEY 보호)
- [x] 모델 검증 (6.46GB GGUF)
- [x] Python 환경 설정
- [x] 모든 서버 실행 확인
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 UI 테스트
- [ ] Git 저장소 초기화 및 커밋

---

**작성일**: 2025-12-16  
**프로젝트**: Poly-i Chatbot System  
**상태**: ✅ 개발 환경 구축 완료
