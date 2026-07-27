import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Entry } from "../types/todo";
import { FloatingCard } from "./FloatingCard";
import { SwipeToDelete } from "./SwipeToDelete";
import { useConfirmModal } from "./ConfirmModal";
import { useTheme } from "../theme/ThemeContext";
import { CheckboxIcon } from "./icons";

type Props = {
	entry: Entry;
	onToggle: () => void;
	onDelete: () => void;
	onEdit: (text: string) => void;
};

export function EntryRow({ entry, onToggle, onDelete, onEdit }: Props) {
	const { palette } = useTheme();
	const { confirm } = useConfirmModal();
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
		<View style={styles.outer}>
			<SwipeToDelete onConfirmDelete={() => confirm(`Delete "${entry.text}"?`, onDelete)}>
				<FloatingCard style={styles.card}>
					<Pressable onPress={onToggle} hitSlop={8}>
						<CheckboxIcon size={26} color={palette.stormyTeal} checked={entry.completed} />
					</Pressable>
					{editing ? (
						<TextInput
							style={[styles.text, styles.input, { color: palette.text, borderColor: palette.line }]}
							value={draft}
							onChangeText={setDraft}
							onBlur={commitEdit}
							onSubmitEditing={commitEdit}
							autoFocus
						/>
					) : (
						<Pressable style={styles.textWrap} onPress={() => setEditing(true)}>
							<Text
								style={[
									styles.text,
									{ color: entry.completed ? palette.textMuted : palette.text },
									entry.completed && styles.completed,
								]}
							>
								{entry.text}
							</Text>
						</Pressable>
					)}
				</FloatingCard>
			</SwipeToDelete>
		</View>
	);
}

const styles = StyleSheet.create({
	outer: { marginBottom: 13, paddingHorizontal: 16 },
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	textWrap: { flex: 1, marginLeft: 12 },
	text: { fontSize: 16, fontFamily: "Arial" },
	input: { padding: 0, marginLeft: 12, flex: 1, borderBottomWidth: 1 },
	completed: { textDecorationLine: "line-through" },
});
