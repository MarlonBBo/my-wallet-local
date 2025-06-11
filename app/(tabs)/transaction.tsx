import { BtnDeleteTransaction } from '@/components/BtnDeleteTransaction';
import { RootState } from '@/store';
import { setTransactions } from '@/store/transactionSlice';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { formatarValor } from '.';
import { useTransactionDatabase } from '../../database/useTransactionDatabase';

export default function Transaction() {

  const dispatch = useDispatch();

  const mostrarValores = useSelector((state: RootState) => state.visibilidade.mostrarValores);
  const transactionDatabase = useTransactionDatabase();

  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  const abrirAcoes = (id: number) => {
    swipeableRefs.current[id]?.openRight?.();
  };

    useFocusEffect(
    useCallback(() => {
      async function fetchTransactions() {
        const result = await transactionDatabase.GetTransactions();
        dispatch({type: setTransactions.type, payload: result});
      }
      fetchTransactions();
    }, [])
  );

  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={30} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transações</Text>
    </View>

    <View style={{flex: 1, paddingTop: 10, backgroundColor: '#F9F9F9'}}>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma transação cadastrada</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const isEntrada = item.type === 'entrada';
            const cor = isEntrada ? '#00796B' : '#C2185B';
            const titulo = isEntrada ? 'Entrada' : item.category?.titulo;

            return (
              <Swipeable
              containerStyle={{borderRadius: 10}}
                ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
                renderRightActions={() => (
                  <BtnDeleteTransaction transactionId={item.id} />
                )}
                overshootRight={false}
              >
                <TouchableOpacity
                  onPress={() => abrirAcoes(item.id)}
                  activeOpacity={10}
                  style={[
                    styles.transactionItem,
                    {
                      backgroundColor: '#FFF',
                      borderLeftWidth: 5,
                      borderLeftColor: cor,
                    },
                  ]}
                >
                  <View style={styles.transactionContent}>
                    <View>
                      <Text style={[styles.category, { color: cor }]}>
                        {titulo}
                      </Text>
                      <Text style={styles.date}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.valueWrapper}>
                      <Feather name="chevron-right" size={24} color="#888" />
                      <Text style={[styles.amount, { color: cor }]}>
                        {mostrarValores
                          ? `${isEntrada ? '+' : '-'} ${formatarValor(item.value)}`
                          : '****'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}
    </View>
  </View>
);

}

const styles = StyleSheet.create({
    transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueWrapper: {
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    gap: 10
  },
  content:{
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  transactionItem: {
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderLeftWidth: 5,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    padding: 16,
    backgroundColor: '#004880',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
});
