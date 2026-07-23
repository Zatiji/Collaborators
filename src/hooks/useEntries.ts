import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getEntries,
  createEntry as createEntryQuery,
  updateEntryText as updateEntryTextQuery,
  toggleEntryComplete as toggleEntryCompleteQuery,
  deleteEntry as deleteEntryQuery,
} from '../db/queries';
import type { Entry } from '../types/domain';

export function useEntries(listId: string) {
  const [entries, setEntries] = useState<Entry[]>([]);

  const refresh = useCallback(async () => {
    setEntries(await getEntries(listId));
  }, [listId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addEntry = useCallback(
    async (text: string) => {
      await createEntryQuery(listId, text);
      await refresh();
    },
    [listId, refresh]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      await deleteEntryQuery(id);
      await refresh();
    },
    [refresh]
  );

  const toggleEntry = useCallback(
    async (id: string, completed: boolean) => {
      await toggleEntryCompleteQuery(id, completed);
      await refresh();
    },
    [refresh]
  );

  const editEntry = useCallback(
    async (id: string, text: string) => {
      await updateEntryTextQuery(id, text);
      await refresh();
    },
    [refresh]
  );

  return { entries, addEntry, removeEntry, toggleEntry, editEntry };
}
