export type OpType = "insert" | "delete" | "set_field";

export type FieldName = "text" | "checked";

export type Op = {
	id: string;
	listId: string;
	replicaId: string;
	lamportCounter: number;
	opType: OpType;
	itemId: string;
	originId: string | null;
	fieldName: FieldName | null;
	value: string | boolean | null;
	createdAt: number;
};

export type ReconstructedEntry = {
	id: string;
	listId: string;
	text: string;
	completed: boolean;
};
