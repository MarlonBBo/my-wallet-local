import { configureStore } from '@reduxjs/toolkit';
import dataCategoriaSlice from './dataCategoriaSlice';
import receitasReducer from './Rec-DesSlice';
import totalReducer from './totalSlice';

export const store = configureStore({
  reducer: {
    total: totalReducer,
    receitas: receitasReducer.receitas,
    despesas: receitasReducer.despesas,
    dataCategoria: dataCategoriaSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
