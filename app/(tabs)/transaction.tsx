import { RootState } from '@/store';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { formatarValor } from '.';
import { TransactionProps, useTransactionDatabase } from '../../database/useTransactionDatabase';

export default function Transaction() {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);

  const mostrarValores = useSelector((state: RootState) => state.visibilidade.mostrarValores);
  const transactionDatabase = useTransactionDatabase();

  useFocusEffect(
    useCallback(() => {
      async function fetchTransactions() {
        try {
          const result = await transactionDatabase.GetTransactions();
          setTransactions(result);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }

      fetchTransactions();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transações</Text>
      </View>

      <View>
        {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma transação cadastrada</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View
              style={[
                styles.transactionItem,
                {
                  backgroundColor:
                    item.type === 'entrada' ? '#FFF' : '#FFF',
                  borderLeftWidth: 5,
                  borderLeftColor:
                    item.type === 'entrada' ? '#00796B' : '#C2185B',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.category, {color: item.type === 'entrada' ? '#00796B' : '#C2185B'}]}>{item.type === 'entrada' ? ('Entrada') : (item.category?.titulo)}</Text>
                  <Text style={[styles.date]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: item.type === 'entrada' ? '#00796B' : '#C2185B' },
                  ]}
                >
                   {mostrarValores ? item.type === 'entrada' ? '+' : '-' : ''} {mostrarValores ? formatarValor(item.value) : '*****'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    gap: 10
  },
  content:{
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
  },
  transactionItem: {
    
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    backgroundColor: '#7C4DFF',
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
