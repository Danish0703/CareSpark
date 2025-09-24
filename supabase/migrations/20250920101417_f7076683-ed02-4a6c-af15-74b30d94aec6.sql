-- Create user profiles table with role-based access
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_data JSONB NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'high')),
  assessment_score INTEGER,
  chatbot_conversation JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness activities table
CREATE TABLE public.wellness_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counsellor sessions table
CREATE TABLE public.counsellor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counsellor_name TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_notes TEXT,
  session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
  next_appointment TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crisis resources table
CREATE TABLE public.crisis_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('hotline', 'emergency', 'support_group', 'educational')),
  title TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  website_url TEXT,
  available_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  priority_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS alerts table for admin
CREATE TABLE public.sms_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'pending'
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsellor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for risk assessments
CREATE POLICY "Users can view their own assessments" ON public.risk_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON public.risk_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments" ON public.risk_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for wellness activities
CREATE POLICY "Users can manage their wellness activities" ON public.wellness_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wellness activities" ON public.wellness_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for counsellor sessions
CREATE POLICY "Users can manage their counsellor sessions" ON public.counsellor_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all counsellor sessions" ON public.counsellor_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for crisis resources
CREATE POLICY "Everyone can view active crisis resources" ON public.crisis_resources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage crisis resources" ON public.crisis_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for SMS alerts
CREATE POLICY "Admins can manage SMS alerts" ON public.sms_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_activities_updated_at
  BEFORE UPDATE ON public.wellness_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counsellor_sessions_updated_at
  BEFORE UPDATE ON public.counsellor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crisis_resources_updated_at
  BEFORE UPDATE ON public.crisis_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default crisis resources
INSERT INTO public.crisis_resources (resource_type, title, description, phone_number, available_hours, priority_order) VALUES
('emergency', 'Emergency Services', 'For immediate life-threatening emergencies', '911', '24/7', 1),
('hotline', 'National Suicide Prevention Lifeline', 'Free and confidential emotional support', '988', '24/7', 2),
('hotline', 'Crisis Text Line', 'Text-based crisis support', 'Text HOME to 741741', '24/7', 3),
('hotline', 'SAMHSA National Helpline', 'Treatment referral and information service', '1-800-662-4357', '24/7', 4),
('support_group', 'NAMI Support Groups', 'Peer support groups for mental health', '', 'Varies by location', 5);