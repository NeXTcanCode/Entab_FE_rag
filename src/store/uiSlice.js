import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  sourceSheetOpen: false,
  activeSourceMessage: null, // { threadId, messageId }
  chatQuote: null, // { threadId, text, path }
  toast: null, // { message: '...', undoId: 'uuid' }
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state, action) => {
      state.sidebarOpen = action.payload ?? !state.sidebarOpen;
    },
    toggleSourceSheet: (state, action) => {
      state.sourceSheetOpen = action.payload ?? !state.sourceSheetOpen;
    },
    setActiveSource: (state, action) => {
      state.activeSourceMessage = action.payload; // { threadId, messageId }
      if (action.payload) {
        state.sourceSheetOpen = true; // Auto open sheet on mobile when source clicked
      }
    },
    setChatQuote: (state, action) => {
      state.chatQuote = action.payload;
    },
    showToast: (state, action) => {
      state.toast = action.payload; // { message, undoId }
    },
    clearToast: (state) => {
      state.toast = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  toggleSourceSheet,
  setActiveSource,
  setChatQuote,
  showToast,
  clearToast,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
