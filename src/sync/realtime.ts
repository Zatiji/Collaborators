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

export function subscribeToListOps(listId: string, onNewOp: (op: Op) => void): () => void {
	const channel = supabase
		.channel(`ops:${listId}`)
		.on(
			"postgres_changes",
			{ event: "INSERT", schema: "public", table: "ops", filter: `list_id=eq.${listId}` },
			async (payload) => {
				const op = rowToOp(payload.new as OpsRow);
				await insertOp(op);
				onNewOp(op);
			},
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}
