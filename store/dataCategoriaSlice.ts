import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoriaData {
  categoria: string;
  amount: number;
  cor: string
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
  },
});

export const { setDataCategoria } = dataCategoriaSlice.actions;
export default dataCategoriaSlice.reducer;
