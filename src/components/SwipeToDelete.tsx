import { type PropsWithChildren, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "../theme/ThemeContext";
import { TrashIcon } from "./icons";

type Props = PropsWithChildren<{
	onConfirmDelete: () => void;
}>;

export function SwipeToDelete({ children, onConfirmDelete }: Props) {
	const { palette } = useTheme();
	const swipeableRef = useRef<Swipeable>(null);

	function handlePress() {
		swipeableRef.current?.close();
		onConfirmDelete();
	}

	return (
		<Swipeable
			ref={swipeableRef}
			containerStyle={styles.container}
			renderRightActions={() => (
				<Pressable
					onPress={handlePress}
					style={[styles.action, { backgroundColor: palette.rosewood }]}
				>
					<TrashIcon size={20} color={palette.background} />
					<Text style={[styles.label, { color: palette.background }]}>Delete</Text>
				</Pressable>
			)}
		>
			{children}
		</Swipeable>
	);
}

const styles = StyleSheet.create({
	container: { overflow: "visible" },
	action: {
		width: 96,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 16,
		marginLeft: 8,
	},
	label: {
		marginTop: 4,
		fontSize: 13,
		fontWeight: "600",
		fontFamily: "Arial",
	},
});
