@AGENTS.md

# Product vision

Collaborators is a collaborative, **offline-first** shared chore/grocery list app (Expo/React Native + Supabase). People share a list and edit it together — including while offline — with changes converging automatically once back online. This is a CRDT system, not "a database with sync": full architecture in `docs/superpowers/specs/2026-07-20-crdt-shared-list-design.md` — read it before touching anything sync- or data-layer-related.

Key decisions from that spec:
- **Supabase is a relay, not an authority.** It durably stores an append-only `ops` log and broadcasts new ops via Realtime. All CRDT merge logic (RGA structure for insert/delete, LWW field resolution, tombstones) runs identically on every client via a pure `reconstruct(oplog) -> currentList` function — Supabase never resolves a conflict itself.
- Every mutation is one `ops` row, identified by `{replica_id, lamport_counter}` — never `created_at`. Writes are optimistic: apply locally first, queue in local SQLite, push to Supabase in the background. Online and offline are the same code path.
- Permissions are list-level (`list_shares`), not item-level — anyone shared on a list can edit anything on it, like a shared Google Doc.
- Friends are derived from `list_shares` (no separate friend graph). Invites are targeted by email/username, landing in an in-app inbox, with **Expo push notifications only — no email notifications** for invites/activity.

Companion docs (read the relevant one before starting related work):
- `docs/superpowers/specs/2026-07-22-local-todo-mvp-design.md` — the local-only MVP this CRDT layer replaces/wraps, not extends in place.
- `docs/superpowers/plans/2026-07-22-local-todo-mvp.md`, `docs/superpowers/plans/2026-07-22-supabase-auth.md` — implementation plans already executed.

## Current state vs. spec (needs reconciling)

- **Data layer not yet built:** `lists`/`entries` still live only in local SQLite (`src/db/schema.ts`) as plain rows, not an `ops` log. The CRDT data layer (§2-3 of the spec) hasn't been implemented yet.

Auth is settled as email+OTP only, no password, per spec §6 (2026-07-23 decision, after briefly prototyping username+password login and reverting it). `app/sign-in.tsx` collects email+username and calls `signInWithOtp`; `app/verify.tsx` confirms the code. `public.profiles` (`supabase/migrations/0001_profiles_username_login.sql`) exists solely for username search/display when sharing a list — it plays no role in login.
