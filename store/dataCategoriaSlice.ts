import { CategoriaProps } from '@/database/useTransactionDatabase';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataCategoriaState {
  lista: CategoriaProps[];
}

const initialState: DataCategoriaState = {
  lista: []
};

const dataCategoriaSlice = createSlice({
  name: 'dataCategoria',
  initialState,
  reducers: {
    setDataCategoria(state, action: PayloadAction<CategoriaProps[]>) {
      state.lista = action.payload;
    },
    addCategoria(state, action: PayloadAction<CategoriaProps>) {
      state.lista.push(action.payload);
    },
    removeCategoria(state, action: PayloadAction<number>) {
      state.lista = state.lista.filter((cat) => cat.id !== action.payload);
    },
  },
});

export const { setDataCategoria, addCategoria, removeCategoria } = dataCategoriaSlice.actions;
export default dataCategoriaSlice.reducer;
