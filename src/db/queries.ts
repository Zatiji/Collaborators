import { getDb } from "./schema";
import type { List, Entry } from "../types/todo";

function generateId(): string {
	const cryptoObj = globalThis.crypto as Crypto | undefined;
	if (cryptoObj?.randomUUID) {
		return cryptoObj.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type ListRow = {
	id: string;
	name: string;
	created_at: number;
};

type EntryRow = {
	id: string;
	list_id: string;
	text: string;
	completed: number;
	created_at: number;
};

function rowToList(row: ListRow): List {
	return { id: row.id, name: row.name, createdAt: row.created_at };
}

function rowToEntry(row: EntryRow): Entry {
	return {
		id: row.id,
		listId: row.list_id,
		text: row.text,
		completed: row.completed === 1,
		createdAt: row.created_at,
	};
}

export async function getLists(): Promise<List[]> {
	const db = await getDb();
	const rows = await db.getAllAsync<ListRow>(
		"SELECT * FROM lists ORDER BY created_at DESC;",
	);

	return rows.map(rowToList);
}

export async function getList(id: string): Promise<List | null> {
	const db = await getDb();
	const row = await db.getFirstAsync<ListRow>(
		"SELECT * FROM lists WHERE id = ?;",
		id,
	);

	return row ? rowToList(row) : null;
}

export async function createList(name: string): Promise<List> {
	const db = await getDb();
	const id = generateId();
	const createdAt = Date.now();
	await db.runAsync(
		"INSERT INTO lists (id, name, created_at) VALUES (?, ?, ?);",
		id,
		name,
		createdAt,
	);

	return { id, name, createdAt };
}

export async function deleteList(id: string): Promise<void> {
	const db = await getDb();
	await db.runAsync("DELETE FROM lists WHERE id = ?;", id);
}

export async function getEntries(listId: string): Promise<Entry[]> {
	const db = await getDb();

	const rows = await db.getAllAsync<EntryRow>(
		"SELECT * FROM entries WHERE list_id = ? ORDER BY created_at ASC;",
		listId,
	);

	return rows.map(rowToEntry);
}

export async function createEntry(
	listId: string,
	text: string,
): Promise<Entry> {
	const db = await getDb();
	const id = generateId();
	const createdAt = Date.now();

	await db.runAsync(
		"INSERT INTO entries (id, list_id, text, completed, created_at) VALUES (?, ?, ?, 0, ?);",
		id,
		listId,
		text,
		createdAt,
	);

	return { id, listId, text, completed: false, createdAt };
}

export async function updateEntryText(id: string, text: string): Promise<void> {
	const db = await getDb();
	await db.runAsync("UPDATE entries SET text = ? WHERE id = ?;", text, id);
}

export async function toggleEntryComplete(
	id: string,
	completed: boolean,
): Promise<void> {
	const db = await getDb();
	await db.runAsync(
		"UPDATE entries SET completed = ? WHERE id = ?;",
		completed ? 1 : 0,
		id,
	);
}

export async function deleteEntry(id: string): Promise<void> {
	const db = await getDb();
	await db.runAsync("DELETE FROM entries WHERE id = ?;", id);
}
