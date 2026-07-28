import { supabase } from "../lib/supabase";
import { getUnsyncedOps, markOpsSynced } from "../db/opsQueries";
import type { Op } from "../crdt/types";

function opToRow(op: Op) {
	return {
		id: op.id,
		list_id: op.listId,
		replica_id: op.replicaId,
		lamport_counter: op.lamportCounter,
		op_type: op.opType,
		item_id: op.itemId,
		origin_id: op.originId,
		field_name: op.fieldName,
		value: op.value,
	};
}

export async function pushUnsyncedOps(): Promise<void> {
	const unsynced = await getUnsyncedOps();
	if (unsynced.length === 0) return;

	const { error } = await supabase.from("ops").upsert(unsynced.map(opToRow), {
		onConflict: "replica_id,lamport_counter",
		ignoreDuplicates: true,
	});

	if (error) {
		// RLS denial or malformed op: logged loudly so it isn't mistaken for
		// "still offline" (spec §10) — a denial won't resolve itself on retry.
		if (error.code === "42501") {
			console.error("[sync] ops push denied by RLS — this will never succeed on retry", error);
		} else {
			console.warn("[sync] ops push failed, will retry on next flush", error);
		}
		return;
	}

	await markOpsSynced(unsynced.map((op) => op.id));
}
