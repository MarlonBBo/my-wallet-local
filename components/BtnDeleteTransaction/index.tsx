import { useTransactionDatabase } from "@/database/useTransactionDatabase";
import { deleteTransaction } from "@/store/transactionSlice";
import { Feather } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";

export function BtnDeleteTransaction({ transactionId }: { transactionId: number }) {
  const transactionDatabase = useTransactionDatabase();
  const dispatch = useDispatch();
  const swipeableRef = useRef<Swipeable | null>(null);

  const handleDeleteTransaction = async () => {
    try {
      swipeableRef.current?.close();
      
      Alert.alert(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir esta transação?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => swipeableRef.current?.close()
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                await transactionDatabase.DeleteTransaction(transactionId);
                dispatch(deleteTransaction(transactionId));

                const [newTotal, receitas, despesas, categorias] = await Promise.all([
                  transactionDatabase.GetTotalValue(),
                  transactionDatabase.GetReceitas(),
                  transactionDatabase.GetDespesas(),
                  transactionDatabase.GetSomaPorCategoria()
                ]);

                dispatch({ type: 'total/setTotal', payload: newTotal });
                dispatch({ type: 'receitas/setReceitas', payload: receitas });
                dispatch({ type: 'despesas/setDespesas', payload: despesas });
                
                const formattedCategorias = categorias.map(item => ({
                  id: item.id,
                  titulo: item.titulo,
                  valor: item.valor,
                  cor: item.cor,
                }));
                dispatch({ type: 'dataCategoria/setDataCategoria', payload: formattedCategorias });

              } catch (error) {
                console.error("Error deleting transaction:", error);
                Alert.alert("Erro", "Não foi possível excluir a transação");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error preparing delete:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDeleteTransaction}
        style={styles.button}
      >
        <Feather name="trash-2" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  button: {
    backgroundColor: '#C2185B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 12,
  },
});