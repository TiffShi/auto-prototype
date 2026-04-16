import React, { useState, useRef } from 'react';

export default function ChatInput({ username, onSend, onChangeUsername }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    const sent = onSend(text.trim());
    if (sent !== false) {
      setText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-username-row">
        <span className="chat-input-as">Chatting as </span>
        <button className="chat-input-username-btn" onClick={onChangeUsername}>
          {username} ✏️
        </button>
      </div>
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="form-input chat-input"
          type="text"
          placeholder="Send a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}