// src/redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions; // 👈 MAKE SURE this line exists

export default userSlice.reducer;
