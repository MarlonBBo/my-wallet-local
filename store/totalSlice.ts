import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TotalState {
  value: number;
}

const initialState: TotalState = {
  value: 0,
};

const totalSlice = createSlice({
  name: 'total',
  initialState,
  reducers: {
    setTotal(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});

export const { setTotal } = totalSlice.actions;
export default totalSlice.reducer;
