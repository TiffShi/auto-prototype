import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';
import '../../styles/chat.css';

export default function ChatBox({ streamId, messages, username, onSaveUsername, onSendMessage }) {
  const [usernameInput, setUsernameInput] = useState(username || '');
  const [usernameSaved, setUsernameSaved] = useState(!!username);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveUsername = () => {
    if (usernameInput.trim()) {
      onSaveUsername(usernameInput.trim());
      setUsernameSaved(true);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-box-header">
        <span className="chat-box-title">💬 Live Chat</span>
        <span className="chat-box-count">{messages.length} messages</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.message_id}
            message={msg}
            isOwn={msg.username === username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!usernameSaved ? (
        <div className="chat-username-setup">
          <p className="chat-username-prompt">Choose a chat name to join:</p>
          <div className="chat-username-row">
            <input
              className="form-input chat-username-input"
              type="text"
              placeholder="Your name..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
              maxLength={30}
            />
            <button
              className="btn btn-primary"
              onClick={handleSaveUsername}
              disabled={!usernameInput.trim()}
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <ChatInput
          username={username}
          onSend={onSendMessage}
          onChangeUsername={() => setUsernameSaved(false)}
        />
      )}
    </div>
  );
}