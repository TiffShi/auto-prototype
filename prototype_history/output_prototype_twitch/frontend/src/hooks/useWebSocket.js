import { useRef, useCallback, useEffect, useState } from 'react';

export function useWebSocket(url, { onMessage, onOpen, onClose, onError } = {}) {
  const wsRef = useRef(null);
  const [readyState, setReadyState] = useState(WebSocket.CLOSED);
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!url) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setReadyState(WebSocket.OPEN);
      onOpen?.();
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(evt.data);
        onMessage?.(data);
      } catch {
        onMessage?.(evt.data);
      }
    };

    ws.onclose = (evt) => {
      if (!mountedRef.current) return;
      setReadyState(WebSocket.CLOSED);
      onClose?.(evt);
    };

    ws.onerror = (evt) => {
      if (!mountedRef.current) return;
      onError?.(evt);
    };

    setReadyState(WebSocket.CONNECTING);
  }, [url, onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setReadyState(WebSocket.CLOSED);
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, send, readyState };
}