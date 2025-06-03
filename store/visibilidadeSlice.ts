import { createSlice } from '@reduxjs/toolkit';

interface VisibilidadeState {
  mostrarValores: boolean;
}

const initialState: VisibilidadeState = {
  mostrarValores: true,
};

const visibilidadeSlice = createSlice({
  name: 'visibilidade',
  initialState,
  reducers: {
    toggleVisibilidade(state) {
      state.mostrarValores = !state.mostrarValores;
    },
  },
});

export const { toggleVisibilidade } = visibilidadeSlice.actions;
export default visibilidadeSlice.reducer;
