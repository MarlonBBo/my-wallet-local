import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";

// Tipos
export type TransactionProps = {
  id: number;
  category: CategoriaProps;
  type: 'entrada' | 'saida';
  value: number;
  date: string;
};

export type CategoriaProps = {
  id: number;
  titulo: string;
  cor: string;
  valor: number;
};

export type CreateTransactionDTO = {
  category: { id: number; titulo: string; cor: string };
  type: 'entrada' | 'saida';
  value: number;
  date: string;
};

type CategoriaResumo = Pick<CategoriaProps, 'titulo' | 'valor' | 'cor'>;

// Queries SQL
const QUERIES = {
  INSERT_CATEGORIA: `
    INSERT OR IGNORE INTO categorias (id, titulo, cor, valor)
    VALUES (?, ?, ?, ?)
  `,
  GET_CATEGORIA_BY_ID: "SELECT * FROM categorias WHERE id = ?",
  INSERT_TRANSACTION: `
    INSERT INTO transactions (category_id, type, value, date)
    VALUES (?, ?, ?, ?)
  `,
  UPDATE_CATEGORIA_VALOR: `
    INSERT INTO categorias (titulo, cor, valor)
    VALUES (?, ?, ?)
    ON CONFLICT(titulo) DO UPDATE SET 
      valor = valor + excluded.valor,
      cor = excluded.cor
  `,
  GET_ALL_TRANSACTIONS: `
    SELECT 
      t.id, 
      t.value, 
      t.date, 
      t.type, 
      c.id as categoryId, 
      c.titulo as categoryTitulo, 
      c.cor as categoryCor
    FROM transactions t
    LEFT JOIN categorias c ON t.category_id = c.id;
  `,
  GET_TOTAL_VALUE: `
    SELECT SUM(CASE 
      WHEN type = 'entrada' THEN value 
      WHEN type = 'saida' THEN -value 
      ELSE 0 
    END) AS total FROM transactions
  `,
  GET_RECEITAS: "SELECT SUM(value) as total FROM transactions WHERE type = 'entrada'",
  GET_DESPESAS: "SELECT SUM(value) as total FROM transactions WHERE type = 'saida'",
  DELETE_ALL_TRANSACTIONS: "DELETE FROM transactions",
  GET_CATEGORIAS_SUM: "SELECT titulo, cor, valor FROM categorias",
  GET_ALL_CATEGORIAS: "SELECT * FROM categorias ORDER BY titulo ASC"
};

export function useTransactionDatabase() {
  const db = useSQLiteContext();

  // Categorias
  const CreateCategoria = async (data: CategoriaProps) => {
    try {
      await db.runAsync(QUERIES.INSERT_CATEGORIA, 
        [data.id, data.titulo, data.cor, data.valor]);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  };

  const GetCategoriaById = async (id: number): Promise<CategoriaProps | null> => {
    try {
      return await db.getFirstAsync<CategoriaProps>(
        QUERIES.GET_CATEGORIA_BY_ID, [id]
      ) ?? null;
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      return null;
    }
  };

  const GetAllCategorias = async (): Promise<CategoriaProps[]> => {
    try {
      return await db.getAllAsync<CategoriaProps>(QUERIES.GET_ALL_CATEGORIAS);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  };

  // Transações
  async function CreateTransaction(data: CreateTransactionDTO) {
  try {
    await db.withTransactionAsync(async () => {
      // 1. Insere a transação
      await db.runAsync(
        `INSERT INTO transactions (category_id, type, value, date) VALUES (?, ?, ?, ?)`,
        [
          data.category ? data.category.id : null,
          data.type,
          data.value,
          data.date
        ]
      );
      
      // 2. Atualiza o valor da categoria (apenas para saídas)
      if (data.type === 'saida') {
        // Verifica se a categoria existe
        const categoriaExists = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM categorias WHERE id = ?`,
          [data.category.id]
        );

        if (categoriaExists && categoriaExists.count > 0) {
          // Atualiza a categoria existente
          await db.runAsync(
            `UPDATE categorias SET valor = valor + ? WHERE id = ?`,
            [data.value, data.category.id]
          );
        } else {
          // Cria uma nova categoria se não existir
          await db.runAsync(
            `INSERT INTO categorias (id, titulo, cor, valor) VALUES (?, ?, ?, ?)`,
            [data.category.id, data.category.titulo, data.category.cor, data.value]
          );
        }
      }
    });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    throw error;
  }
}

  const GetTransactions = async (): Promise<TransactionProps[]> => {
    try {
      const rows = await db.getAllAsync<any>(QUERIES.GET_ALL_TRANSACTIONS);

      return rows.map(row => ({
        id: row.id,
        value: row.value,
        date: row.date,
        type: row.type,
        category: {
          id: row.categoryId,
          titulo: row.categoryTitulo,
          cor: row.categoryCor,
          valor: 0, // Pode ser 0 ou outro valor, dependendo se você quer exibir aqui
        }
      }));
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      return [];
    }
  };


  // Totais e resumos
  const GetTotalValue = useCallback(async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync<{ total: number }>(QUERIES.GET_TOTAL_VALUE);
      return result?.total ?? 0;
    } catch (error) {
      console.error("Erro ao calcular saldo total:", error);
      return 0;
    }
  }, [db]);

  const GetReceitas = async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync<{ total: number }>(QUERIES.GET_RECEITAS);
      return result?.total ?? 0;
    } catch (error) {
      console.error("Erro ao calcular receitas:", error);
      return 0;
    }
  };

  const GetDespesas = async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync<{ total: number }>(QUERIES.GET_DESPESAS);
      return result?.total ?? 0;
    } catch (error) {
      console.error("Erro ao calcular despesas:", error);
      return 0;
    }
  };

  const GetSomaPorCategoria = async (): Promise<CategoriaResumo[]> => {
    try {
      return await db.getAllAsync<CategoriaResumo>(QUERIES.GET_CATEGORIAS_SUM);
    } catch (error) {
      console.error("Erro ao buscar resumo por categoria:", error);
      return [];
    }
  };

  // Limpeza
  const DeleteAllTransactions = async () => {
  try {
    await db.withTransactionAsync(async () => {
      // Limpar todas as transações
      await db.execAsync(QUERIES.DELETE_ALL_TRANSACTIONS);

      // Resetar os valores das categorias para 0
      await db.execAsync("UPDATE categorias SET valor = 0");
      });
    } catch (error) {
      console.error("Erro ao limpar transações:", error);
      throw error;
    }
  };


  return {
    CreateCategoria,
    GetCategoriaById,
    GetAllCategorias,
    CreateTransaction,
    GetTransactions,
    GetTotalValue,
    GetReceitas,
    GetDespesas,
    GetSomaPorCategoria,
    DeleteAllTransactions
  };
}