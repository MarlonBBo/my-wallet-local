import { CategoriaProps } from '@/database/useTransactionDatabase';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataCategoriaState {
  lista: CategoriaProps[];
  oneCategoria: CategoriaProps;
}

const initialState: DataCategoriaState = {
  lista: [],
  oneCategoria: {
    id: 0,
    titulo: '',
    cor: '#000000',
    valor: 0,
  },
};

const dataCategoriaSlice = createSlice({
  name: 'dataCategoria',
  initialState,
  reducers: {
    setOneCategoria(state, action: PayloadAction<CategoriaProps>) {
      state.oneCategoria = action.payload;
    },
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

export const { setDataCategoria, addCategoria, removeCategoria, setOneCategoria } = dataCategoriaSlice.actions;
export default dataCategoriaSlice.reducer;
