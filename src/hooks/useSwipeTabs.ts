import { useCallback, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import {
	Easing,
	runOnJS,
	useSharedValue,
	withTiming,
	type SharedValue,
} from "react-native-reanimated";

const SNAP_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

function clamp(value: number, min: number, max: number) {
	"worklet";
	return Math.min(Math.max(value, min), max);
}

export function useSwipeTabs(pageCount: number, initialIndex = 0) {
	const progress = useSharedValue(initialIndex);
	const startProgress = useSharedValue(initialIndex);
	const contentWidth = useSharedValue(1);
	const navWidth = useSharedValue(1);
	const [index, setIndex] = useState(initialIndex);

	const settle = useCallback((next: number) => {
		setIndex(next);
	}, []);

	const snapTo = (target: number) => {
		"worklet";
		const clamped = clamp(Math.round(target), 0, pageCount - 1);
		progress.value = withTiming(clamped, SNAP_TIMING);
		runOnJS(settle)(clamped);
	};

	const contentGesture = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.failOffsetY([-10, 10])
		.onStart(() => {
			startProgress.value = progress.value;
		})
		.onUpdate((e) => {
			progress.value = clamp(
				startProgress.value - e.translationX / contentWidth.value,
				0,
				pageCount - 1,
			);
		})
		.onEnd((e) => {
			const velocityBias = e.velocityX < -400 ? 0.5 : e.velocityX > 400 ? -0.5 : 0;
			snapTo(progress.value + velocityBias);
		});

	const navGesture = Gesture.Pan()
		.onStart(() => {
			startProgress.value = progress.value;
		})
		.onUpdate((e) => {
			const tabWidth = navWidth.value / pageCount;
			progress.value = clamp(
				startProgress.value - e.translationX / tabWidth,
				0,
				pageCount - 1,
			);
		})
		.onEnd(() => {
			snapTo(progress.value);
		});

	const goTo = useCallback(
		(next: number) => {
			progress.value = withTiming(next, SNAP_TIMING);
			setIndex(next);
		},
		[progress],
	);

	return {
		progress: progress as SharedValue<number>,
		index,
		contentWidth,
		navWidth,
		contentGesture,
		navGesture,
		goTo,
	};
}
