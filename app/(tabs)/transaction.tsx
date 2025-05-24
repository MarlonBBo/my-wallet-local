import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
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
          console.log("Transactions fetched:", result);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }

      fetchTransactions();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.text}>
              {item.category?.titulo} - {item.type} - R$ {item.value}
            </Text>
            <Text style={[styles.date, { color: '#888' }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  transactionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  text: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
