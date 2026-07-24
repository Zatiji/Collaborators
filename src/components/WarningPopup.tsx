import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";

type WarningPopupContextValue = {
	show: (message: string) => void;
};

const WarningPopupContext = createContext<WarningPopupContextValue>({
	show: () => {},
});

export function WarningPopupProvider({ children }: PropsWithChildren) {
	const { palette } = useTheme();
	const [message, setMessage] = useState<string | null>(null);
	const progress = useSharedValue(0);
	const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const show = useCallback((next: string) => {
		if (dismissTimeoutRef.current) {
			clearTimeout(dismissTimeoutRef.current);
			dismissTimeoutRef.current = null;
		}
		setMessage(next);
		progress.value = withTiming(1, { duration: 180 });
	}, [progress]);

	const dismiss = useCallback(() => {
		progress.value = withTiming(0, { duration: 150 });
		if (dismissTimeoutRef.current) {
			clearTimeout(dismissTimeoutRef.current);
		}
		dismissTimeoutRef.current = setTimeout(() => {
			setMessage(null);
			dismissTimeoutRef.current = null;
		}, 150);
	}, [progress]);

	useEffect(() => {
		return () => {
			if (dismissTimeoutRef.current) {
				clearTimeout(dismissTimeoutRef.current);
			}
		};
	}, []);

	const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.5 }));
	const cardStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

	const value = useMemo(() => ({ show }), [show]);

	return (
		<WarningPopupContext.Provider value={value}>
			{children}
			<Modal visible={message !== null} transparent animationType="none">
				<Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
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
						<Text style={[styles.message, { color: palette.text }]}>{message}</Text>
						<Pressable
							onPress={dismiss}
							style={[styles.button, { borderColor: palette.line, backgroundColor: palette.rosewood }]}
						>
							<Text style={[styles.buttonText, { color: palette.background }]}>OK</Text>
						</Pressable>
					</Animated.View>
				</View>
			</Modal>
		</WarningPopupContext.Provider>
	);
}

export function useWarningPopup() {
	return useContext(WarningPopupContext);
}

const styles = StyleSheet.create({
	dim: { flex: 1 },
	center: {
		...StyleSheet.absoluteFill,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	card: {
		width: "100%",
		maxWidth: 320,
		borderRadius: 16,
		borderWidth: 2,
		padding: 20,
	},
	message: { fontSize: 16, fontFamily: "Arial", marginBottom: 16, textAlign: "center" },
	button: {
		alignSelf: "center",
		borderRadius: 12,
		borderWidth: 2,
		paddingVertical: 8,
		paddingHorizontal: 24,
	},
	buttonText: { fontFamily: "Arial", fontWeight: "600", fontSize: 15 },
});
