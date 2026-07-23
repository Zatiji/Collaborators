import { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEntries } from '../../src/hooks/useEntries';
import { EntryRow } from '../../src/components/EntryRow';
import { getList } from '../../src/db/queries';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, addEntry, removeEntry, toggleEntry, editEntry } = useEntries(id);
  const [text, setText] = useState('');
  const [listName, setListName] = useState('');

  useFocusEffect(
    useCallback(() => {
      getList(id).then((list) => setListName(list?.name ?? ''));
    }, [id])
  );

  async function handleAdd() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    setText('');
    await addEntry(trimmed);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: listName || 'List' }} />
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item: entry }) => (
          <EntryRow
            entry={entry}
            onToggle={() => toggleEntry(entry.id, !entry.completed)}
            onDelete={() => removeEntry(entry.id)}
            onEdit={(newText) => editEntry(entry.id, newText)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
      />
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="New entry"
          onSubmitEditing={handleAdd}
        />
        <Pressable onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  empty: { textAlign: 'center', marginTop: 24, color: '#888' },
  addRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addButton: { justifyContent: 'center', paddingHorizontal: 12 },
  addButtonText: { color: '#007aff', fontSize: 16, fontWeight: '600' },
});
