import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
	if (!dbPromise) {
		dbPromise = openDb();
	}
	return dbPromise;
}

async function openDb(): Promise<SQLite.SQLiteDatabase> {
	const db = await SQLite.openDatabaseAsync("todo.db");
	await db.execAsync("PRAGMA foreign_keys = ON;");
	await db.execAsync(`

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT 0
    );

  `);
	const listColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(lists);");
	if (!listColumns.some((col) => col.name === "updated_at")) {
		await db.execAsync("ALTER TABLE lists ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;");
	}
	const entryColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(entries);");
	if (!entryColumns.some((col) => col.name === "updated_at")) {
		await db.execAsync("ALTER TABLE entries ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;");
	}
	await db.execAsync(
		"UPDATE lists SET updated_at = created_at WHERE updated_at = 0;",
	);
	await db.execAsync(
		"UPDATE entries SET updated_at = created_at WHERE updated_at = 0;",
	);
	return db;
}
