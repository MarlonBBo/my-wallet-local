import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoriaData {
  id: number;
  titulo: string;
  valor: number;
  cor: string;
}

interface DataCategoriaState {
  lista: CategoriaData[];
}

const initialState: DataCategoriaState = {
  lista: [],
};

const dataCategoriaSlice = createSlice({
  name: 'dataCategoria',
  initialState,
  reducers: {
    setDataCategoria(state, action: PayloadAction<CategoriaData[]>) {
      state.lista = action.payload;
    },
    addCategoria(state, action: PayloadAction<CategoriaData>) {
      state.lista.push(action.payload);
    },
    removeCategoria(state, action: PayloadAction<number>) {
      state.lista = state.lista.filter((cat) => cat.id !== action.payload);
    },
  },
});

export const { setDataCategoria, addCategoria, removeCategoria } = dataCategoriaSlice.actions;
export default dataCategoriaSlice.reducer;
