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
import { ListRow } from "../../src/components/ListRow";
import { supabase } from "../../src/lib/supabase";

export default function ListsScreen() {
	const { lists, createList, deleteList } = useLists();
	const [name, setName] = useState("");

	async function handleCreate() {
		const trimmed = name.trim();
		if (trimmed.length === 0) return;
		setName("");
		await createList(trimmed);
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable onPress={() => supabase.auth.signOut()} hitSlop={8}>
							<Text style={styles.signOut}>Sign Out</Text>
						</Pressable>
					),
				}}
			/>
			<Pressable style={styles.flex} onPress={Keyboard.dismiss}>
				<FlatList
					data={lists}
					keyExtractor={(list) => list.id}
					keyboardShouldPersistTaps="handled"
					renderItem={({ item }) => (
						<ListRow
							list={item}
							onPress={() => router.push(`/list/${item.id}`)}
							onDelete={() => deleteList(item.id)}
						/>
					)}
					ListEmptyComponent={<Text style={styles.empty}>No lists yet.</Text>}
				/>
			</Pressable>
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
	container: { flex: 1, backgroundColor: "#fff" },
	flex: { flex: 1 },
	empty: { textAlign: "center", marginTop: 24, color: "#888" },
	addRow: {
		flexDirection: "row",
		padding: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "#ccc",
	},
	input: {
		flex: 1,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginRight: 8,
	},
	addButton: { justifyContent: "center", paddingHorizontal: 12 },
	addButtonText: { color: "#007aff", fontSize: 16, fontWeight: "600" },
	signOut: { color: "#d00", fontSize: 15, marginRight: 4 },
});
