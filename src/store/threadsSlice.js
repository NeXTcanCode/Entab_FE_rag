import { createSlice } from "@reduxjs/toolkit";

const createNewThread = (
  config = { school_code: "Source", output_mode: "code" }
) => ({
  id: crypto.randomUUID(),
  // Keep the visible thread label generic so the UI can support many schools.
  title: `${config.output_mode}`,
  messages: [],
  pinned: false,
  config,
  createdAt: Date.now(),
});

const initialState = {
  items: [createNewThread()],
  activeId: null, // Will be set to the first thread's ID in index.js or on mount
};

initialState.activeId = initialState.items[0].id;

const threadsSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    addThread: (state, action) => {
      // Reuse existing empty thread if one exists
      const emptyThread = state.items.find((t) => t.messages.length === 0);
      if (emptyThread) {
        state.activeId = emptyThread.id;
        // Optionally update config if provided
        if (action.payload) {
          emptyThread.config = action.payload;
        }
        return;
      }
      const newThread = createNewThread(action.payload);
      state.items.unshift(newThread);
      state.activeId = newThread.id;
    },
    deleteThread: (state, action) => {
      const idToDelete = action.payload;
      state.items = state.items.filter((t) => t.id !== idToDelete);

      // If deleted active thread, switch to another one
      if (state.activeId === idToDelete) {
        if (state.items.length > 0) {
          state.activeId = state.items[0].id;
        } else {
          // If no threads left, create a new one automatically
          const newThread = createNewThread();
          state.items.push(newThread);
          state.activeId = newThread.id;
        }
      }
    },
    pinThread: (state, action) => {
      const thread = state.items.find((t) => t.id === action.payload);
      if (thread) {
        thread.pinned = !thread.pinned;
      }
    },
    clearAllThreads: (state, action) => {
      const { includePinned } = action.payload;
      if (includePinned) {
        const newThread = createNewThread();
        state.items = [newThread];
        state.activeId = newThread.id;
      } else {
        state.items = state.items.filter((t) => t.pinned);
        if (state.items.length === 0) {
          const newThread = createNewThread();
          state.items.push(newThread);
        }
        if (!state.items.find((t) => t.id === state.activeId)) {
          state.activeId = state.items[0].id;
        }
      }
    },
    setActiveThread: (state, action) => {
      state.activeId = action.payload;
    },
    addMessage: (state, action) => {
      const { threadId, message } = action.payload;
      const thread = state.items.find((t) => t.id === threadId);
      if (thread) {
        // Ensure message has an ID
        if (!message.id) message.id = crypto.randomUUID();
        thread.messages.push(message);
      }
    },
    updateThreadTitle: (state, action) => {
      const { id, title } = action.payload;
      const thread = state.items.find((t) => t.id === id);
      if (thread) {
        thread.title = title.length > 28 ? title.slice(0, 28) + "..." : title;
      }
    },
    updateThreadConfig: (state, action) => {
      const { id, config } = action.payload;
      const thread = state.items.find((t) => t.id === id);
      if (thread) {
        thread.config = config;
      }
    },
    setThreadSources: (state, action) => {
      const { threadId, messageId, sources } = action.payload;
      const thread = state.items.find((t) => t.id === threadId);
      if (thread) {
        const message = thread.messages.find((m) => m.id === messageId);
        if (message) {
          message.sources = sources;
        }
      }
    },
    clearThreadMessages: (state, action) => {
      const thread = state.items.find((t) => t.id === action.payload);
      if (thread) {
        thread.messages = [];
      }
    },
    restoreThread: (state, action) => {
      // Used by undo feature
      const thread = action.payload;
      if (!state.items.find((t) => t.id === thread.id)) {
        state.items.unshift(thread);
        // Sort by pinned then createdAt
        state.items.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.createdAt - a.createdAt;
        });
      }
    },
  },
});

export const {
  addThread,
  deleteThread,
  pinThread,
  clearAllThreads,
  setActiveThread,
  addMessage,
  updateThreadTitle,
  updateThreadConfig,
  setThreadSources,
  clearThreadMessages,
  restoreThread,
} = threadsSlice.actions;

export default threadsSlice.reducer;
