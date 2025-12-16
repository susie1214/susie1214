import express from 'express';
import { handleChat, getHistory } from '../controllers/chatController.js';

const router = express.Router();

/**
 * POST /chat
 * 사용자 메시지를 받고 LLM 응답을 반환
 */
router.post('/', handleChat);

/**
 * GET /chat/history?userId=xxx
 * 사용자의 대화 히스토리 조회
 */
router.get('/history', getHistory);

export default router;
