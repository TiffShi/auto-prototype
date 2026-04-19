import React from 'react';

export default function ChatMessage({ message, isOwn }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-message ${isOwn ? 'chat-message--own' : ''}`}>
      <span
        className="chat-message-username"
        style={{ color: message.color || '#9b59b6' }}
      >
        {message.username}
      </span>
      <span className="chat-message-time">{time}</span>
      <p className="chat-message-content">{message.content}</p>
    </div>
  );
}