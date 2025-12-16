# Poly-i 빠른 시작 가이드

## 📦 설치 및 실행

### 1️⃣ 프론트엔드 (React + Vite)

```bash
cd frontend
npm install

# 개발 모드 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build
```

### 2️⃣ Node.js 백엔드

```bash
cd backend-node
npm install

# .env 파일 생성
cp .env.example .env

# 개발 모드 실행 (포트 5000)
npm run dev
```

### 3️⃣ Python LLM 서버

#### 필수 사항
- Python 3.10+
- CUDA 11.8+ (GPU 사용 시)
- 6-8GB VRAM (Q4_K_M 모델)

#### 설정

```bash
cd backend-python

# 가상 환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# SOLAR-7B 모델 다운로드
# https://huggingface.co/TheBloke/SOLAR-10.7B-Instruct-v1.0-GGUF
# solar-10.7b-instruct-v1.0.Q4_K_M.gguf를 models/ 폴더에 저장

# .env 파일 생성
cp .env.example .env

# 서버 실행 (포트 5001)
python app.py
```

---

## 🎨 UI 컴포넌트 가이드

### ChatContainer (메인 채팅 화면)
```jsx
<ChatContainer />
```

**Props**: 없음
**상태 관리**: Zustand (`useChatStore`)

### IPhoneFrame (아이폰 외형)
```jsx
<IPhoneFrame>
  <ChatContainer />
</IPhoneFrame>
```

### 색상 팔레트 (Tailwind)
```css
poly-blue: #0A66D2
poly-blue-light: #E8F3FF
poly-blue-dark: #004AAD
```

---

## 🔌 API 엔드포인트

### 채팅 API
```javascript
POST /chat
{
  "message": "사용자 메시지",
  "userId": "user_123"
}
```

### LLM 생성 API
```javascript
POST http://localhost:5001/generate
{
  "prompt": "프롬프트",
  "max_tokens": 512,
  "temperature": 0.7
}
```

---

## 📁 프로젝트 구조

```
poly-chat/
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── components/     # UI 컴포넌트
│   │   ├── store/          # Zustand 상태관리
│   │   ├── services/       # API 호출
│   │   └── styles/         # CSS
│   └── package.json
│
├── backend-node/           # Node.js API 서버
│   ├── src/
│   │   ├── routes/         # 라우트
│   │   ├── controllers/    # 비즈니스 로직
│   │   ├── services/       # 외부 서비스 연동
│   │   └── db/             # 데이터베이스
│   └── package.json
│
├── backend-python/         # Python LLM 서버
│   ├── src/
│   │   ├── models/         # 모델 관리
│   │   ├── services/       # LLM, 임베딩 서비스
│   │   └── routes/         # API 엔드포인트
│   ├── models/             # 모델 파일 (GGUF)
│   └── requirements.txt
│
└── docs/                   # 문서
    └── DESIGN_DOCUMENT.md  # 상세 설계 문서
```

---

## 🛠 개발 팁

### Hot Reload
- **프론트엔드**: Vite의 HMR 자동 활성화
- **Node.js**: Nodemon으로 자동 재시작
- **Python**: Flask 자동 재로드

### 디버깅
```bash
# Node.js
DEBUG=* npm run dev

# Python
FLASK_ENV=development python app.py
```

### 데이터베이스 확인
```bash
# SQLite 열기
sqlite3 data/polychat.db

# 테이블 목록
.tables

# 데이터 조회
SELECT * FROM conversations;
```

---

## ⚡ 성능 팁

1. **GPU 활용**: CUDA 설치 후 자동 감지
2. **모델 양자화**: Q4_K_M 권장 (6-8GB VRAM)
3. **캐싱**: 자주 사용되는 응답 캐시
4. **배치 처리**: 여러 요청을 모아서 처리

---

## 🐛 일반적인 문제

### VRAM 부족
```
해결: models/README.md의 더 작은 모델 사용 (Q3_K_M)
```

### 느린 응답
```
확인: nvidia-smi로 GPU 메모리 확인
해결: n_gpu_layers 값 조정 (30~40)
```

### 데이터베이스 오류
```
해결: rm -rf data/polychat.db && npm run dev
```

---

## 📚 추가 자료

- [설계 문서](./DESIGN_DOCUMENT.md)
- [SOLAR-7B 모델](https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0)
- [sentence-transformers](https://www.sbert.net/)
- [React 공식 문서](https://react.dev)
- [Flask 공식 문서](https://flask.palletsprojects.com)

