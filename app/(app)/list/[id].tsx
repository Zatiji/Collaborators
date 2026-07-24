import { useCallback, useState } from 'react';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEntries } from '../../../src/hooks/useEntries';
import { EntryRow } from '../../../src/components/EntryRow';
import { getList } from '../../../src/db/queries';
import { useTheme } from '../../../src/theme/ThemeContext';
import { BackArrowIcon, PlusIcon } from '../../../src/components/icons';

export default function ListDetailScreen() {
  const { palette } = useTheme();
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
      style={[styles.container, { backgroundColor: palette.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: listName || 'List',
          headerStyle: { backgroundColor: palette.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
              <BackArrowIcon size={22} color={palette.text} />
            </Pressable>
          ),
        }}
      />
      <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { borderColor: palette.line, color: palette.text }]}
                value={text}
                onChangeText={setText}
                placeholder="New entry"
                placeholderTextColor={palette.textMuted}
                onSubmitEditing={handleAdd}
              />
              <Pressable
                onPress={handleAdd}
                style={[styles.addButton, { borderColor: palette.line }]}
              >
                <View style={styles.addButtonFaded}>
                  <Text style={[styles.addButtonLabel, { color: palette.text }]}>add entry</Text>
                </View>
                <PlusIcon size={20} color={palette.text} />
              </Pressable>
            </View>
          }
          renderItem={({ item: entry }) => (
            <EntryRow
              entry={entry}
              onToggle={() => toggleEntry(entry.id, !entry.completed)}
              onDelete={() => removeEntry(entry.id)}
              onEdit={(newText) => editEntry(entry.id, newText)}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: palette.textMuted }]}>No entries yet.</Text>
          }
        />
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  backButton: { marginLeft: 4 },
  listContent: { paddingBottom: 40 },
  empty: { textAlign: 'center', marginTop: 24, fontFamily: 'Arial' },
  addRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Arial',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
  },
  addButtonFaded: { flexDirection: 'row', opacity: 0.5, marginRight: 8 },
  addButtonLabel: { fontFamily: 'Arial', fontSize: 15, fontWeight: '600' },
});
