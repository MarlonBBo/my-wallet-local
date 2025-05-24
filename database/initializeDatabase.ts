import { SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT UNIQUE NOT NULL,
      cor TEXT NOT NULL,
      valor REAL DEFAULT 0
    );
  `);
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      type TEXT  NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
    );
  `);
}

export async function resetDatabase(database: SQLiteDatabase) {
  // Deleta as tabelas (se existirem)
  await database.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categorias;
  `);

  // Recria as tabelas
  await initializeDatabase(database);
}