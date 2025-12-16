import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  language: 'ko', // 'ko' | 'en'
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  setLanguage: (lang) => set({ language: lang }),
}));

export default useChatStore;
