import { Pressable, StyleSheet, Text, View } from "react-native";
import type { List } from "../types/todo";
import { useAuth } from "../contexts/AuthContext";
import { FloatingCard } from "./FloatingCard";
import { SwipeToDelete } from "./SwipeToDelete";
import { useWarningPopup } from "./WarningPopup";
import { useConfirmModal } from "./ConfirmModal";
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
	const { session } = useAuth();
	const { show } = useWarningPopup();
	const { confirm } = useConfirmModal();

	function handleSwipeDelete() {
		if (list.ownerId !== session?.user.id) {
			show("You don't have permission to delete this list.");
			return;
		}
		confirm(`Delete "${list.name}"?`, onDelete);
	}

	return (
		<View style={styles.outer}>
			<SwipeToDelete onConfirmDelete={handleSwipeDelete}>
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
