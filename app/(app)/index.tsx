import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { useSwipeTabs } from "../../src/hooks/useSwipeTabs";
import { TabPager } from "../../src/components/TabPager";
import { BottomNav } from "../../src/components/BottomNav";
import { SharedTab } from "../../src/screens/SharedTab";
import { HomeTab } from "../../src/screens/HomeTab";
import { ProfileTab } from "../../src/screens/ProfileTab";

const TITLES = ["Shared with you", "", ""];

export default function TabsScreen() {
	const { palette } = useTheme();
	const { session } = useAuth();
	const { progress, index, contentWidth, navWidth, contentGesture, navGesture, goTo } =
		useSwipeTabs(3, 1);

	const username =
		(session?.user.user_metadata as { username?: string } | undefined)?.username ?? "";
	const title = TITLES[index] || username;

	return (
		<View style={[styles.container, { backgroundColor: palette.background }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: title,
					headerStyle: { backgroundColor: palette.background },
					headerTintColor: palette.text,
					headerShadowVisible: false,
					headerBackVisible: false,
				}}
			/>
			<TabPager
				progress={progress}
				contentWidth={contentWidth}
				gesture={contentGesture}
				pages={[<SharedTab key="shared" />, <HomeTab key="home" />, <ProfileTab key="profile" />]}
			/>
			<BottomNav progress={progress} navWidth={navWidth} gesture={navGesture} onSelect={goTo} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
