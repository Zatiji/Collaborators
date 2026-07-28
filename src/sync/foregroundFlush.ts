import { AppState } from "react-native";
import { pushUnsyncedOps } from "./pushQueue";

export function startForegroundFlush(): () => void {
	const subscription = AppState.addEventListener("change", (state) => {
		if (state === "active") {
			pushUnsyncedOps();
		}
	});

	return () => {
		subscription.remove();
	};
}
