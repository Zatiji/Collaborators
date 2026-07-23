import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

function RootNavigator() {
	const { session, isLoading } = useAuth();

	if (isLoading) {
		return null;
	}

	return (
		<Stack>
			<Stack.Protected guard={!!session}>
				<Stack.Screen name="(app)" options={{ headerShown: false }} />
			</Stack.Protected>
			<Stack.Protected guard={!session}>
				<Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
				<Stack.Screen name="verify" options={{ title: "Verify" }} />
			</Stack.Protected>
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootNavigator />
		</AuthProvider>
	);
}
