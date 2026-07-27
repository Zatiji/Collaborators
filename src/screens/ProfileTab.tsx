import { StyleSheet, Switch, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { SettingsRow } from "../components/SettingsRow";
import { supabase } from "../lib/supabase";

export function ProfileTab() {
	const { palette, mode, toggleTheme } = useTheme();

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
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
				<SettingsRow label="Disconnect" onPress={() => supabase.auth.signOut()} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	list: { marginTop: 12 },
});
