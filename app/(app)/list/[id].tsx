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
  View,
} from 'react-native';
import { useEntries } from '../../../src/hooks/useEntries';
import { EntryRow } from '../../../src/components/EntryRow';
import { AddItemButton } from '../../../src/components/AddItemButton';
import { getList } from '../../../src/db/queries';
import { useTheme } from '../../../src/theme/ThemeContext';
import { BackArrowIcon } from '../../../src/components/icons';

export default function ListDetailScreen() {
  const { palette } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, addEntry, removeEntry, toggleEntry, editEntry } = useEntries(id);
  const [listName, setListName] = useState('');

  useFocusEffect(
    useCallback(() => {
      getList(id).then((list) => setListName(list?.name ?? ''));
    }, [id])
  );

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
          headerTintColor: palette.text,
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
              <AddItemButton placeholder="Add entry" onSubmit={addEntry} />
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
});
