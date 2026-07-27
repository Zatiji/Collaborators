import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, type GestureType } from "react-native-gesture-handler";
import Animated, {
	interpolate,
	useAnimatedStyle,
	type SharedValue,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { HomeIcon, ProfileSilhouetteIcon, SharedIcon } from "./icons";

const TAB_SIZE = 44;
const GAP = 8;
const PADDING = 12;

const tabs = [
	{ key: "shared", icon: SharedIcon },
	{ key: "home", icon: HomeIcon },
	{ key: "profile", icon: ProfileSilhouetteIcon },
];

type Props = {
	progress: SharedValue<number>;
	navWidth: SharedValue<number>;
	gesture: GestureType;
	onSelect: (index: number) => void;
};

export function BottomNav({ progress, navWidth, gesture, onSelect }: Props) {
	const { palette } = useTheme();

	const bubbleStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(
					progress.value,
					tabs.map((_, i) => i),
					tabs.map((_, i) => i * (TAB_SIZE + GAP)),
				),
			},
		],
	}));

	function onLayout(e: LayoutChangeEvent) {
		navWidth.value = e.nativeEvent.layout.width;
	}

	return (
		<View style={styles.wrapper} pointerEvents="box-none">
			<GestureDetector gesture={gesture}>
				<View
					style={[styles.pill, { backgroundColor: palette.surface, borderColor: palette.line }]}
					onLayout={onLayout}
				>
					<Animated.View
						style={[styles.bubble, { backgroundColor: palette.stormyTeal }, bubbleStyle]}
					/>
					{tabs.map(({ key, icon: Icon }, i) => (
						<TabIcon
							key={key}
							Icon={Icon}
							index={i}
							progress={progress}
							activeColor={palette.background}
							inactiveColor={palette.line}
							onPress={() => onSelect(i)}
						/>
					))}
				</View>
			</GestureDetector>
		</View>
	);
}

function TabIcon({
	Icon,
	index,
	progress,
	activeColor,
	inactiveColor,
	onPress,
}: {
	Icon: typeof HomeIcon;
	index: number;
	progress: SharedValue<number>;
	activeColor: string;
	inactiveColor: string;
	onPress: () => void;
}) {
	const activeStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [index - 1, index, index + 1], [0, 1, 0], "clamp"),
	}));

	return (
		<Pressable onPress={onPress} style={styles.tab} hitSlop={8}>
			<Icon size={24} color={inactiveColor} />
			<Animated.View style={[styles.iconOverlay, activeStyle]}>
				<Icon size={24} color={activeColor} />
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 24,
		alignItems: "center",
	},
	pill: {
		flexDirection: "row",
		borderWidth: 2,
		borderRadius: 32,
		paddingVertical: 8,
		paddingHorizontal: 12,
		gap: 8,
	},
	bubble: {
		position: "absolute",
		top: 8,
		left: 12,
		width: TAB_SIZE,
		height: TAB_SIZE,
		borderRadius: 22,
	},
	tab: {
		width: TAB_SIZE,
		height: TAB_SIZE,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
	iconOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
	},
});
