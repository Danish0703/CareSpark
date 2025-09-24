-- Update profiles table to support counselor role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'counselor';

-- Create counselor_profiles table for counselor-specific data
CREATE TABLE public.counselor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  license_number TEXT,
  years_experience INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  availability_schedule JSONB DEFAULT '{}',
  bio TEXT,
  education TEXT,
  certifications TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on counselor_profiles
ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for counselor_profiles
CREATE POLICY "Counselors can view and update their own profile" 
ON public.counselor_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view available counselor profiles" 
ON public.counselor_profiles 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Admins can view all counselor profiles" 
ON public.counselor_profiles 
FOR SELECT 
USING (is_admin());

-- Create wellness_points_transactions table
CREATE TABLE public.wellness_points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
  source TEXT NOT NULL, -- activity_completion, resource_access, peer_help, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wellness_points_transactions
ALTER TABLE public.wellness_points_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for wellness_points_transactions
CREATE POLICY "Users can view their own points transactions" 
ON public.wellness_points_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own points transactions" 
ON public.wellness_points_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all points transactions" 
ON public.wellness_points_transactions 
FOR ALL 
USING (is_admin());

-- Create wellness_store_items table
CREATE TABLE public.wellness_store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT -1, -- -1 means unlimited
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wellness_store_items
ALTER TABLE public.wellness_store_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wellness_store_items
CREATE POLICY "Everyone can view active store items" 
ON public.wellness_store_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage store items" 
ON public.wellness_store_items 
FOR ALL 
USING (is_admin());

-- Create user_store_purchases table
CREATE TABLE public.user_store_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_item_id UUID NOT NULL REFERENCES public.wellness_store_items(id),
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redemption_code TEXT,
  notes TEXT
);

-- Enable RLS on user_store_purchases
ALTER TABLE public.user_store_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for user_store_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.user_store_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.user_store_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.user_store_purchases 
FOR ALL 
USING (is_admin());

-- Create peer_connections table for realistic peer support
CREATE TABLE public.peer_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  connection_type TEXT NOT NULL DEFAULT 'support' CHECK (connection_type IN ('support', 'accountability', 'study_buddy')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Enable RLS on peer_connections
ALTER TABLE public.peer_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for peer_connections
CREATE POLICY "Users can view their own connections" 
ON public.peer_connections 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests" 
ON public.peer_connections 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connections" 
ON public.peer_connections 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Create peer_messages table
CREATE TABLE public.peer_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.peer_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on peer_messages
ALTER TABLE public.peer_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for peer_messages
CREATE POLICY "Users can view messages in their connections" 
ON public.peer_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.peer_connections 
    WHERE id = connection_id 
    AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can send messages in their connections" 
ON public.peer_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.peer_connections 
    WHERE id = connection_id 
    AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    AND status = 'accepted'
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_counselor_profiles_updated_at
BEFORE UPDATE ON public.counselor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_store_items_updated_at
BEFORE UPDATE ON public.wellness_store_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_connections_updated_at
BEFORE UPDATE ON public.peer_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial store items
INSERT INTO public.wellness_store_items (name, description, points_cost, category, image_url) VALUES
('Meditation App Premium', 'One month access to premium meditation features', 500, 'Digital', null),
('Wellness Journal', 'Beautiful hardcover journal for tracking your wellness journey', 750, 'Physical', null),
('Virtual Therapy Session', 'One-on-one session with licensed therapist', 1200, 'Services', null),
('Mindfulness Course', 'Complete online mindfulness course with certificate', 900, 'Education', null),
('Stress Relief Kit', 'Essential oils, stress ball, and relaxation guide', 600, 'Physical', null),
('Mental Health Book Bundle', 'Collection of top-rated self-help books', 400, 'Education', null),
('Yoga Class Pass', '5-class pass for local yoga studio', 800, 'Services', null),
('Gratitude Planner', 'Monthly planner focused on gratitude and positivity', 300, 'Physical', null);