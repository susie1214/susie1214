import { getLLMResponse } from '../services/llmService.js';
import { saveConversation, getConversationHistory } from '../db/database.js';

const SYSTEM_PROMPTS = {
  ko: `당신은 **Poly-i**라는 친절한 상담 챗봇입니다.

## 역할
- 사용자의 질문에 정확하고 도움이 되는 답변 제공
- 마크다운 형식으로 간결하게 작성
- 예: ## 제목, **굵은글자**, - 리스트 사용

## 응답 규칙
- 3-5줄 정도로 간결하게
- 마크다운 형식 사용
- 정중한 한국어 사용`,
  
  en: `You are a friendly counseling chatbot called **Poly-i**.

## Role
- Provide accurate and helpful answers
- Use markdown format for clarity
- Examples: ## Title, **bold**, - lists

## Response Rules
- Keep it concise (3-5 lines)
- Use markdown format
- Professional English`
};

export const handleChat = async (req, res) => {
  try {
    const { message, userId = 'default', language = 'ko' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 언어별 프롬프트와 함께 LLM에 요청
    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.ko;
    const fullPrompt = `${systemPrompt}\n\n사용자 메시지: ${message}`;
    
    const reply = await getLLMResponse(fullPrompt, userId, language);

    // 대화 저장
    await saveConversation(userId, message, reply);

    res.json({
      reply: reply,
      timestamp: new Date().toISOString(),
      language: language,
    });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message,
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { userId = 'default' } = req.query;

    const history = await getConversationHistory(userId);

    res.json({
      userId: userId,
      history: history,
    });
  } catch (error) {
    console.error('History Controller Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
