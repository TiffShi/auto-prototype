import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/gameStore.js';

const WS_URL = import.meta.env.VITE_WS_URL;

export function useGameSocket(roomCode) {
  const wsRef = useRef(null);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { setGameState, setConnectionStatus, setErrorMessage, setWinner } = useGameStore();

  const connect = useCallback(() => {
    if (!roomCode || !token) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(`${WS_URL}/ws/game/${roomCode}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      // Send auth as first message
      ws.send(JSON.stringify({ action: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'state_update') {
          setGameState(data.game_state, user?.id);
        } else if (data.event === 'game_over') {
          setWinner(data.winner);
          setGameState(
            { ...useGameStore.getState().gameState, winner: data.winner, status: 'finished' },
            user?.id
          );
        } else if (data.event === 'error') {
          setErrorMessage(data.message);
          setTimeout(() => setErrorMessage(null), 4000);
        } else if (data.event === 'waiting') {
          setConnectionStatus('waiting');
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('error');
      setErrorMessage('WebSocket connection error');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };
  }, [roomCode, token, user, setGameState, setConnectionStatus, setErrorMessage, setWinner]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendAction = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const playCard = useCallback(
    (instanceId, targetId = null) => {
      sendAction({ action: 'play_card', instance_id: instanceId, target_id: targetId });
    },
    [sendAction]
  );

  const attackAction = useCallback(
    (attackerId, targetId = null) => {
      sendAction({ action: 'attack', attacker_id: attackerId, target_id: targetId });
    },
    [sendAction]
  );

  const endTurn = useCallback(() => {
    sendAction({ action: 'end_turn' });
  }, [sendAction]);

  const requestState = useCallback(() => {
    sendAction({ action: 'get_state' });
  }, [sendAction]);

  return { playCard, attackAction, endTurn, requestState };
}