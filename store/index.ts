import { configureStore } from '@reduxjs/toolkit';
import dataCategoriaSlice from './dataCategoriaSlice';
import receitasReducer from './Rec-DesSlice';
import totalReducer from './totalSlice';
import visibilidadeReducer from './visibilidadeSlice';

export const store = configureStore({
  reducer: {
    total: totalReducer,
    receitas: receitasReducer.receitas,
    despesas: receitasReducer.despesas,
    dataCategoria: dataCategoriaSlice,
    visibilidade: visibilidadeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
