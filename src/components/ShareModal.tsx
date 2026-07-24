import { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { getSharedUsers, mockUsers, shareList, type MockUser } from "../mock/sharing";

type Props = {
	visible: boolean;
	listId: string | null;
	onClose: () => void;
};

export function ShareModal({ visible, listId, onClose }: Props) {
	const { palette } = useTheme();
	const progress = useSharedValue(0);
	const [query, setQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	useEffect(() => {
		if (visible && listId) {
			setSelectedIds(getSharedUsers(listId).map((user) => user.id));
			setQuery("");
			progress.value = withTiming(1, { duration: 200 });
		} else {
			progress.value = withTiming(0, { duration: 150 });
		}
	}, [visible, listId, progress]);

	const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.5 }));
	const cardStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

	const filteredUsers = useMemo(
		() =>
			mockUsers.filter((user) =>
				user.username.toLowerCase().includes(query.trim().toLowerCase()),
			),
		[query],
	);

	const selectedUsers = mockUsers.filter((user) => selectedIds.includes(user.id));

	function toggleUser(id: string) {
		setSelectedIds((current) =>
			current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
		);
	}

	function handleShare() {
		if (listId) {
			shareList(listId, selectedIds);
		}
		onClose();
	}

	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
			<Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
				<Animated.View style={[styles.dim, { backgroundColor: palette.shadow }, dimStyle]} />
			</Pressable>
			<View style={styles.center} pointerEvents="box-none">
				<Animated.View
					style={[
						styles.card,
						{ backgroundColor: palette.surface, borderColor: palette.line },
						cardStyle,
					]}
				>
					<Text style={[styles.title, { color: palette.text }]}>Share list</Text>
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search users"
						placeholderTextColor={palette.textMuted}
						style={[styles.input, { borderColor: palette.line, color: palette.text }]}
					/>
					<FlatList
						horizontal
						data={selectedUsers}
						keyExtractor={(user) => user.id}
						style={styles.chipRow}
						ListEmptyComponent={
							<Text style={[styles.emptyChips, { color: palette.textMuted }]}>
								No one added yet
							</Text>
						}
						renderItem={({ item }) => (
							<Pressable
								onPress={() => toggleUser(item.id)}
								style={[styles.chip, { backgroundColor: palette.lightBlue, borderColor: palette.line }]}
							>
								<Text style={styles.chipText}>{item.username}</Text>
							</Pressable>
						)}
					/>
					<FlatList
						data={filteredUsers}
						keyExtractor={(user) => user.id}
						style={styles.userList}
						renderItem={({ item }: { item: MockUser }) => {
							const selected = selectedIds.includes(item.id);
							return (
								<Pressable
									onPress={() => toggleUser(item.id)}
									style={styles.userRow}
								>
									<View
										style={[
											styles.avatar,
											{
												borderColor: palette.line,
												backgroundColor: selected ? palette.stormyTeal : palette.background,
											},
										]}
									>
										<Text
											style={{
												color: selected ? palette.background : palette.text,
												fontFamily: "Arial",
												fontWeight: "700",
											}}
										>
											{item.initial}
										</Text>
									</View>
									<Text style={[styles.username, { color: palette.text }]}>{item.username}</Text>
								</Pressable>
							);
						}}
					/>
					<Pressable
						onPress={handleShare}
						style={[styles.shareButton, { backgroundColor: palette.rosewood, borderColor: palette.line }]}
					>
						<Text style={[styles.shareButtonText, { color: palette.background }]}>Share</Text>
					</Pressable>
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	dim: { flex: 1 },
	center: {
		...StyleSheet.absoluteFill,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	card: {
		width: "100%",
		maxWidth: 360,
		maxHeight: "80%",
		borderRadius: 20,
		borderWidth: 2,
		padding: 20,
	},
	title: { fontSize: 18, fontFamily: "Arial", fontWeight: "700", marginBottom: 12 },
	input: {
		borderWidth: 2,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontFamily: "Arial",
		marginBottom: 12,
	},
	chipRow: { flexGrow: 0, marginBottom: 12 },
	emptyChips: { fontFamily: "Arial", fontSize: 13 },
	chip: {
		borderWidth: 2,
		borderRadius: 16,
		paddingVertical: 6,
		paddingHorizontal: 12,
		marginRight: 8,
	},
	chipText: { fontFamily: "Arial", fontSize: 13, fontWeight: "600" },
	userList: { maxHeight: 220, marginBottom: 16 },
	userRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	username: { fontFamily: "Arial", fontSize: 15 },
	shareButton: {
		borderWidth: 2,
		borderRadius: 14,
		paddingVertical: 12,
		alignItems: "center",
	},
	shareButtonText: { fontFamily: "Arial", fontWeight: "700", fontSize: 16 },
});
