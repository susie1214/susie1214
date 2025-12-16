import axios from 'axios';

const PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || 'http://localhost:5001';

/**
 * Python LLM 서버로 메시지 전송 (한국어/영어 지원)
 * @param {string} message - 사용자 메시지
 * @param {string} userId - 사용자 ID
 * @param {string} language - 언어 ('ko' 또는 'en')
 * @returns {Promise<string>} - LLM 응답
 */
export const getLLMResponse = async (message, userId = 'default', language = 'ko') => {
  try {
    const response = await axios.post(`${PYTHON_LLM_URL}/generate`, {
      prompt: message,
      user_id: userId,
      max_tokens: 256,
      temperature: 0.7,
      language: language,
    });

    return response.data.response;
  } catch (error) {
    console.error('LLM Error:', error.message);
    throw new Error('Failed to get LLM response');
  }
};

/**
 * 텍스트 임베딩 생성
 * @param {string} text - 임베딩할 텍스트
 * @returns {Promise<Array<number>>} - 임베딩 벡터
 */
export const getEmbedding = async (text) => {
  try {
    const response = await axios.post(`${PYTHON_LLM_URL}/embed`, {
      text: text,
    });

    return response.data.embedding;
  } catch (error) {
    console.error('Embedding Error:', error.message);
    return null;
  }
};

/**
 * 의도 분석 (Intent Recognition)
 * @param {string} message - 분석할 메시지
 * @returns {Promise<Object>} - 의도 분석 결과
 */
export const analyzeIntent = async (message) => {
  try {
    const response = await axios.post(`${PYTHON_LLM_URL}/intent`, {
      text: message,
    });

    return response.data;
  } catch (error) {
    console.error('Intent Analysis Error:', error.message);
    return { intent: 'general', confidence: 0 };
  }
};
