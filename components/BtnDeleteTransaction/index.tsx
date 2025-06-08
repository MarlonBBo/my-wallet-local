import { useTransactionDatabase } from "@/database/useTransactionDatabase";
import { deleteTransaction } from "@/store/transactionSlice";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";

export function BtnDeleteTransaction({ transactionId }: { transactionId: number }) {
  const transactionDatabase = useTransactionDatabase();
  const dispatch = useDispatch();

  const handleDeleteTransaction = async () => {
    try {
      await transactionDatabase.DeleteTransaction(transactionId);
      dispatch(deleteTransaction(transactionId));

      const newTotal = await transactionDatabase.GetTotalValue();
      dispatch({ type: 'total/setTotal', payload: newTotal });

      const newTotalReceitas = await transactionDatabase.GetReceitas();
      dispatch({ type: 'receitas/setReceitas', payload: newTotalReceitas });

      const newTotalDespesas = await transactionDatabase.GetDespesas();
      dispatch({ type: 'despesas/setDespesas', payload: newTotalDespesas });

      const newDataCategoriaRaw = await transactionDatabase.GetSomaPorCategoria();
      const newDataCategoria = newDataCategoriaRaw.map((item) => ({
        id: item.id,
        titulo: item.titulo,
        valor: item.valor,
        cor: item.cor,
      }));
      dispatch({ type: 'dataCategoria/setDataCategoria', payload: newDataCategoria });

      console.log("Transação excluída com sucesso!");

    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Erro ao excluir transação. Tente novamente.");
    }
  };

  return (
    <TouchableOpacity onPress={handleDeleteTransaction}
      style={{
        width: 50,
        height: '87%',
        backgroundColor: '#C2185B',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
      }}
    >
        <Feather name="trash-2" size={24} color="#FFF" />
      
    </TouchableOpacity>
  );
}
