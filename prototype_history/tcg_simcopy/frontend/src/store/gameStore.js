import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'tcg-auth',
    }
  )
);

export const useGameStore = create((set, get) => ({
  gameState: null,
  roomCode: null,
  isMyTurn: false,
  myPlayerKey: null,
  gameLog: [],
  winner: null,
  connectionStatus: 'disconnected',
  errorMessage: null,

  setRoomCode: (code) => set({ roomCode: code }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setErrorMessage: (msg) => set({ errorMessage: msg }),

  setGameState: (state, myUserId) => {
    if (!state) return;
    const myPlayerKey =
      state.player1?.user_id === myUserId
        ? 'player1'
        : state.player2?.user_id === myUserId
        ? 'player2'
        : null;
    const isMyTurn = state.turn === myPlayerKey;
    set({
      gameState: state,
      myPlayerKey,
      isMyTurn,
      gameLog: state.game_log || [],
      winner: state.winner || null,
    });
  },

  setWinner: (winner) => set({ winner }),

  resetGame: () =>
    set({
      gameState: null,
      roomCode: null,
      isMyTurn: false,
      myPlayerKey: null,
      gameLog: [],
      winner: null,
      connectionStatus: 'disconnected',
      errorMessage: null,
    }),
}));