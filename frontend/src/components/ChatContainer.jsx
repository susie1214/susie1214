import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiMic } from 'react-icons/fi';
import useChatStore from '@/store/chatStore';
import ChatMessage from './ChatMessage';
import ChatHeader from './ChatHeader';

const PROMPTS = {
  ko: {
    welcome: "안녕하세요! 저는 **Poly-i**입니다.",
    subtitle: "궁금한 점이 있으면 편하게 물어봐주세요!",
    placeholder: "메시지를 입력하세요...",
    error: "죄송합니다. 오류가 발생했습니다.",
  },
  en: {
    welcome: "Hello! I'm **Poly-i**.",
    subtitle: "Feel free to ask me anything!",
    placeholder: "Type a message...",
    error: "Sorry, an error occurred.",
  }
};

export default function ChatContainer() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const { messages, addMessage, language, setLanguage } = useChatStore();

  // STT 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ko' ? 'ko-KR' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // 사용자 메시지 추가
    addMessage({
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date().toISOString(),
    });

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputValue,
          language: language 
        }),
      });

      const data = await response.json();
      
      addMessage({
        id: Date.now() + 1,
        type: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: Date.now() + 1,
        type: 'assistant',
        text: PROMPTS[language].error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('STT not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 + 언어 선택 */}
      <div className="flex items-center justify-between">
        <ChatHeader />
        <div className="pr-4 flex gap-2">
          <button
            onClick={() => setLanguage('ko')}
            className={`px-3 py-1 rounded text-sm ${
              language === 'ko'
                ? 'bg-poly-blue text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            한글
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded text-sm ${
              language === 'en'
                ? 'bg-poly-blue text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ENG
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-3">💬</div>
            <h2 className="text-xl font-bold text-gray-800">{PROMPTS[language].welcome}</h2>
            <p className="text-gray-500 mt-2 text-sm">{PROMPTS[language].subtitle}</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-poly-blue text-white rounded-2xl rounded-bl-none px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-3">
        <div className="flex gap-2 items-end">
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2 rounded-full transition ${
              isListening
                ? 'bg-red-500 text-white'
                : 'hover:bg-poly-blue-light text-poly-blue'
            }`}
          >
            <FiMic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={PROMPTS[language].placeholder}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-poly-blue focus:border-transparent text-sm"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-poly-blue hover:bg-poly-blue-dark text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
