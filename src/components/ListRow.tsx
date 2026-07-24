import { Pressable, StyleSheet, Text, View } from "react-native";
import type { List } from "../types/todo";
import { getPermission } from "../mock/sharing";
import { FloatingCard } from "./FloatingCard";
import { SwipeToDelete } from "./SwipeToDelete";
import { useWarningPopup } from "./WarningPopup";
import { useTheme } from "../theme/ThemeContext";
import { ShareIcon } from "./icons";

type Props = {
	list: List;
	onPress: () => void;
	onShare: () => void;
	onDelete: () => void;
};

export function ListRow({ list, onPress, onShare, onDelete }: Props) {
	const { palette } = useTheme();
	const { show } = useWarningPopup();

	function handleConfirmDelete() {
		const permission = getPermission(list.id);
		if (permission !== "owner") {
			show("You don't have permission to delete this list.");
			return;
		}
		onDelete();
	}

	return (
		<View style={styles.outer}>
			<SwipeToDelete onConfirmDelete={handleConfirmDelete}>
				<FloatingCard onPress={onPress} style={styles.card}>
					<Text style={[styles.name, { color: palette.text }]}>{list.name}</Text>
					<Pressable onPress={onShare} hitSlop={8}>
						<ShareIcon size={22} color={palette.stormyTeal} />
					</Pressable>
				</FloatingCard>
			</SwipeToDelete>
		</View>
	);
}

const styles = StyleSheet.create({
	outer: { marginBottom: 13, paddingHorizontal: 16 },
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 18,
	},
	name: { fontSize: 17, fontFamily: "Arial", flex: 1, marginRight: 12 },
});
