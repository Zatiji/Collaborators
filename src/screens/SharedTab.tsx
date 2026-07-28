import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getPermission, mockSharedWithMeLists } from "../mock/sharing";
import { ListRow } from "../components/ListRow";
import { ShareModal } from "../components/ShareModal";
import { useWarningPopup } from "../components/WarningPopup";
import { useTheme } from "../theme/ThemeContext";

export function SharedTab() {
	const { palette } = useTheme();
	const { show } = useWarningPopup();
	const [shareListId, setShareListId] = useState<string | null>(null);
	const sorted = [...mockSharedWithMeLists].sort((a, b) => b.updatedAt - a.updatedAt);

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
			<FlatList
				data={sorted}
				keyExtractor={(list) => list.id}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<ListRow
						list={{ id: item.id, name: item.name, ownerId: "", createdAt: item.updatedAt, updatedAt: item.updatedAt }}
						onPress={() => {}}
						onShare={() => {
							if (getPermission(item.id) === "read") {
								show("You don't have permission to share this list.");
								return;
							}
							setShareListId(item.id);
						}}
						onDelete={() => {}}
					/>
				)}
				ListEmptyComponent={
					<Text style={[styles.empty, { color: palette.textMuted }]}>
						No lists have been shared with you yet.
					</Text>
				}
			/>
			<ShareModal
				visible={shareListId !== null}
				listId={shareListId}
				onClose={() => setShareListId(null)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	listContent: { paddingTop: 16, paddingBottom: 120 },
	empty: { textAlign: "center", marginTop: 24, fontFamily: "Arial" },
});
