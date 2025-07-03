import { SQLiteDatabase } from "expo-sqlite";

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
      category_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('entrada', 'saida')) NOT NULL,
      value INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS anotacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes TEXT NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS anotacao_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anotacao_id INTEGER NOT NULL,
      conteudo TEXT NOT NULL,
      valor INTEGER NOT NULL,
      FOREIGN KEY (anotacao_id) REFERENCES anotacoes(id) ON DELETE CASCADE
    );
  `);

}
