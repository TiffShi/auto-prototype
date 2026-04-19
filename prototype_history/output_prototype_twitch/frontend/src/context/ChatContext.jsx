import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(
    () => localStorage.getItem('chat_username') || ''
  );

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Avoid duplicates by message_id
      if (prev.some((m) => m.message_id === msg.message_id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const setMessages_ = useCallback((msgs) => {
    setMessages(msgs);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const saveUsername = useCallback((name) => {
    setUsername(name);
    localStorage.setItem('chat_username', name);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        username,
        addMessage,
        setMessages: setMessages_,
        clearMessages,
        saveUsername,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}