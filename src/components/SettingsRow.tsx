import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Props = {
	label: string;
	onPress: () => void;
	right?: ReactNode;
};

export function SettingsRow({ label, onPress, right }: Props) {
	const { palette } = useTheme();

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				{ borderBottomColor: palette.line },
				pressed && styles.pressed,
			]}
		>
			<Text style={[styles.label, { color: palette.text }]}>{label}</Text>
			<View>{right}</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 18,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
	},
	label: { fontSize: 16, fontFamily: "Arial" },
	pressed: { opacity: 0.5 },
});
