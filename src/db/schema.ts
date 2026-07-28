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
      owner_id TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT 0,
      pending INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ops (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      replica_id TEXT NOT NULL,
      lamport_counter INTEGER NOT NULL,
      op_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      origin_id TEXT,
      field_name TEXT,
      value TEXT,
      created_at INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS ops_list_id_idx ON ops(list_id);
    CREATE INDEX IF NOT EXISTS ops_synced_idx ON ops(synced);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

  `);

	const listColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(lists);");
	if (!listColumns.some((col) => col.name === "owner_id")) {
		await db.execAsync("ALTER TABLE lists ADD COLUMN owner_id TEXT NOT NULL DEFAULT '';");
	}
	if (!listColumns.some((col) => col.name === "pending")) {
		await db.execAsync("ALTER TABLE lists ADD COLUMN pending INTEGER NOT NULL DEFAULT 0;");
	}
	if (!listColumns.some((col) => col.name === "updated_at")) {
		await db.execAsync("ALTER TABLE lists ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;");
	}
	await db.execAsync("UPDATE lists SET updated_at = created_at WHERE updated_at = 0;");
	await db.execAsync("DROP TABLE IF EXISTS entries;");

	return db;
}
