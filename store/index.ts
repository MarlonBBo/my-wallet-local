import { configureStore } from '@reduxjs/toolkit';
import dataCategoriaSlice from './dataCategoriaSlice';
import { reducersTransactions } from './transactionSlice';
import visibilidadeReducer from './visibilidadeSlice';

export const store = configureStore({
  reducer: {
    ...reducersTransactions, 
    dataCategoria: dataCategoriaSlice,
    visibilidade: visibilidadeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
