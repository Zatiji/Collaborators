import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
	getLists,
	createList as createListQuery,
	deleteList as deleteListQuery,
} from "../db/queries";
import { useAuth } from "../contexts/AuthContext";
import type { List } from "../types/todo";

export function useLists() {
	const { session } = useAuth();
	const [lists, setLists] = useState<List[]>([]);

	const refresh = useCallback(async () => {
		setLists(await getLists());
	}, []);

	useFocusEffect(
		useCallback(() => {
			refresh();
		}, [refresh]),
	);

	const createList = useCallback(
		async (name: string) => {
			if (!session?.user.id) return;
			await createListQuery(name, session.user.id);
			await refresh();
		},
		[refresh, session?.user.id],
	);

	const deleteList = useCallback(
		async (id: string) => {
			await deleteListQuery(id);
			await refresh();
		},
		[refresh],
	);

	return { lists, createList, deleteList };
}
