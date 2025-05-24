import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RecDesState {
  value: number;
}

const initialState: RecDesState = {
  value: 0,
};

const receitasSlice = createSlice({
  name: 'receitas',
  initialState,
  reducers: {
    setReceitas(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});

const despesasSlice = createSlice({
  name: 'despesas',
  initialState,
  reducers: {
    setDespesas(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});
export const { setReceitas } = receitasSlice.actions;
export const { setDespesas } = despesasSlice.actions;
export default { receitas: receitasSlice.reducer, despesas: despesasSlice.reducer };

