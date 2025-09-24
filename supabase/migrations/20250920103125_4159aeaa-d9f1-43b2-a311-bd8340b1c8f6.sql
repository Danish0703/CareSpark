-- Update existing users to have correct roles based on their auth metadata
UPDATE public.profiles 
SET role = CASE 
  WHEN auth_users.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
  ELSE 'user'
END
FROM auth.users AS auth_users
WHERE profiles.user_id = auth_users.id;