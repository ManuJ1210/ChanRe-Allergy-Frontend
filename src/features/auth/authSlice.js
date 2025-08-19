import { createSlice } from '@reduxjs/toolkit';
import { loginUser } from './authThunks';
import { jwtDecode } from 'jwt-decode';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setUserFromLocal: (state) => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        // Decode JWT token to get additional user information
        let decodedToken = {};
        try {
          decodedToken = jwtDecode(storedToken);
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
        
        // Merge stored user data with JWT token data
        const userData = {
          ...JSON.parse(storedUser),
          ...decodedToken
        };
        
        state.user = userData;
        state.token = storedToken;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Decode JWT token to get additional user information
        let decodedToken = {};
        try {
          decodedToken = jwtDecode(action.payload.token);
          console.log('🔍 Auth Debug - Decoded JWT token:', decodedToken);
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
        
        // Merge user data from backend with JWT token data
        const userData = {
          ...action.payload.user,
          ...decodedToken
        };
        
        console.log('🔍 Auth Debug - Backend user data:', action.payload.user);
        console.log('🔍 Auth Debug - Merged user data:', userData);
        
        state.user = userData;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logout, setUserFromLocal } = authSlice.actions;
export default authSlice.reducer;
