import { useState } from "react";
import { Stack } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getPermission, mockSharedWithMeLists } from "../../src/mock/sharing";
import { ListRow } from "../../src/components/ListRow";
import { BottomNav } from "../../src/components/BottomNav";
import { ShareModal } from "../../src/components/ShareModal";
import { useWarningPopup } from "../../src/components/WarningPopup";
import { useTheme } from "../../src/theme/ThemeContext";

export default function SharedScreen() {
	const { palette } = useTheme();
	const { show } = useWarningPopup();
	const [shareListId, setShareListId] = useState<string | null>(null);
	const sorted = [...mockSharedWithMeLists].sort((a, b) => b.updatedAt - a.updatedAt);

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: "Shared with you",
					headerStyle: { backgroundColor: palette.background },
					headerShadowVisible: false,
				}}
			/>
			<FlatList
				data={sorted}
				keyExtractor={(list) => list.id}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<ListRow
						list={{ id: item.id, name: item.name, createdAt: item.updatedAt, updatedAt: item.updatedAt }}
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
			<BottomNav />
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
