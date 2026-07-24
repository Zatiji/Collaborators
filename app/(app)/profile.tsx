import { Stack } from "expo-router";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { SettingsRow } from "../../src/components/SettingsRow";
import { BottomNav } from "../../src/components/BottomNav";
import { supabase } from "../../src/lib/supabase";

export default function ProfileScreen() {
	const { palette, mode, toggleTheme } = useTheme();
	const { session } = useAuth();

	const username =
		(session?.user.user_metadata as { username?: string } | undefined)?.username ?? "";

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: username,
					headerStyle: { backgroundColor: palette.background },
					headerShadowVisible: false,
				}}
			/>
			<View style={styles.list}>
				<SettingsRow label="Edit name" onPress={() => {}} />
				<SettingsRow label="Edit email" onPress={() => {}} />
				<SettingsRow
					label="Theme"
					onPress={() => {}}
					right={
						<Switch
							value={mode === "dark"}
							onValueChange={toggleTheme}
							trackColor={{ true: palette.stormyTeal, false: palette.lightBlue }}
						/>
					}
				/>
				<SettingsRow
					label="Disconnect"
					onPress={() => supabase.auth.signOut()}
				/>
			</View>
			<BottomNav />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	list: { marginTop: 12 },
});
