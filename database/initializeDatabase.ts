import { SQLiteDatabase } from "expo-sqlite";

// export async function initializeDatabase(database: SQLiteDatabase) {
//   try {
//     await database.execAsync(`DROP TABLE IF EXISTS anotacao_itens`);
//     await database.execAsync(`DROP TABLE IF EXISTS anotacoes`);
//     await database.execAsync(`DROP TABLE IF EXISTS transactions`);
//     await database.execAsync(`DROP TABLE IF EXISTS categorias`);

//     console.log("Tabelas removidas com sucesso!");
//   } catch (error) {
//     console.error("Erro ao reiniciar o banco:", error);
//   }
// }


export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT UNIQUE NOT NULL,
      cor TEXT NOT NULL,
      valor INTEGER NOT NULL DEFAULT 0
    );
  `);
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      titleEntrada TEXT,
      type TEXT CHECK(type IN ('entrada', 'saida')) NOT NULL,
      value INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS anotacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('receber', 'pagar')) DEFAULT 'pagar'
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS anotacao_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anotacao_id INTEGER NOT NULL,
      conteudo TEXT NOT NULL,
      valor INTEGER NOT NULL,
      concluido INTEGER DEFAULT 0,
      FOREIGN KEY (anotacao_id) REFERENCES anotacoes(id) ON DELETE CASCADE
    );
  `);

}
