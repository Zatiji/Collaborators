# Collaborators

An offline-first, collaborative chore/grocery list app. People share a list and edit it together, including while offline, with everyone's changes converging automatically once back online. Built with Expo (React Native) and Supabase.

## Vision

The target architecture is a CRDT system, not "a database with sync": Supabase durably stores an append-only log of operations (`ops`) and broadcasts new ones over Realtime, but it never resolves a conflict itself. Every client runs the same pure `reconstruct(oplog) -> currentList` function, so two people editing the same list offline on opposite sides of the world converge to the same list once their ops reach each other. No "who wins" logic lives on the server.

Other decisions baked into that vision:
- **List-level permissions.** Anyone shared on a list can edit anything on it, like a shared Google Doc, no per-item ownership.
- **Friends are derived, not a separate feature.** Your friends list is just everyone you share a list with, deduplicated.
- **Invites are targeted and push-notified**, not email-based or link-based (for now). You invite someone by email/username, they see it in an in-app inbox and get a push notification.

The full design (data model, sync flow, tie-break rules, error handling) is written up in [`docs/superpowers/specs/2026-07-20-crdt-shared-list-design.md`](docs/superpowers/specs/2026-07-20-crdt-shared-list-design.md). That doc is somewhat ahead of the code below; treat the code as ground truth for what's built today, and the spec as the direction it's heading.

## What's actually implemented today

- **Auth**: real, working. Email + one-time-code (OTP) via Supabase Auth, no passwords. See [`app/sign-in.tsx`](app/sign-in.tsx) and [`app/verify.tsx`](app/verify.tsx). A `public.profiles` table ([`supabase/migrations/0001_profiles_username_login.sql`](supabase/migrations/0001_profiles_username_login.sql)) exists for username search/display when sharing, not for login.
- **Lists and entries**: local-only for now. Lists still live as plain rows in on-device SQLite ([`src/db/schema.ts`](src/db/schema.ts), [`src/db/queries.ts`](src/db/queries.ts)), but entries are now backed by an append-only `ops` log table (also in `schema.ts`, mirrored server-side in [`supabase/migrations/0002_lists_and_ops.sql`](supabase/migrations/0002_lists_and_ops.sql)) with a pure `reconstruct(oplog) -> currentList` function in [`src/crdt/reconstruct.ts`](src/crdt/reconstruct.ts). This is the CRDT data layer from the spec, built so far for local use; pushing/pulling ops through Supabase Realtime so it actually syncs across devices hasn't been wired up yet.
- **Sharing UI**: the share modal, "shared with me" list, and permission levels (owner/write/read) are wired up against mock data ([`src/mock/sharing.ts`](src/mock/sharing.ts)), not real Supabase tables. This is UI scaffolding ahead of the backend.
- **Everything else**: swipe-to-delete, inline editing, a confirm-before-destructive-action modal, light/dark theme, and the tab/profile UI are all real and functional against local state.

## Project layout

```
app/            Expo Router screens (sign-in, verify, tab layout, list detail)
src/screens/    Tab-level screens (Home, Shared, Profile)
src/components/ Reusable UI (list/entry rows, modals, nav, icons)
src/hooks/      Data hooks (useLists, useEntries, useSwipeTabs)
src/db/         Local SQLite schema + queries
src/contexts/   AuthContext (Supabase session)
src/theme/      Palette + light/dark ThemeContext
src/mock/       Placeholder data for not-yet-built backend features (sharing)
supabase/       SQL migrations (run manually against the Supabase project for now)
docs/superpowers/
  specs/        Design docs — the "why", written before implementation
  plans/        Step-by-step implementation plans already executed
```

## Running it

See [`HOW_TO_RUN.md`](HOW_TO_RUN.md) for the full breakdown (day-to-day dev loop vs. native rebuilds vs. cloud builds). Short version:

```
npx expo start --dev-client
```

Requires a `.env` with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (consumed via `app.config.js`).
