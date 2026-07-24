import { useState } from "react";
import { router, Stack } from "expo-router";
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
} from "react-native";
import { useLists } from "../../src/hooks/useLists";
import { useAuth } from "../../src/contexts/AuthContext";
import { ListRow } from "../../src/components/ListRow";
import { BottomNav } from "../../src/components/BottomNav";
import { ShareModal } from "../../src/components/ShareModal";
import { useTheme } from "../../src/theme/ThemeContext";
import { PlusIcon } from "../../src/components/icons";
import { supabase } from "../../src/lib/supabase";

export default function ListsScreen() {
	const { palette } = useTheme();
	const { session } = useAuth();
	const { lists, createList, deleteList } = useLists();
	const [name, setName] = useState("");
	const [shareListId, setShareListId] = useState<string | null>(null);

	const username =
		(session?.user.user_metadata as { username?: string } | undefined)?.username ?? "";

	async function handleCreate() {
		const trimmed = name.trim();
		if (trimmed.length === 0) return;
		setName("");
		await createList(trimmed);
	}

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: palette.background }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: username,
					headerStyle: { backgroundColor: palette.background },
					headerShadowVisible: false,
					headerRight: () => (
						<Pressable onPress={() => supabase.auth.signOut()} hitSlop={8}>
							<Text style={[styles.signOut, { color: palette.rosewood }]}>Sign Out</Text>
						</Pressable>
					),
				}}
			/>
			<Pressable style={styles.flex} onPress={Keyboard.dismiss}>
				<FlatList
					data={lists}
					keyExtractor={(list) => list.id}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={styles.listContent}
					ListHeaderComponent={
						<View style={styles.addRow}>
							<TextInput
								style={[styles.input, { borderColor: palette.line, color: palette.text }]}
								value={name}
								onChangeText={setName}
								placeholder="New list name"
								placeholderTextColor={palette.textMuted}
								onSubmitEditing={handleCreate}
							/>
							<Pressable
								onPress={handleCreate}
								style={[styles.addButton, { borderColor: palette.line }]}
							>
								<View style={styles.addButtonFaded}>
									<Text style={[styles.addButtonLabel, { color: palette.text }]}>
										Create a new list
									</Text>
								</View>
								<PlusIcon size={20} color={palette.text} />
							</Pressable>
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
			<BottomNav />
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
	input: {
		borderWidth: 2,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontFamily: "Arial",
		marginBottom: 10,
	},
	addButton: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 16,
		paddingVertical: 16,
	},
	addButtonFaded: { flexDirection: "row", opacity: 0.5, marginRight: 8 },
	addButtonLabel: { fontFamily: "Arial", fontSize: 15, fontWeight: "600", marginRight: 8 },
	signOut: { fontSize: 15, marginRight: 4, fontFamily: "Arial" },
});
