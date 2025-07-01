import { BtnDeleteTransaction } from '@/components/BtnDeleteTransaction';
import { RootState } from '@/store';
import { setTransactions } from '@/store/transactionSlice';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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
        <Text style={styles.headerTitle}>Transações</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="list" size={40} color="#CCC" />
          <Text style={styles.emptyText}>Nenhuma transação registrada</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isEntrada = item.type === 'entrada';
            const cor = isEntrada ? '#00A86B' : '#E53935';
            const iconName = isEntrada ? 'arrow-down-left' : 'arrow-up-right';
            const titulo = isEntrada ? 'Entrada' : item.category?.titulo;

            return (
              <Swipeable
                ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
                renderRightActions={() => <BtnDeleteTransaction transactionId={item.id} />}
                overshootRight={false}
                containerStyle={styles.swipeableContainer}
              >
                <TouchableOpacity
                  onPress={() => abrirAcoes(item.id)}
                  activeOpacity={10}
                  style={styles.transactionTouchable}
                >
                  <View style={styles.transactionItem}>
                    <View style={[styles.iconContainer, { backgroundColor: cor }]}>
                      <Feather name={iconName} size={22} color="#FFF" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{titulo}</Text>
                      <Text style={styles.transactionDate}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.valueContainer}>
                      <Text style={[styles.transactionAmount, { color: cor }]}>
                        {mostrarValores
                          ? `${isEntrada ? '+' : '-'} ${formatarValor(item.value)}`
                          : 'R$ •••••'}
                      </Text>
                      <Feather name="chevron-left" size={24} color="#CCC" />
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#004880',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  swipeableContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionTouchable: {
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
