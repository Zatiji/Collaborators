import { reconstruct } from "./reconstruct";
import type { Op } from "./types";

function insertOp(overrides: Partial<Op>): Op {
	return {
		id: "op-" + Math.random(),
		listId: "list-1",
		replicaId: "r1",
		lamportCounter: 1,
		opType: "insert",
		itemId: "item-1",
		originId: null,
		fieldName: null,
		value: null,
		createdAt: 0,
		...overrides,
	};
}

function setFieldOp(overrides: Partial<Op>): Op {
	return {
		id: "op-" + Math.random(),
		listId: "list-1",
		replicaId: "r1",
		lamportCounter: 2,
		opType: "set_field",
		itemId: "item-1",
		originId: null,
		fieldName: "text",
		value: "milk",
		createdAt: 0,
		...overrides,
	};
}

test("reconstruct produces the same result regardless of op arrival order", () => {
	const ops: Op[] = [
		insertOp({ itemId: "a", originId: null, replicaId: "r1", lamportCounter: 1 }),
		setFieldOp({ itemId: "a", fieldName: "text", value: "milk", replicaId: "r1", lamportCounter: 2 }),
		insertOp({ itemId: "b", originId: "a", replicaId: "r2", lamportCounter: 1 }),
		setFieldOp({ itemId: "b", fieldName: "text", value: "eggs", replicaId: "r2", lamportCounter: 2 }),
	];

	const forward = reconstruct(ops);
	const shuffled = reconstruct([...ops].reverse());

	expect(forward).toEqual(shuffled);
	expect(forward.map((e) => e.id)).toEqual(["a", "b"]);
	expect(forward.map((e) => e.text)).toEqual(["milk", "eggs"]);
});

test("a set_field op with a higher lamport counter than a delete does not resurrect the item", () => {
	const ops: Op[] = [
		insertOp({ itemId: "a", originId: null, replicaId: "r1", lamportCounter: 1 }),
		setFieldOp({ itemId: "a", fieldName: "text", value: "milk", replicaId: "r1", lamportCounter: 2 }),
		{
			id: "del-1",
			listId: "list-1",
			replicaId: "r2",
			lamportCounter: 3,
			opType: "delete",
			itemId: "a",
			originId: null,
			fieldName: null,
			value: null,
			createdAt: 0,
		},
		setFieldOp({ itemId: "a", fieldName: "checked", value: true, replicaId: "r1", lamportCounter: 99 }),
	];

	expect(reconstruct(ops)).toEqual([]);
});

test("concurrent inserts at the same origin are ordered deterministically regardless of arrival order", () => {
	const ops: Op[] = [
		insertOp({ itemId: "a", originId: null, replicaId: "r1", lamportCounter: 1 }),
		insertOp({ itemId: "b", originId: "a", replicaId: "r1", lamportCounter: 2 }),
		insertOp({ itemId: "c", originId: "a", replicaId: "r2", lamportCounter: 2 }),
	];

	const order = reconstruct(ops).map((e) => e.id);
	const reversedOrder = reconstruct([...ops].reverse()).map((e) => e.id);

	expect(order).toEqual(reversedOrder);
	expect(order[0]).toBe("a");
	expect(new Set(order.slice(1))).toEqual(new Set(["b", "c"]));
});
