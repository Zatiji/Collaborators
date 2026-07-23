import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getLists,
  createList as createListQuery,
  deleteList as deleteListQuery,
} from '../db/queries';
import type { List } from '../types/domain';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);

  const refresh = useCallback(async () => {
    setLists(await getLists());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const createList = useCallback(
    async (name: string) => {
      await createListQuery(name);
      await refresh();
    },
    [refresh]
  );

  const deleteList = useCallback(
    async (id: string) => {
      await deleteListQuery(id);
      await refresh();
    },
    [refresh]
  );

  return { lists, createList, deleteList };
}
