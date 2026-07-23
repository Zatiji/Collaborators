import { Pressable, StyleSheet, Text } from 'react-native';
import type { List } from '../types/domain';

type Props = {
  list: List;
  onPress: () => void;
  onDelete: () => void;
};

export function ListRow({ list, onPress, onDelete }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.name}>{list.name}</Text>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Text style={styles.delete}>Delete</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  name: { fontSize: 17 },
  delete: { color: '#d00', fontSize: 15 },
});
