import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";

export type TransactionProps = {
  id: number;
  category: CategoriaProps;
  titleEntrada?: string;
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
  categoryId?: number;
  titleEntrada?: string;
  type: 'entrada' | 'saida';
  value: number;
  date: string;
};


export type CreateCategoriaDTO = {
  titulo: string;
  cor: string;
  valor: number;
};

const QUERIES = {
  INSERT_CATEGORIA: `
    INSERT OR IGNORE INTO categorias ( titulo, cor)
    VALUES (?, ?)
  `,
  GET_CATEGORIA_BY_ID: "SELECT * FROM categorias WHERE id = ?",
  INSERT_TRANSACTION: `
    INSERT INTO transactions (category_id, type, value, date, titleEntrada)
    VALUES (?, ?, ?, ?, ?)
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
      t.titleEntrada,
      t.date, 
      t.type, 
      c.id as category_id, 
      c.titulo as category_titulo, 
      c.cor as category_cor,
      c.valor as category_valor
    FROM transactions t
    LEFT JOIN categorias c ON t.category_id = c.id
    ORDER BY t.date DESC
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
  GET_CATEGORIAS_SUM: "SELECT id, titulo, cor, valor FROM categorias",
  GET_ALL_CATEGORIAS: "SELECT * FROM categorias ORDER BY titulo ASC",
  DELETE_CATEGORIA_BY_ID: "DELETE FROM categorias WHERE id = ?",
  DELETE_ALL_CATEGORY: "DELETE FROM categorias",
  UPDATE_CATEGORIA: `
    UPDATE categorias 
    SET titulo = ?, cor = ?
    WHERE id = ?
  `,
  DELETE_TRANSACTION_BY_ID: "DELETE FROM transactions WHERE id = ?",
  UPDATE_TRANSACTION_BY_ID: `
    UPDATE transactions
    SET category_id = ?, type = ?, value = ?, date = ?
    WHERE id = ?
  `,
};

export function useTransactionDatabase() {
  const db = useSQLiteContext();

  // Categorias
  const CreateCategoria = async (data: CreateCategoriaDTO): Promise<CategoriaProps> => {
    try {
      await db.runAsync(QUERIES.INSERT_CATEGORIA, [data.titulo, data.cor]);

      const ultimaCategoria = await db.getFirstAsync<CategoriaProps>(
        `SELECT * FROM categorias ORDER BY id DESC LIMIT 1`
      );

      if (!ultimaCategoria) throw new Error("Categoria não encontrada após inserção.");

      return { ...ultimaCategoria, valor: 0 };
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  };

  const GetCategoriaById = async (id: number): Promise<CategoriaProps | null> => {
    try {
      return await db.getFirstAsync<CategoriaProps>(QUERIES.GET_CATEGORIA_BY_ID, [id]) ?? null;
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

  const DeleteCategoriaAndRestoreValor = async (categoriaId: number) => {
  try {
    await db.withTransactionAsync(async () => {
      
      const transacoes = await db.getAllAsync<{
        value: number;
        type: 'entrada' | 'saida';
        id: number;
      }>(
        `SELECT id, value, type FROM transactions WHERE category_id = ?`,
        [categoriaId]
      );

      let totalSaida = 0;
      for (const transacao of transacoes) {
        if (transacao.type === 'saida') {
          totalSaida += transacao.value;
        }
      }

      await db.runAsync(`DELETE FROM transactions WHERE category_id = ?`, [categoriaId]);

      await db.runAsync(QUERIES.DELETE_CATEGORIA_BY_ID, [categoriaId]);

      console.log(`Categoria ${categoriaId} deletada. Valor estornado: ${totalSaida}`);
    });
  } catch (error) {
    console.error("Erro ao deletar categoria e estornar valores:", error);
    throw error;
  }
};


  const UpdateCategoria = async (id: number, data: CreateCategoriaDTO) => {
    try {
      await db.runAsync(QUERIES.UPDATE_CATEGORIA, [data.titulo, data.cor, id]);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
  };

  const DeleteAllCategoria = async () => {
    try {
      await db.execAsync(QUERIES.DELETE_ALL_CATEGORY);
    } catch (error) {
      throw error;
    }
  };

  // Transações
  const CreateTransaction = async (data: CreateTransactionDTO) => {
    try {
      await db.withTransactionAsync(async () => {
        if(data.type === "saida"){
          await db.runAsync(
          QUERIES.INSERT_TRANSACTION,
          [data.categoryId ?? null, data.type, data.value, data.date, null]
        );
            await db.runAsync(
            `UPDATE categorias SET valor = valor + ? WHERE id = ?`,
            [data.value, data.categoryId || null]
          );
        }else{
          await db.runAsync(
          QUERIES.INSERT_TRANSACTION,
          [data.categoryId || null, data.type, data.value, data.date, data.titleEntrada ?? null]
        );
        }
      });
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  };

  const GetTransactions = async (): Promise<TransactionProps[]> => {
    try {
      const rows = await db.getAllAsync<any>(QUERIES.GET_ALL_TRANSACTIONS);

      return rows.map(row => ({
        id: row.id,
        value: row.value,
        date: row.date,
        type: row.type,
        titleEntrada:row.titleEntrada,
        category: {
          id: row.category_id,
          titulo: row.category_titulo,
          cor: row.category_cor,
          valor: row.category_valor ?? 0,
        }
      }));
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      return [];
    }
  };

  const DeleteTransaction = async (id: number) => {
    try {
      await db.withTransactionAsync(async () => {
        const transacao = await db.getFirstAsync<{
          value: number;
          type: 'entrada' | 'saida';
          category_id: number;
        }>(`SELECT value, type, category_id FROM transactions WHERE id = ?`, [id]);

        if (!transacao) throw new Error("Transação não encontrada");

        if (transacao.type === 'saida') {
          await db.runAsync(
            `UPDATE categorias SET valor = valor - ? WHERE id = ?`,
            [transacao.value, transacao.category_id]
          );
        }

        await db.runAsync(QUERIES.DELETE_TRANSACTION_BY_ID, [id]);
      });
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw error;
    }
  };

  const UpdateTransaction = async (id: number, data: CreateTransactionDTO) => {
    try {
      await db.runAsync(QUERIES.UPDATE_TRANSACTION_BY_ID, [
        data.categoryId || null,
        data.type,
        data.value,
        data.date,
        id
      ]);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
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

  const GetSomaPorCategoria = async (): Promise<CategoriaProps[]> => {
    try {
      return await db.getAllAsync<CategoriaProps>(QUERIES.GET_CATEGORIAS_SUM);
    } catch (error) {
      console.error("Erro ao buscar resumo por categoria:", error);
      return [];
    }
  };

  // Limpeza
  const DeleteAllTransactions = async () => {
    try {
        await db.withTransactionAsync(async () => {
        await db.execAsync(QUERIES.DELETE_ALL_TRANSACTIONS);
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
    DeleteAllTransactions,
    DeleteCategoriaAndRestoreValor,
    DeleteAllCategoria,
    UpdateTransaction,
    DeleteTransaction,
    UpdateCategoria
  };
}
