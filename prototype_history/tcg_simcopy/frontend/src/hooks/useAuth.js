import { useAuthStore } from '../store/gameStore.js';
import { login as apiLogin, register as apiRegister } from '../api/authApi.js';

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();

  async function login(username, password) {
    const data = await apiLogin(username, password);
    setAuth(data.access_token, data.user);
    return data;
  }

  async function register(username, password) {
    const data = await apiRegister(username, password);
    setAuth(data.access_token, data.user);
    return data;
  }

  function logout() {
    clearAuth();
  }

  return { token, user, login, register, logout };
}