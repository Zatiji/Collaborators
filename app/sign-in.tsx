import { useState } from "react";
import { router } from "expo-router";
import { Keyboard, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function SignInScreen() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	async function handleSendCode() {
		const trimmedEmail = email.trim();
		const trimmedUsername = username.trim();
		if (trimmedEmail.length === 0 || trimmedUsername.length === 0) return;
		setSending(true);
		setError(null);
		// options.data only applies if this email doesn't have an account yet;
		// Supabase ignores it for a returning user, so this one screen serves both.
		const { error: otpError } = await supabase.auth.signInWithOtp({
			email: trimmedEmail,
			options: { data: { username: trimmedUsername } },
		});
		setSending(false);
		if (otpError) {
			setError(otpError.message);
			return;
		}
		router.push({ pathname: "/verify", params: { email: trimmedEmail } });
	}

	return (
		<Pressable style={styles.container} onPress={Keyboard.dismiss}>
			<Text style={styles.title}>Sign in</Text>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				placeholder="Email"
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			<TextInput
				style={styles.input}
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
				autoCapitalize="none"
				onSubmitEditing={handleSendCode}
			/>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<Pressable onPress={handleSendCode} style={styles.button} disabled={sending}>
				<Text style={styles.buttonText}>{sending ? "Sending..." : "Send code"}</Text>
			</Pressable>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
	title: { fontSize: 24, fontWeight: "600", marginBottom: 24, textAlign: "center" },
	input: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		marginBottom: 12,
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
