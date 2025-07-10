import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TransactionProps {
  id: number;
  value: number;
  type: 'entrada' | 'saida';
  titleEntrada?: string,
  category: { id: number; titulo: string };
  date: string;
}

interface TransactionState {
  transactions: TransactionProps[];
}

interface ValorState {
  value: number;
}

const initialTransactionState: TransactionState = {
  transactions: [],
};

const initialValorState: ValorState = {
  value: 0,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: initialTransactionState,
  reducers: {
    setTransactions(state, action: PayloadAction<TransactionProps[]>) {
      state.transactions = action.payload;
    },
    addTransaction(state, action: PayloadAction<TransactionProps>) {
      state.transactions.push(action.payload);
    },
    editTransaction(state, action: PayloadAction<TransactionProps>) {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction(state, action: PayloadAction<number>) {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
  },
});

const totalSlice = createSlice({
  name: 'total',
  initialState: initialValorState,
  reducers: {
    setTotal(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});

const receitasSlice = createSlice({
  name: 'receitas',
  initialState: initialValorState,
  reducers: {
    setReceitas(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});

const despesasSlice = createSlice({
  name: 'despesas',
  initialState: initialValorState,
  reducers: {
    setDespesas(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
} = transactionSlice.actions;

export const { setTotal } = totalSlice.actions;
export const { setReceitas } = receitasSlice.actions;
export const { setDespesas } = despesasSlice.actions;

export const reducersTransactions  = {
  transactions: transactionSlice.reducer,
  total: totalSlice.reducer,
  receitas: receitasSlice.reducer,
  despesas: despesasSlice.reducer,
};
