import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";

export type TransactionProps = {
    id: number;
    category: string;
    type: 'entrada' | 'saida';
    value: number;
    date: string;
};

export function useTransactionDatabase() {
    const db = useSQLiteContext();

    async function CreateTransaction(data: Omit<TransactionProps, "id">) {
        const statement = await db.prepareAsync(
            "INSERT INTO transactions (category, type, value, date) VALUES ($category, $type, $value, $date);"
        )

        try {
            const result = await statement.executeAsync({
                $category: data.category,
                $type: data.type,
                $value: data.value.toFixed(2),
                $date: data.date,
            });
            
            const insertedRowId = result.lastInsertRowId.toString();
            console.log("Transaction created with ID:", insertedRowId); 
            return { insertedRowId };
            
        } catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function GetTransactions() {
        try {

            const query = "SELECT * FROM transactions ORDER BY date DESC";
            const result = await db.getAllAsync<TransactionProps>(query);
            return result

        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }

    const GetTotalValue = useCallback(async (): Promise<number> => {

    const result = await db.getFirstAsync<{ total: number }>(
      "SELECT SUM(CASE WHEN type = 'entrada' THEN value WHEN type = 'saida' THEN -value ELSE 0 END) AS total FROM transactions"
    );
    return result?.total ?? 0;
  }, [db]);

    return {CreateTransaction, GetTransactions, GetTotalValue}
}