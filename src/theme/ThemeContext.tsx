import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkPalette, lightPalette, type Palette } from "./palette";

type Mode = "light" | "dark";

type ThemeContextValue = {
	palette: Palette;
	mode: Mode;
	toggleTheme: () => void;
};

const STORAGE_KEY = "collaborators.theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
	palette: lightPalette,
	mode: "light",
	toggleTheme: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
	const [mode, setMode] = useState<Mode>("light");

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
			if (stored === "dark" || stored === "light") {
				setMode(stored);
			}
		});
	}, []);

	const toggleTheme = () => {
		setMode((current) => {
			const next = current === "light" ? "dark" : "light";
			AsyncStorage.setItem(STORAGE_KEY, next);
			return next;
		});
	};

	const value = useMemo<ThemeContextValue>(
		() => ({
			palette: mode === "light" ? lightPalette : darkPalette,
			mode,
			toggleTheme,
		}),
		[mode],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
