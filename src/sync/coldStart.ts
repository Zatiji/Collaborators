import { supabase } from "../lib/supabase";
import { insertOp } from "../db/opsQueries";
import type { FieldName, Op, OpType } from "../crdt/types";

type OpsRow = {
	id: string;
	list_id: string;
	replica_id: string;
	lamport_counter: number;
	op_type: string;
	item_id: string;
	origin_id: string | null;
	field_name: string | null;
	value: unknown;
	created_at: string;
};

function rowToOp(row: OpsRow): Op {
	return {
		id: row.id,
		listId: row.list_id,
		replicaId: row.replica_id,
		lamportCounter: row.lamport_counter,
		opType: row.op_type as OpType,
		itemId: row.item_id,
		originId: row.origin_id,
		fieldName: row.field_name as FieldName | null,
		value: (row.value as string | boolean | null) ?? null,
		createdAt: new Date(row.created_at).getTime(),
	};
}

export async function coldStartSync(listId: string): Promise<void> {
	const { data, error } = await supabase.from("ops").select("*").eq("list_id", listId);
	if (error) {
		console.warn("[sync] cold start fetch failed", error);
		return;
	}
	for (const row of data ?? []) {
		await insertOp(rowToOp(row as OpsRow));
	}
}
