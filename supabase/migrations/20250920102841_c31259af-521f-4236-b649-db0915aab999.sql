-- Create a security definer function to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.risk_assessments;
DROP POLICY IF EXISTS "Admins can view all counsellor sessions" ON public.counsellor_sessions;
DROP POLICY IF EXISTS "Admins can view all wellness activities" ON public.wellness_activities;
DROP POLICY IF EXISTS "Admins can manage crisis resources" ON public.crisis_resources;
DROP POLICY IF EXISTS "Admins can manage SMS alerts" ON public.sms_alerts;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all assessments"
ON public.risk_assessments FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all counsellor sessions"
ON public.counsellor_sessions FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can view all wellness activities"
ON public.wellness_activities FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can manage crisis resources"
ON public.crisis_resources FOR ALL
USING (public.is_admin());

CREATE POLICY "Admins can manage SMS alerts"
ON public.sms_alerts FOR ALL
USING (public.is_admin());