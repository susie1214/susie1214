import React from 'react';

// 간단한 마크다운 포맷팅
const formatMessage = (text) => {
  return text
    .split('\n')
    .map((line, idx) => {
      // 헤더 포맷
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-sm mt-2 text-gray-800">{line.slice(3)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={idx}>{line.slice(2, -2)}</strong>;
      }
      // 리스트 포맷
      if (line.startsWith('- ')) {
        return <div key={idx} className="ml-3 text-sm">• {line.slice(2)}</div>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return <div key={idx} className="ml-3 text-sm">{line}</div>;
      }
      return <div key={idx} className="text-sm">{line || ' '}</div>;
    });
};

export default function ChatMessage({ message }) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-poly-blue text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <div className={`break-words leading-relaxed ${isUser ? '' : ''}`}>
          {isUser ? message.text : formatMessage(message.text)}
        </div>
        <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
