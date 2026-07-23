import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Entry } from "../types/todo";

type Props = {
	entry: Entry;
	onToggle: () => void;
	onDelete: () => void;
	onEdit: (text: string) => void;
};

export function EntryRow({ entry, onToggle, onDelete, onEdit }: Props) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(entry.text);

	function commitEdit() {
		setEditing(false);
		const trimmed = draft.trim();

		if (trimmed.length > 0 && trimmed !== entry.text) {
			onEdit(trimmed);
		} else {
			setDraft(entry.text);
		}
	}

	return (
		<View style={styles.row}>
			<Pressable onPress={onToggle} hitSlop={8}>
				<Text style={styles.checkbox}>{entry.completed ? "[x]" : "[ ]"}</Text>
			</Pressable>
			{editing ? (
				<TextInput
					style={[styles.text, styles.input]}
					value={draft}
					onChangeText={setDraft}
					onBlur={commitEdit}
					onSubmitEditing={commitEdit}
					autoFocus
				/>
			) : (
				<Pressable style={styles.textWrap} onPress={() => setEditing(true)}>
					<Text style={[styles.text, entry.completed && styles.completed]}>
						{entry.text}
					</Text>
				</Pressable>
			)}
			<Pressable onPress={onDelete} hitSlop={8}>
				<Text style={styles.delete}>Delete</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
	},
	checkbox: { fontSize: 16, marginRight: 10, fontFamily: "Courier" },
	textWrap: { flex: 1 },
	text: { fontSize: 16 },
	input: { padding: 0 },
	completed: { textDecorationLine: "line-through", color: "#888" },
	delete: { color: "#d00", fontSize: 14, marginLeft: 10 },
});
