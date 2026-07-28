-- supabase/migrations/0002_lists_and_ops.sql
--
-- Run this in the Supabase SQL editor (or via `supabase db push` once the
-- project is linked with the CLI). Not applied automatically — ask before
-- running against the live database.
--
-- Per docs/superpowers/specs/2026-07-20-crdt-shared-list-design.md §2-3, §5,
-- and the follow-up decision that `lists` (name/creation) stays a plain
-- table, not part of the CRDT ops log — only entries are CRDT'd.

CREATE TABLE IF NOT EXISTS public.lists (
	id uuid PRIMARY KEY,
	name text NOT NULL,
	owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.list_shares (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	list_id uuid NOT NULL REFERENCES public.lists (id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
	role text NOT NULL CHECK (role IN ('owner', 'write', 'read')),
	created_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE (list_id, user_id)
);

-- Every list gets an owner row automatically — this is the only way a
-- list_shares row is created in this phase (no invite flow yet).
CREATE OR REPLACE FUNCTION public.create_owner_share()
RETURNS trigger AS $$
BEGIN
	INSERT INTO public.list_shares (list_id, user_id, role)
	VALUES (NEW.id, NEW.owner_id, 'owner');
	RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS lists_create_owner_share ON public.lists;
CREATE TRIGGER lists_create_owner_share
	AFTER INSERT ON public.lists
	FOR EACH ROW EXECUTE FUNCTION public.create_owner_share();

CREATE TABLE IF NOT EXISTS public.ops (
	id uuid PRIMARY KEY,
	list_id uuid NOT NULL REFERENCES public.lists (id) ON DELETE CASCADE,
	replica_id uuid NOT NULL,
	lamport_counter bigint NOT NULL,
	op_type text NOT NULL CHECK (op_type IN ('insert', 'delete', 'set_field')),
	item_id uuid NOT NULL,
	origin_id uuid,
	field_name text CHECK (field_name IN ('text', 'checked')),
	value jsonb,
	created_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE (replica_id, lamport_counter)
);

CREATE INDEX IF NOT EXISTS ops_list_id_idx ON public.ops (list_id);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read their lists"
	ON public.lists FOR SELECT
	USING (EXISTS (
		SELECT 1 FROM public.list_shares
		WHERE list_shares.list_id = lists.id AND list_shares.user_id = auth.uid()
	));

CREATE POLICY "authenticated users can create lists they own"
	ON public.lists FOR INSERT
	TO authenticated
	WITH CHECK (owner_id = auth.uid());

CREATE POLICY "only the owner can delete a list"
	ON public.lists FOR DELETE
	USING (owner_id = auth.uid());

CREATE POLICY "only the owner can rename a list"
	ON public.lists FOR UPDATE
	USING (owner_id = auth.uid());

CREATE POLICY "members can read their list_shares rows"
	ON public.list_shares FOR SELECT
	USING (user_id = auth.uid());

CREATE POLICY "list members can read ops"
	ON public.ops FOR SELECT
	USING (EXISTS (
		SELECT 1 FROM public.list_shares
		WHERE list_shares.list_id = ops.list_id AND list_shares.user_id = auth.uid()
	));

CREATE POLICY "list members can write ops"
	ON public.ops FOR INSERT
	TO authenticated
	WITH CHECK (EXISTS (
		SELECT 1 FROM public.list_shares
		WHERE list_shares.list_id = ops.list_id AND list_shares.user_id = auth.uid()
	));

-- Realtime: broadcast new ops to subscribed clients.
ALTER PUBLICATION supabase_realtime ADD TABLE public.ops;
