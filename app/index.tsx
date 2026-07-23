import { useState } from 'react';
import { router } from 'expo-router';
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
import { useLists } from '../src/hooks/useLists';
import { ListRow } from '../src/components/ListRow';

export default function ListsScreen() {
  const { lists, createList, deleteList } = useLists();
  const [name, setName] = useState('');

  async function handleCreate() {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setName('');
    await createList(trimmed);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={lists}
        keyExtractor={(list) => list.id}
        renderItem={({ item }) => (
          <ListRow
            list={item}
            onPress={() => router.push(`/list/${item.id}`)}
            onDelete={() => deleteList(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No lists yet.</Text>}
      />
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="New list name"
          onSubmitEditing={handleCreate}
        />
        <Pressable onPress={handleCreate} style={styles.addButton}>
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
