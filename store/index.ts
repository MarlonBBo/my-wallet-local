import { configureStore } from '@reduxjs/toolkit';
import totalReducer from './totalSlice';

export const store = configureStore({
  reducer: {
    total: totalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
