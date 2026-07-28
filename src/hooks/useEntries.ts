import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { reconstruct } from "../crdt/reconstruct";
import { createReplicaClock } from "../crdt/replicaClock";
import { createEntryOps } from "../crdt/entryOps";
import { getOpsForList, insertOp, sqliteKVStore } from "../db/opsQueries";
import { coldStartSync } from "../sync/coldStart";
import { subscribeToListOps } from "../sync/realtime";
import { pushUnsyncedOps } from "../sync/pushQueue";
import type { Entry } from "../types/todo";

const clock = createReplicaClock(sqliteKVStore);
const entryOps = createEntryOps(clock, insertOp);

export function useEntries(listId: string) {
	const [entries, setEntries] = useState<Entry[]>([]);

	const refresh = useCallback(async () => {
		const ops = await getOpsForList(listId);
		const reconstructed = reconstruct(ops);
		setEntries(
			reconstructed.map((e) => ({
				id: e.id,
				listId: e.listId,
				text: e.text,
				completed: e.completed,
				createdAt: 0,
				updatedAt: 0,
			})),
		);
	}, [listId]);

	useFocusEffect(
		useCallback(() => {
			refresh();
			coldStartSync(listId).then(refresh);
			pushUnsyncedOps();
		}, [refresh, listId]),
	);

	useEffect(() => {
		const unsubscribe = subscribeToListOps(listId, () => {
			refresh();
		});
		return unsubscribe;
	}, [listId, refresh]);

	const addEntry = useCallback(
		async (text: string) => {
			await entryOps.createEntry(listId, text);
			await refresh();
			pushUnsyncedOps();
		},
		[listId, refresh],
	);

	const removeEntry = useCallback(
		async (id: string) => {
			await entryOps.deleteEntry(listId, id);
			await refresh();
			pushUnsyncedOps();
		},
		[listId, refresh],
	);

	const toggleEntry = useCallback(
		async (id: string, completed: boolean) => {
			await entryOps.setField(listId, id, "checked", completed);
			await refresh();
			pushUnsyncedOps();
		},
		[listId, refresh],
	);

	const editEntry = useCallback(
		async (id: string, text: string) => {
			await entryOps.setField(listId, id, "text", text);
			await refresh();
			pushUnsyncedOps();
		},
		[listId, refresh],
	);

	return { entries, addEntry, removeEntry, toggleEntry, editEntry };
}
