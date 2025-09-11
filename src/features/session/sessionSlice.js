import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSession: null,
  userSessions: [],
  allSessions: [],
  sessionStats: null,
  loading: false,
  error: null,
  lastActivity: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    updateLastActivity: (state, action) => {
      state.lastActivity = action.payload;
    },
    clearSessions: (state) => {
      state.userSessions = [];
      state.allSessions = [];
      state.currentSession = null;
      state.sessionStats = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Session
      .addCase('session/createSession/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/createSession/fulfilled', (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.error = null;
      })
      .addCase('session/createSession/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get User Sessions
      .addCase('session/getUserSessions/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/getUserSessions/fulfilled', (state, action) => {
        state.loading = false;
        state.userSessions = action.payload;
        state.error = null;
      })
      .addCase('session/getUserSessions/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get All Sessions (Superadmin)
      .addCase('session/getAllSessions/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/getAllSessions/fulfilled', (state, action) => {
        state.loading = false;
        state.allSessions = action.payload;
        state.error = null;
      })
      .addCase('session/getAllSessions/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Session Stats
      .addCase('session/getSessionStats/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/getSessionStats/fulfilled', (state, action) => {
        state.loading = false;
        state.sessionStats = action.payload;
        state.error = null;
      })
      .addCase('session/getSessionStats/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout Session
      .addCase('session/logoutSession/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/logoutSession/fulfilled', (state, action) => {
        state.loading = false;
        // Remove logged out session from userSessions
        state.userSessions = state.userSessions.filter(
          session => session.sessionId !== action.payload.sessionId
        );
        state.error = null;
      })
      .addCase('session/logoutSession/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Force Logout User Sessions
      .addCase('session/forceLogoutUserSessions/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('session/forceLogoutUserSessions/fulfilled', (state, action) => {
        state.loading = false;
        // Remove all sessions for the user
        state.userSessions = [];
        state.error = null;
      })
      .addCase('session/forceLogoutUserSessions/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setCurrentSession, 
  updateLastActivity, 
  clearSessions, 
  setLoading, 
  setError 
} = sessionSlice.actions;

export default sessionSlice.reducer;
