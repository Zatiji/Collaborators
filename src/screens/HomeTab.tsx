import { useState } from "react";
import { router } from "expo-router";
import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useLists } from "../hooks/useLists";
import { ListRow } from "../components/ListRow";
import { ShareModal } from "../components/ShareModal";
import { AddItemButton } from "../components/AddItemButton";
import { useTheme } from "../theme/ThemeContext";

export function HomeTab() {
	const { palette } = useTheme();
	const { lists, createList, deleteList } = useLists();
	const [shareListId, setShareListId] = useState<string | null>(null);

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: palette.background }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<Pressable style={styles.flex} onPress={Keyboard.dismiss}>
				<FlatList
					data={lists}
					keyExtractor={(list) => list.id}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={styles.listContent}
					ListHeaderComponent={
						<View style={styles.addRow}>
							<AddItemButton placeholder="Create a new list" onSubmit={createList} />
						</View>
					}
					renderItem={({ item }) => (
						<ListRow
							list={item}
							onPress={() => router.push(`/list/${item.id}`)}
							onShare={() => setShareListId(item.id)}
							onDelete={() => deleteList(item.id)}
						/>
					)}
					ListEmptyComponent={
						<Text style={[styles.empty, { color: palette.textMuted }]}>No lists yet.</Text>
					}
				/>
			</Pressable>
			<ShareModal
				visible={shareListId !== null}
				listId={shareListId}
				onClose={() => setShareListId(null)}
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	flex: { flex: 1 },
	listContent: { paddingBottom: 120 },
	empty: { textAlign: "center", marginTop: 24, fontFamily: "Arial" },
	addRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
});
