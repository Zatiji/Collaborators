import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { PlusIcon } from "./icons";

type Props = {
	placeholder: string;
	onSubmit: (text: string) => void;
};

export function AddItemButton({ placeholder, onSubmit }: Props) {
	const { palette } = useTheme();
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState("");
	const inputRef = useRef<TextInput>(null);

	function startEditing() {
		setEditing(true);
		requestAnimationFrame(() => inputRef.current?.focus());
	}

	function commit() {
		const trimmed = text.trim();
		if (trimmed.length > 0) {
			onSubmit(trimmed);
		}
		setText("");
		setEditing(false);
	}

	return (
		<Pressable
			style={[styles.button, { borderColor: palette.line }]}
			onPress={() => {
				if (!editing) startEditing();
			}}
		>
			{editing ? (
				<TextInput
					ref={inputRef}
					style={[styles.input, { color: palette.text }]}
					value={text}
					onChangeText={setText}
					placeholder={placeholder}
					placeholderTextColor={palette.textMuted}
					onSubmitEditing={commit}
					onBlur={() => {
						if (text.trim().length === 0) setEditing(false);
					}}
				/>
			) : (
				<Text style={[styles.label, { color: palette.text }]}>{placeholder}</Text>
			)}
			<Pressable onPress={editing ? commit : startEditing} hitSlop={8}>
				<PlusIcon size={20} color={palette.text} />
			</Pressable>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	label: { fontFamily: "Arial", fontSize: 15, fontWeight: "600", opacity: 0.5 },
	input: { flex: 1, fontFamily: "Arial", fontSize: 15, padding: 0, marginRight: 8 },
});
