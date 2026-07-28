import type { Op, ReconstructedEntry } from "./types";

function siblingPriority(op: Op): [number, string] {
	return [op.lamportCounter, op.replicaId];
}

function compareSiblings(a: Op, b: Op): number {
	const [counterA, replicaA] = siblingPriority(a);
	const [counterB, replicaB] = siblingPriority(b);
	if (counterA !== counterB) return counterB - counterA;
	return replicaB.localeCompare(replicaA);
}

function buildOrder(inserts: Op[]): string[] {
	const byOrigin = new Map<string | null, Op[]>();
	for (const op of inserts) {
		const siblings = byOrigin.get(op.originId) ?? [];
		siblings.push(op);
		byOrigin.set(op.originId, siblings);
	}
	for (const siblings of byOrigin.values()) {
		siblings.sort(compareSiblings);
	}

	const order: string[] = [];
	function visit(originId: string | null) {
		const children = byOrigin.get(originId) ?? [];
		for (const child of children) {
			order.push(child.itemId);
			visit(child.itemId);
		}
	}
	visit(null);
	return order;
}

export function reconstruct(ops: Op[]): ReconstructedEntry[] {
	const inserts = ops.filter((op) => op.opType === "insert" && op.listId === ops[0]?.listId);
	const order = buildOrder(inserts);

	const tombstoned = new Set<string>();
	for (const op of ops) {
		if (op.opType === "delete") tombstoned.add(op.itemId);
	}

	const fieldWinners = new Map<string, Map<string, Op>>();
	for (const op of ops) {
		if (op.opType !== "set_field" || !op.fieldName) continue;
		if (tombstoned.has(op.itemId)) continue;
		const fields = fieldWinners.get(op.itemId) ?? new Map<string, Op>();
		const current = fields.get(op.fieldName);
		if (!current || compareSiblings(op, current) < 0) {
			fields.set(op.fieldName, op);
		}
		fieldWinners.set(op.itemId, fields);
	}

	const result: ReconstructedEntry[] = [];
	for (const itemId of order) {
		if (tombstoned.has(itemId)) continue;
		const fields = fieldWinners.get(itemId);
		result.push({
			id: itemId,
			listId: ops[0]?.listId ?? "",
			text: (fields?.get("text")?.value as string) ?? "",
			completed: (fields?.get("checked")?.value as boolean) ?? false,
		});
	}
	return result;
}
