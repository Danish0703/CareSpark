-- Drop the existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

-- Add a new check constraint that includes 'counselor'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'counselor'::text]));