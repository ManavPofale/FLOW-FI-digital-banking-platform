import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Helper to safely parse JSON from localStorage
const loadState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, isAuthenticated: false };
  }
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      return {
        user: JSON.parse(user),
        accessToken: token,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error('Failed to load auth state from local storage', e);
  }
  return { user: null, accessToken: null, isAuthenticated: false };
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.accessToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
