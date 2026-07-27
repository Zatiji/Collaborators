import {
	createContext,
	useCallback,
	useContext,
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

type ConfirmModalContextValue = {
	confirm: (message: string, onConfirm: () => void, confirmLabel?: string) => void;
};

const ConfirmModalContext = createContext<ConfirmModalContextValue>({
	confirm: () => {},
});

export function ConfirmModalProvider({ children }: PropsWithChildren) {
	const { palette } = useTheme();
	const [message, setMessage] = useState<string | null>(null);
	const [confirmLabel, setConfirmLabel] = useState("Delete");
	const onConfirmRef = useRef<() => void>(() => {});
	const progress = useSharedValue(0);

	const confirm = useCallback(
		(next: string, onConfirm: () => void, label = "Delete") => {
			onConfirmRef.current = onConfirm;
			setMessage(next);
			setConfirmLabel(label);
			progress.value = withTiming(1, { duration: 180 });
		},
		[progress]
	);

	const dismiss = useCallback(() => {
		progress.value = withTiming(0, { duration: 150 });
		setTimeout(() => setMessage(null), 150);
	}, [progress]);

	function handleConfirm() {
		const callback = onConfirmRef.current;
		dismiss();
		callback();
	}

	const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.5 }));
	const cardStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

	const value = useMemo(() => ({ confirm }), [confirm]);

	return (
		<ConfirmModalContext.Provider value={value}>
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
						<View style={styles.row}>
							<Pressable
								onPress={dismiss}
								style={[styles.button, { borderColor: palette.line }]}
							>
								<Text style={[styles.buttonText, { color: palette.text }]}>Cancel</Text>
							</Pressable>
							<Pressable
								onPress={handleConfirm}
								style={[
									styles.button,
									{ borderColor: palette.line, backgroundColor: palette.rosewood },
								]}
							>
								<Text style={[styles.buttonText, { color: palette.background }]}>
									{confirmLabel}
								</Text>
							</Pressable>
						</View>
					</Animated.View>
				</View>
			</Modal>
		</ConfirmModalContext.Provider>
	);
}

export function useConfirmModal() {
	return useContext(ConfirmModalContext);
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
	row: { flexDirection: "row", justifyContent: "center", gap: 12 },
	button: {
		borderRadius: 12,
		borderWidth: 2,
		paddingVertical: 8,
		paddingHorizontal: 24,
	},
	buttonText: { fontFamily: "Arial", fontWeight: "600", fontSize: 15 },
});
