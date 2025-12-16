# Poly-i

A modern web-based conversational chatbot system with iPhone UI, built with React frontend and Node.js/Python backend integration.

## Features

- **Modern UI**: iPhone-style frame with blue gradient design
- **Local LLM**: SOLAR-7B (GGUF quantized) for on-device inference
- **Chat History**: SQLite-based conversation storage and retrieval
- **Embeddings**: Semantic search with sentence-transformers
- **RESTful API**: Node.js backend with FastAPI-style Python LLM server
- **Responsive Design**: Tailwind CSS for modern styling

## Tech Stack

### Frontend
- React 18.2.0
- Vite 5.0.0
- Tailwind CSS 3.3.0
- Zustand 4.4.0

### Backend (Node.js)
- Express 4.18.2
- SQLite3 5.1.6
- Axios 1.6.0
- CORS support

### LLM Server (Python)
- Flask 3.0.0
- SOLAR-7B (Q4_K_M GGUF)
- sentence-transformers 2.2.2
- llama-cpp-python 0.2.19

## Project Structure

```
poly-i/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx       # Main chat interface
│   │   │   ├── ChatHeader.jsx          # Chat header with avatar
│   │   │   ├── ChatMessage.jsx         # Individual message component
│   │   │   └── IPhoneFrame.jsx         # iPhone UI frame
│   │   ├── store/
│   │   │   └── chatStore.js            # Zustand state management
│   │   ├── styles/
│   │   │   └── iphone.css              # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend-node/
│   ├── src/
│   │   ├── routes/
│   │   │   └── chatRoutes.js           # Chat endpoints
│   │   ├── controllers/
│   │   │   └── chatController.js       # Business logic
│   │   ├── services/
│   │   │   └── llmService.js           # LLM integration
│   │   ├── db/
│   │   │   └── database.js             # SQLite setup & helpers
│   │   └── server.js                   # Express app
│   ├── data/
│   │   └── polychat.db                 # SQLite database (generated)
│   ├── .env.example
│   └── package.json
│
├── backend-python/
│   ├── src/
│   │   ├── models/
│   │   │   └── model_manager.py        # Model initialization
│   │   ├── services/
│   │   │   ├── llm_service.py          # Text generation
│   │   │   └── embedding_service.py    # Embedding & similarity search
│   │   ├── routes/
│   │   │   ├── generate_routes.py      # /generate endpoint
│   │   │   └── embed_routes.py         # /embed endpoint
│   │   └── __init__.py
│   ├── models/
│   │   ├── README.md
│   │   └── solar-10.7b-instruct-v1.0.Q4_K_M.gguf  # (6.46GB)
│   ├── app.py                          # Flask application
│   ├── .env.example
│   ├── requirements.txt
│   └── venv/                           # Python virtual environment
│
├── docs/
│   ├── DESIGN_DOCUMENT.md              # Complete architecture & design
│   ├── QUICK_START.md                  # Getting started guide
│   ├── PROMPT_GUIDE.md                 # Prompt engineering examples
│   └── EMBEDDING_GUIDE.md              # Embedding & RAG implementation
│
└── .gitignore
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- CUDA 11.8+ (optional, for GPU acceleration)
- 6-8GB VRAM (for Q4_K_M quantized model)

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 2. Node.js Backend Setup

```bash
cd backend-node
npm install

# Create .env file
cp .env.example .env

npm run dev
# Runs on http://localhost:5000
```

### 3. Python LLM Server Setup

```bash
cd backend-python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run server
python app.py
# Runs on http://localhost:5001
```

## Configuration

### Environment Variables

**backend-node/.env**
```
NODE_ENV=development
PORT=5000
PYTHON_LLM_URL=http://localhost:5001
DATABASE_PATH=./data/polychat.db
```

**backend-python/.env**
```
FLASK_ENV=development
PYTHON_PORT=5001
LLM_MODEL_PATH=./models/solar-10.7b-instruct-v1.0.Q4_K_M.gguf
USE_GPU=True
```

> **Note**: API keys (.env files) are not tracked in Git. Use `.env.example` as template.

## API Endpoints

### Chat API (Node.js)

**POST /chat**
```json
{
  "message": "What is Python?",
  "userId": "user_123"
}
```

**GET /chat/history?userId=user_123**

### LLM Server API (Python)

**POST /generate**
```json
{
  "prompt": "Explain React",
  "max_tokens": 512,
  "temperature": 0.7
}
```

**POST /embed**
```json
{
  "text": "Sample text for embedding"
}
```

## Database Schema

### conversations
- `id`: Primary key
- `user_id`: Foreign key to users
- `message`: User message
- `response`: LLM response
- `embedding_id`: Embedding vector reference
- `created_at`: Timestamp

### users
- `id`: Primary key
- `user_id`: Unique identifier
- `name`: User name
- `email`: User email
- `created_at`: Timestamp

### embeddings
- `id`: Primary key
- `conversation_id`: Foreign key to conversations
- `text`: Original text
- `vector`: JSON-encoded embedding vector
- `created_at`: Timestamp

## Performance Optimization

### Frontend
- Vite production build
- Code splitting
- CSS purging with Tailwind

### Backend
- Response caching
- Database indexing
- Connection pooling

### LLM
- GPU layer optimization (n_gpu_layers: 40)
- Batch processing
- Model quantization (Q4_K_M)

## Development

### Running in Development Mode

All three servers support hot reload:
- **Frontend**: Vite HMR
- **Node.js**: Nodemon
- **Python**: Flask auto-reload

### Database Management

```bash
# Access SQLite
sqlite3 backend-node/data/polychat.db

# View tables
.tables

# Query conversations
SELECT * FROM conversations;
```

### Debugging

```bash
# Node.js
DEBUG=* npm run dev

# Python
FLASK_ENV=development python app.py

# Frontend
npm run dev -- --debug
```

## Deployment

### Docker

Dockerfile examples are provided in each service directory. Use docker-compose for orchestration:

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable authentication/authorization
- [ ] Configure monitoring
- [ ] Set up CI/CD pipeline

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Design Document](docs/DESIGN_DOCUMENT.md) - Architecture, database schema, API specs
- [Quick Start](docs/QUICK_START.md) - Setup and basic usage
- [Prompt Guide](docs/PROMPT_GUIDE.md) - Prompt engineering strategies
- [Embedding Guide](docs/EMBEDDING_GUIDE.md) - RAG implementation details

## Troubleshooting

### VRAM Issues
If you run out of VRAM, use a smaller quantization:
- Q3_K_M (4-5GB)
- Q4_K_M (6-8GB) - current
- Q5_K_M (10GB)

### Slow Response
- Check GPU allocation: `nvidia-smi`
- Increase `n_gpu_layers` in `model_manager.py`
- Verify CUDA installation

### Database Lock
```bash
# Remove and recreate database
rm backend-node/data/polychat.db
npm run dev
```

## Model Information

**SOLAR-7B (Upstage)**
- Model: Instruction-tuned LLaMA variant
- Size: 7B parameters
- Quantization: Q4_K_M (GGUF)
- Context Length: 4096 tokens
- License: Apache 2.0

Download: https://huggingface.co/TheBloke/SOLAR-10.7B-Instruct-v1.0-GGUF

## Contributing

Contributions are welcome. Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is open source and available under the MIT License.

## Author

[@susie1214](https://github.com/susie1214)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
