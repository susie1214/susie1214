import { getLLMResponse } from '../services/llmService.js';
import { saveConversation, getConversationHistory } from '../db/database.js';

const SYSTEM_PROMPTS = {
  ko: `당신은 프로그램 운영을 지원하는 친절한 안내 챗봇 Poly-i입니다.

## 프로그램 정보

### 📋 출석 및 교통비 안내
- **출석비**: 1일 3,300원 (월 6만6천원 한도)
- **취약계층 출석비**: 1일 1만원 (월 20만원 한도)
- **교통비**: 1일 2,500원 (월 5만원 한도)
- **지급조건**: 단위기간 1개월 동안 출석률 80% 이상이어야 함
- **지급시기**: 다음달 중순경 개인계좌로 입금

### 📍 수업 운영
- **수업 시작시간**: 오전 9시
- **출석체크**: 교수님이 직접 확인

### 🏢 시설 안내
- **2층**: 도서관 (행정실 포함)
- **1층**: 도시락 섭취 공간 (구내 식당 없음)
- **편의시설**: 냉장고, 전자렌지, 정수기

## 대답 방식
- 사용자의 질문에 정확하고 친절하게 답변
- 마크다운 형식으로 정보를 정리
- 출석비/교통비 관련 질문 시 구체적인 금액과 조건 명시`,
  
  en: `You are Poly-i, a friendly program support chatbot.

## Program Information

### 📋 Attendance & Transportation Allowance
- **Attendance**: 3,300 won/day (Max 66,000 won/month)
- **Low-income Attendance**: 10,000 won/day (Max 200,000 won/month)
- **Transportation**: 2,500 won/day (Max 50,000 won/month)
- **Requirement**: 80% or higher monthly attendance rate
- **Payment**: Mid-next month to personal account

### 📍 Classes & Operations
- **Start Time**: 9:00 AM
- **Attendance Check**: Instructor verification

### 🏢 Facilities
- **Floor 2**: Library (with Administration Office)
- **Floor 1**: Lunch Area (No cafeteria available)
- **Amenities**: Refrigerator, Microwave, Water purifier

## Response Style
- Provide accurate and helpful answers
- Use markdown format for clarity
- Specify exact amounts and conditions for allowance inquiries`
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
