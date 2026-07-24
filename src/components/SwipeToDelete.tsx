import { type PropsWithChildren, useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "../theme/ThemeContext";
import { TrashIcon } from "./icons";

type Props = PropsWithChildren<{
	onConfirmDelete: () => void;
}>;

export function SwipeToDelete({ children, onConfirmDelete }: Props) {
	const { palette } = useTheme();
	const [armed, setArmed] = useState(false);
	const swipeableRef = useRef<Swipeable>(null);

	function handlePress() {
		if (armed) {
			swipeableRef.current?.close();
			setArmed(false);
			onConfirmDelete();
			return;
		}
		setArmed(true);
	}

	return (
		<Swipeable
			ref={swipeableRef}
			renderRightActions={() => (
				<Pressable
					onPress={handlePress}
					style={[styles.action, { backgroundColor: palette.rosewood }]}
				>
					<TrashIcon size={20} color={palette.background} />
					<Text style={[styles.label, { color: palette.background }]}>
						{armed ? "Confirm?" : "Delete"}
					</Text>
				</Pressable>
			)}
			onSwipeableWillClose={() => setArmed(false)}
		>
			{children}
		</Swipeable>
	);
}

const styles = StyleSheet.create({
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
