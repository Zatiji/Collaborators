export type MockUser = {
	id: string;
	username: string;
	initial: string;
};

export type PermissionLevel = "owner" | "write" | "read";

export const mockUsers: MockUser[] = [
	{ id: "u1", username: "harper", initial: "H" },
	{ id: "u2", username: "priya", initial: "P" },
	{ id: "u3", username: "davidm", initial: "D" },
	{ id: "u4", username: "noa", initial: "N" },
	{ id: "u5", username: "kwame", initial: "K" },
];

type ShareState = {
	sharedUserIdsByList: Record<string, string[]>;
	permissionByList: Record<string, PermissionLevel>;
};

const state: ShareState = {
	sharedUserIdsByList: {},
	permissionByList: {
		"list-shared-1": "read",
		"list-shared-2": "write",
	},
};

export const mockSharedWithMeLists = [
	{ id: "list-shared-1", name: "Camping trip supplies", updatedAt: Date.now() - 1000 * 60 * 60 },
	{ id: "list-shared-2", name: "Office snacks", updatedAt: Date.now() - 1000 * 60 * 60 * 5 },
];

export function getPermission(listId: string): PermissionLevel {
	return state.permissionByList[listId] ?? "owner";
}

export function getSharedUsers(listId: string): MockUser[] {
	const ids = state.sharedUserIdsByList[listId] ?? [];
	return mockUsers.filter((user) => ids.includes(user.id));
}

export function shareList(listId: string, userIds: string[]): void {
	state.sharedUserIdsByList[listId] = userIds;
}
