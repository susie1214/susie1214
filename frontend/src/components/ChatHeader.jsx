import React from 'react';
import { FiSettings, FiMenu } from 'react-icons/fi';

export default function ChatHeader() {
  return (
    <div className="bg-gradient-to-r from-poly-blue to-poly-blue-dark text-white p-4 rounded-t-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h1 className="font-bold text-base">Poly-i</h1>
            <p className="text-xs opacity-90">온라인 · 항상 도움됨</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-white/20 rounded-full transition">
            <FiSettings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition">
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
