import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Star,
  Calendar,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle,
  Plus,
  Brain,
} from "lucide-react";
import { EnhancedActivities } from "@/components/activities/EnhancedActivities";
import { EnhancedResourceHub } from "@/components/resources/EnhancedResourceHub";
import { EnhancedPeerSupport } from "@/components/peer/EnhancedPeerSupport";
import { EnhancedCounsellor } from "@/components/counsellor/EnhancedCounsellor";
import WellnessStore from "@/components/wellness/WellnessStore";

interface WellnessActivity {
  id: string;
  activity_type: string;
  activity_name: string;
  description: string;
  points_earned: number;
  completed: boolean;
  completed_at: string | null;
}

interface CounsellorSession {
  id: string;
  counsellor_name: string;
  session_date: string;
  session_notes: string;
  session_rating: number | null;
  next_appointment: string | null;
}

interface WellnessDashboardProps {
  onRetakeAssessment?: () => void;
}

export const WellnessDashboard = ({
  onRetakeAssessment,
}: WellnessDashboardProps) => {
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [sessions, setSessions] = useState<CounsellorSession[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    createInitialActivities();
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = useCallback(() => {
    const channel = supabase
      .channel("wellness-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wellness_activities",
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "counsellor_sessions",
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wellness activities
      const { data: activitiesData } = await supabase
        .from("wellness_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch counsellor sessions
      const { data: sessionsData } = await supabase
        .from("counsellor_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });

      setActivities(activitiesData || []);
      setSessions(sessionsData || []);

      // Calculate total points
      const points = (activitiesData || [])
        .filter((activity) => activity.completed)
        .reduce((sum, activity) => sum + activity.points_earned, 0);
      setTotalPoints(points);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialActivities = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already has activities
      const { data: existingActivities } = await supabase
        .from("wellness_activities")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (existingActivities && existingActivities.length > 0) return;

      // Create initial wellness activities
      const initialActivities = [
        {
          user_id: user.id,
          activity_type: "mindfulness",
          activity_name: "Daily Meditation",
          description: "Complete a 10-minute meditation session",
          points_earned: 10,
        },
        {
          user_id: user.id,
          activity_type: "exercise",
          activity_name: "Morning Walk",
          description: "Take a 20-minute walk outside",
          points_earned: 15,
        },
        {
          user_id: user.id,
          activity_type: "journal",
          activity_name: "Gratitude Journal",
          description: "Write down 3 things you're grateful for",
          points_earned: 5,
        },
        {
          user_id: user.id,
          activity_type: "social",
          activity_name: "Connect with a Friend",
          description:
            "Have a meaningful conversation with someone you care about",
          points_earned: 20,
        },
        {
          user_id: user.id,
          activity_type: "learning",
          activity_name: "Read Mental Health Article",
          description: "Learn something new about mental wellness",
          points_earned: 8,
        },
      ];

      await supabase.from("wellness_activities").insert(initialActivities);
      fetchDashboardData();
    } catch (error) {
      console.error("Error creating initial activities:", error);
    }
  };

  const completeActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("wellness_activities")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", activityId);

      if (error) throw error;

      toast({
        title: "Activity completed!",
        description:
          "Great job! You've earned points for your wellness journey.",
      });

      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mindfulness":
        return <Heart className="h-4 w-4" />;
      case "exercise":
        return <TrendingUp className="h-4 w-4" />;
      case "journal":
        return <BookOpen className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "learning":
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const completedActivities = activities.filter(
    (activity) => activity.completed
  );
  const pendingActivities = activities.filter(
    (activity) => !activity.completed
  );
  const completionRate =
    activities.length > 0
      ? (completedActivities.length / activities.length) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">Loading your wellness dashboard...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-wellness" />
                  CareSpark Dashboard
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Track your mental health journey and celebrate your progress
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-wellness">
                  {totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Wellness Points
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-wellness" />
                <span className="font-semibold">Completion Rate</span>
              </div>
              <div className="text-2xl font-bold mb-2">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="h-2" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold">Completed</span>
              </div>
              <div className="text-2xl font-bold">
                {completedActivities.length}
              </div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-crisis" />
                <span className="font-semibold">Sessions</span>
              </div>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">
                Counsellor meetings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {onRetakeAssessment && (
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={onRetakeAssessment}
                >
                  <Brain className="h-5 w-5" />
                  <span className="text-xs">Retake Assessment</span>
                </Button>
              )}
              <Button variant="wellness" className="h-16 flex-col gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-xs">Mood Check</span>
              </Button>
              <Button variant="calm" className="h-16 flex-col gap-1">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Exercise</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-1">
                <Users className="h-5 w-5" />
                <span className="text-xs">Connect</span>
              </Button>
              <Button variant="ghost" className="h-16 flex-col gap-1">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Learn</span>
              </Button>
            </div>

            {onRetakeAssessment && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary mb-1">
                      Assessment Available
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You can retake your mental wellness assessment anytime to
                      get updated recommendations and support.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="store">Points Store</TabsTrigger>
            <TabsTrigger value="peer">Peer Support</TabsTrigger>
            <TabsTrigger value="counsellor">Counsellor</TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <EnhancedActivities />
          </TabsContent>

          <TabsContent value="resources">
            <EnhancedResourceHub />
          </TabsContent>

          <TabsContent value="store">
            <WellnessStore />
          </TabsContent>

          <TabsContent value="peer">
            <EnhancedPeerSupport />
          </TabsContent>

          <TabsContent value="counsellor">
            <EnhancedCounsellor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
