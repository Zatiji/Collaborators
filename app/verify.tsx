import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Keyboard, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function VerifyScreen() {
	const { email } = useLocalSearchParams<{ email: string }>();
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [verifying, setVerifying] = useState(false);

	async function handleVerify() {
		const trimmed = code.trim();
		if (trimmed.length === 0 || !email) return;
		setVerifying(true);
		setError(null);
		const { error: verifyError } = await supabase.auth.verifyOtp({
			email,
			token: trimmed,
			type: "email",
		});
		setVerifying(false);
		if (verifyError) {
			setError(verifyError.message);
		}
	}

	return (
		<Pressable style={styles.container} onPress={Keyboard.dismiss}>
			<Text style={styles.title}>Enter code</Text>
			<Text style={styles.subtitle}>Sent to {email}</Text>
			<TextInput
				style={styles.input}
				value={code}
				onChangeText={setCode}
				placeholder="8-digit code"
				keyboardType="number-pad"
				maxLength={8}
				onSubmitEditing={handleVerify}
			/>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<Pressable onPress={handleVerify} style={styles.button} disabled={verifying}>
				<Text style={styles.buttonText}>{verifying ? "Verifying..." : "Verify"}</Text>
			</Pressable>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
	title: { fontSize: 24, fontWeight: "600", marginBottom: 8, textAlign: "center" },
	subtitle: { fontSize: 14, color: "#666", marginBottom: 24, textAlign: "center" },
	input: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		marginBottom: 12,
		textAlign: "center",
		letterSpacing: 4,
	},
	error: { color: "#d00", marginBottom: 12 },
	button: {
		backgroundColor: "#007aff",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
