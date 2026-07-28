export type KVStore = {
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
};

const REPLICA_ID_KEY = "replica_id";
const LAMPORT_COUNTER_KEY = "lamport_counter";

function generateId(): string {
	const cryptoObj = globalThis.crypto as Crypto | undefined;
	if (cryptoObj?.randomUUID) {
		return cryptoObj.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createReplicaClock(store: KVStore) {
	async function getReplicaId(): Promise<string> {
		const existing = await store.get(REPLICA_ID_KEY);
		if (existing) return existing;
		const next = generateId();
		await store.set(REPLICA_ID_KEY, next);
		return next;
	}

	async function nextLamportCounter(): Promise<number> {
		const current = Number(await store.get(LAMPORT_COUNTER_KEY)) || 0;
		const next = current + 1;
		await store.set(LAMPORT_COUNTER_KEY, String(next));
		return next;
	}

	return { getReplicaId, nextLamportCounter };
}
