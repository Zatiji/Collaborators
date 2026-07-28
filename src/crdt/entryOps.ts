import type { FieldName, Op, OpType } from "./types";

type Clock = {
	getReplicaId(): Promise<string>;
	nextLamportCounter(): Promise<number>;
};

type PersistOp = (op: Op) => Promise<void>;

function generateId(): string {
	const cryptoObj = globalThis.crypto as Crypto | undefined;
	if (cryptoObj?.randomUUID) {
		return cryptoObj.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function buildOp(
	clock: Clock,
	listId: string,
	opType: OpType,
	itemId: string,
	extra: Partial<Op>,
): Promise<Op> {
	const replicaId = await clock.getReplicaId();
	const lamportCounter = await clock.nextLamportCounter();
	return {
		id: generateId(),
		listId,
		replicaId,
		lamportCounter,
		opType,
		itemId,
		originId: null,
		fieldName: null,
		value: null,
		createdAt: Date.now(),
		...extra,
	};
}

export function createEntryOps(clock: Clock, persistOp: PersistOp) {
	async function createEntry(listId: string, text: string): Promise<string> {
		const itemId = generateId();
		const insertOp = await buildOp(clock, listId, "insert", itemId, { originId: null });
		await persistOp(insertOp);
		const textOp = await buildOp(clock, listId, "set_field", itemId, {
			fieldName: "text",
			value: text,
		});
		await persistOp(textOp);
		return itemId;
	}

	async function deleteEntry(listId: string, itemId: string): Promise<void> {
		const op = await buildOp(clock, listId, "delete", itemId, {});
		await persistOp(op);
	}

	async function setField(
		listId: string,
		itemId: string,
		fieldName: FieldName,
		value: string | boolean,
	): Promise<void> {
		const op = await buildOp(clock, listId, "set_field", itemId, { fieldName, value });
		await persistOp(op);
	}

	return { createEntry, deleteEntry, setField };
}
