import { useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, type GestureType } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

type Props = {
	pages: ReactNode[];
	progress: SharedValue<number>;
	contentWidth: SharedValue<number>;
	gesture: GestureType;
};

export function TabPager({ pages, progress, contentWidth, gesture }: Props) {
	const [viewportWidth, setViewportWidth] = useState(0);

	const trackStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: -progress.value * contentWidth.value }],
	}));

	function onLayout(e: LayoutChangeEvent) {
		const width = e.nativeEvent.layout.width;
		contentWidth.value = width;
		setViewportWidth(width);
	}

	return (
		<View style={styles.viewport} onLayout={onLayout}>
			<GestureDetector gesture={gesture}>
				<Animated.View
					style={[styles.track, { width: viewportWidth * pages.length }, trackStyle]}
				>
					{pages.map((page, i) => (
						<View key={i} style={{ width: viewportWidth }}>
							{page}
						</View>
					))}
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

const styles = StyleSheet.create({
	viewport: { flex: 1, overflow: "hidden" },
	track: { flex: 1, flexDirection: "row" },
});
