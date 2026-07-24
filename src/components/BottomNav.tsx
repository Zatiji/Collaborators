import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { HomeIcon, ProfileSilhouetteIcon, SharedIcon } from "./icons";

export function BottomNav() {
	const { palette } = useTheme();
	const pathname = usePathname();

	const tabs = [
		{ key: "shared", icon: SharedIcon, path: "/shared" as const },
		{ key: "home", icon: HomeIcon, path: "/" as const },
		{ key: "profile", icon: ProfileSilhouetteIcon, path: "/profile" as const },
	];

	return (
		<View style={styles.wrapper} pointerEvents="box-none">
			<View
				style={[
					styles.pill,
					{ backgroundColor: palette.surface, borderColor: palette.line },
				]}
			>
				{tabs.map(({ key, icon: Icon, path }) => {
					const active = pathname === path;
					return (
						<Pressable
							key={key}
							onPress={() => router.navigate(path)}
							style={[
								styles.tab,
								active && { backgroundColor: palette.stormyTeal },
							]}
							hitSlop={8}
						>
							<Icon size={24} color={active ? palette.background : palette.line} />
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 24,
		alignItems: "center",
	},
	pill: {
		flexDirection: "row",
		borderWidth: 2,
		borderRadius: 32,
		paddingVertical: 8,
		paddingHorizontal: 12,
		gap: 8,
	},
	tab: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
});
