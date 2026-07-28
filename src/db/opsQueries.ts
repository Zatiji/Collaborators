import { getDb } from "./schema";
import type { Op, OpType, FieldName } from "../crdt/types";
import type { KVStore } from "../crdt/replicaClock";

type OpRow = {
	id: string;
	list_id: string;
	replica_id: string;
	lamport_counter: number;
	op_type: string;
	item_id: string;
	origin_id: string | null;
	field_name: string | null;
	value: string | null;
	created_at: number;
	synced: number;
};

function rowToOp(row: OpRow): Op {
	return {
		id: row.id,
		listId: row.list_id,
		replicaId: row.replica_id,
		lamportCounter: row.lamport_counter,
		opType: row.op_type as OpType,
		itemId: row.item_id,
		originId: row.origin_id,
		fieldName: row.field_name as FieldName | null,
		value: row.value === null ? null : JSON.parse(row.value),
		createdAt: row.created_at,
	};
}

export async function insertOp(op: Op): Promise<void> {
	const db = await getDb();
	await db.runAsync(
		`INSERT OR IGNORE INTO ops
      (id, list_id, replica_id, lamport_counter, op_type, item_id, origin_id, field_name, value, created_at, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
		op.id,
		op.listId,
		op.replicaId,
		op.lamportCounter,
		op.opType,
		op.itemId,
		op.originId,
		op.fieldName,
		op.value === null ? null : JSON.stringify(op.value),
		op.createdAt,
	);
}

export async function getOpsForList(listId: string): Promise<Op[]> {
	const db = await getDb();
	const rows = await db.getAllAsync<OpRow>("SELECT * FROM ops WHERE list_id = ?;", listId);
	return rows.map(rowToOp);
}

export async function getUnsyncedOps(): Promise<Op[]> {
	const db = await getDb();
	const rows = await db.getAllAsync<OpRow>("SELECT * FROM ops WHERE synced = 0;");
	return rows.map(rowToOp);
}

export async function markOpsSynced(ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	const db = await getDb();
	const placeholders = ids.map(() => "?").join(",");
	await db.runAsync(`UPDATE ops SET synced = 1 WHERE id IN (${placeholders});`, ...ids);
}

export const sqliteKVStore: KVStore = {
	async get(key: string) {
		const db = await getDb();
		const row = await db.getFirstAsync<{ value: string }>(
			"SELECT value FROM meta WHERE key = ?;",
			key,
		);
		return row?.value ?? null;
	},
	async set(key: string, value: string) {
		const db = await getDb();
		await db.runAsync(
			"INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
			key,
			value,
		);
	},
};
