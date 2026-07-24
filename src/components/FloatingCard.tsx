import { type PropsWithChildren } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";

const OFFSET = 5;

type Props = PropsWithChildren<{
	style?: ViewStyle;
	onPress?: () => void;
	onLongPress?: () => void;
}>;

export function FloatingCard({ children, style, onPress, onLongPress }: Props) {
	const { palette } = useTheme();
	const pressed = useSharedValue(0);

	const cardStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: pressed.value * OFFSET },
			{ translateY: pressed.value * OFFSET },
		],
	}));

	const shadowStyle = useAnimatedStyle(() => ({
		opacity: 1 - pressed.value,
	}));

	return (
		<View style={styles.wrapper}>
			<Animated.View
				style={[
					styles.shadow,
					{ backgroundColor: palette.shadow },
					shadowStyle,
				]}
			/>
			<Pressable
				onPress={onPress}
				onLongPress={onLongPress}
				onPressIn={() => {
					pressed.value = withTiming(1, { duration: 90 });
				}}
				onPressOut={() => {
					pressed.value = withTiming(0, { duration: 120 });
				}}
			>
				<Animated.View
					style={[
						styles.card,
						{ backgroundColor: palette.surface, borderColor: palette.line },
						style,
						cardStyle,
					]}
				>
					{children}
				</Animated.View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: { position: "relative" },
	shadow: {
		position: "absolute",
		top: OFFSET,
		left: OFFSET,
		width: "100%",
		height: "100%",
		borderRadius: 16,
	},
	card: {
		borderRadius: 16,
		borderWidth: 2,
	},
});
