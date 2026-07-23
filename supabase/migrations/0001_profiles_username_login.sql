-- Run this in the Supabase SQL editor (or via `supabase db push` once the
-- project is linked with the CLI). Not applied automatically.
--
-- Auth stays email+OTP only (no password) per the CRDT spec (§6). This
-- table exists purely for username search/display when sharing a list,
-- not for login.

-- Public-facing profile row, keyed 1:1 to the private auth.users table.
CREATE TABLE IF NOT EXISTS public.profiles (
	id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
	username text UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 24),
	created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles are viewable by authenticated users"
	ON public.profiles FOR SELECT
	TO authenticated
	USING (true);

CREATE POLICY "users can update their own profile"
	ON public.profiles FOR UPDATE
	TO authenticated
	USING (auth.uid() = id);

-- Populates profiles from the signup metadata (see supabase.auth.signInWithOtp
-- options.data.username in app/sign-in.tsx — only applied the first time an
-- email signs in, i.e. account creation). Runs in the same transaction as the
-- auth.users insert, so a duplicate username rolls back the whole insert.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
	INSERT INTO public.profiles (id, username)
	VALUES (new.id, new.raw_user_meta_data ->> 'username');
	RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
