import { createEntryOps } from "./entryOps";
import type { Op } from "./types";

function fakeClock() {
	let counter = 0;
	return {
		getReplicaId: async () => "r1",
		nextLamportCounter: async () => ++counter,
	};
}

test("createEntry emits an insert op then a set_field text op, same item id, same replica", async () => {
	const persisted: Op[] = [];
	const ops = createEntryOps(fakeClock(), async (op) => {
		persisted.push(op);
	});

	const itemId = await ops.createEntry("list-1", "milk");

	expect(persisted).toHaveLength(2);
	expect(persisted[0].opType).toBe("insert");
	expect(persisted[0].itemId).toBe(itemId);
	expect(persisted[0].originId).toBeNull();
	expect(persisted[1].opType).toBe("set_field");
	expect(persisted[1].itemId).toBe(itemId);
	expect(persisted[1].fieldName).toBe("text");
	expect(persisted[1].value).toBe("milk");
	expect(persisted[0].replicaId).toBe("r1");
	expect(persisted[1].lamportCounter).toBeGreaterThan(persisted[0].lamportCounter);
});

test("deleteEntry emits a delete op for the given item", async () => {
	const persisted: Op[] = [];
	const ops = createEntryOps(fakeClock(), async (op) => {
		persisted.push(op);
	});

	await ops.deleteEntry("list-1", "item-9");

	expect(persisted).toHaveLength(1);
	expect(persisted[0].opType).toBe("delete");
	expect(persisted[0].itemId).toBe("item-9");
});

test("setField emits a set_field op with the given field and value", async () => {
	const persisted: Op[] = [];
	const ops = createEntryOps(fakeClock(), async (op) => {
		persisted.push(op);
	});

	await ops.setField("list-1", "item-9", "checked", true);

	expect(persisted).toHaveLength(1);
	expect(persisted[0].opType).toBe("set_field");
	expect(persisted[0].fieldName).toBe("checked");
	expect(persisted[0].value).toBe(true);
});
