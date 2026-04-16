import { useCallback, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext.jsx';

export function useChat({ getWs, streamId }) {
  const { messages, username, addMessage, setMessages, clearMessages, saveUsername } =
    useChatContext();
  const wsRef = useRef(null);

  // Attach message handler to the shared WS
  const attachToWs = useCallback(
    (ws) => {
      wsRef.current = ws;
    },
    []
  );

  const handleIncomingMessage = useCallback(
    (msg) => {
      if (msg.type === 'connected' && msg.payload?.chat_history) {
        setMessages(msg.payload.chat_history);
      }
      if (msg.type === 'chat') {
        addMessage(msg.payload);
      }
    },
    [addMessage, setMessages]
  );

  const sendMessage = useCallback(
    (content) => {
      const ws = getWs?.();
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      if (!content.trim() || !username.trim()) return false;

      ws.send(
        JSON.stringify({
          type: 'chat',
          payload: {
            username: username.trim(),
            content: content.trim(),
          },
        })
      );
      return true;
    },
    [getWs, username]
  );

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [streamId, clearMessages]);

  return {
    messages,
    username,
    saveUsername,
    sendMessage,
    handleIncomingMessage,
  };
}