import { getDb } from "./schema";
import { supabase } from "../lib/supabase";
import type { List } from "../types/todo";

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
	owner_id: string;
	created_at: number;
	updated_at: number;
};

function rowToList(row: ListRow): List {
	return {
		id: row.id,
		name: row.name,
		ownerId: row.owner_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export async function getLists(): Promise<List[]> {
	const db = await getDb();
	const rows = await db.getAllAsync<ListRow>("SELECT * FROM lists ORDER BY updated_at DESC;");
	return rows.map(rowToList);
}

export async function getList(id: string): Promise<List | null> {
	const db = await getDb();
	const row = await db.getFirstAsync<ListRow>("SELECT * FROM lists WHERE id = ?;", id);
	return row ? rowToList(row) : null;
}

export async function createList(name: string, ownerId: string): Promise<List> {
	const db = await getDb();
	const id = generateId();
	const now = Date.now();
	await db.runAsync(
		"INSERT INTO lists (id, name, owner_id, created_at, updated_at, pending) VALUES (?, ?, ?, ?, ?, 1);",
		id,
		name,
		ownerId,
		now,
		now,
	);

	const { error } = await supabase.from("lists").insert({ id, name, owner_id: ownerId });
	if (!error) {
		await db.runAsync("UPDATE lists SET pending = 0 WHERE id = ?;", id);
	}
	// on failure, the row stays locally with pending = 1; a full retry queue
	// for list creation is out of scope for this phase (entries are the
	// offline-critical path — lists are rarely created while offline).

	return { id, name, ownerId, createdAt: now, updatedAt: now };
}

export async function deleteList(id: string): Promise<void> {
	const db = await getDb();
	await db.runAsync("DELETE FROM lists WHERE id = ?;", id);
	await supabase.from("lists").delete().eq("id", id);
}
