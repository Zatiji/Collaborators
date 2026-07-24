export interface List {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
}

export interface Entry {
	id: string;
	listId: string;
	text: string;
	completed: boolean;
	createdAt: number;
	updatedAt: number;
}
