import { type SQLiteDatabase } from 'expo-sqlite';


export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL
    );
`)
}