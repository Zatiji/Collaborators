import { StyleSheet, Switch, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { SettingsRow } from "../components/SettingsRow";
import { useConfirmModal } from "../components/ConfirmModal";
import { supabase } from "../lib/supabase";

export function ProfileTab() {
	const { palette, mode, toggleTheme } = useTheme();
	const { confirm } = useConfirmModal();

	function handleDisconnect() {
		confirm("Are you sure you want to disconnect?", () => supabase.auth.signOut(), "Disconnect");
	}

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
			<View style={styles.list}>
				<SettingsRow label="Edit name" onPress={() => {}} />
				<SettingsRow label="Edit email" onPress={() => {}} />
				<SettingsRow
					label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
					onPress={toggleTheme}
					right={
						<Switch
							value={mode === "dark"}
							onValueChange={toggleTheme}
							trackColor={{ true: palette.stormyTeal, false: palette.lightBlue }}
						/>
					}
				/>
				<SettingsRow label="Disconnect" onPress={handleDisconnect} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	list: { marginTop: 12 },
});
