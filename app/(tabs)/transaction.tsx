import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { TransactionProps, useTransactionDatabase } from '../../database/useTransactionDatabase';

export default function Transaction() {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);

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
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma transação cadastrada</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.transactionItem,
                {
                  backgroundColor:
                    item.type === 'entrada' ? '#E0F7FA' : '#FCE4EC',
                  borderLeftWidth: 5,
                  borderLeftColor:
                    item.type === 'entrada' ? '#00796B' : '#C2185B',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.category}>{item.category?.titulo}</Text>
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
                  {item.type === 'entrada' ? '+' : '-'} R$ {item.value.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
  },
  transactionItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
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
});
