import { create } from 'zustand';

interface User { id: number; userid: string; name: string; role: string; }
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  hydrate: () => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) set({ token: t, user: JSON.parse(u) });
  },
}));
