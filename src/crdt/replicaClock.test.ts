import { createReplicaClock, type KVStore } from "./replicaClock";

function fakeStore(): KVStore {
	const data = new Map<string, string>();
	return {
		get: async (key) => data.get(key) ?? null,
		set: async (key, value) => {
			data.set(key, value);
		},
	};
}

test("getReplicaId returns the same id across calls, generating it once", async () => {
	const clock = createReplicaClock(fakeStore());
	const first = await clock.getReplicaId();
	const second = await clock.getReplicaId();
	expect(first).toBe(second);
	expect(first.length).toBeGreaterThan(0);
});

test("nextLamportCounter increments monotonically and persists across instances", async () => {
	const store = fakeStore();
	const clockA = createReplicaClock(store);
	expect(await clockA.nextLamportCounter()).toBe(1);
	expect(await clockA.nextLamportCounter()).toBe(2);

	const clockB = createReplicaClock(store);
	expect(await clockB.nextLamportCounter()).toBe(3);
});
