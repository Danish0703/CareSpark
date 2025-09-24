import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Star,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle,
  Plus,
  Timer,
  Zap,
  Trophy,
  Calendar,
  Flame,
  Laugh,
  Puzzle,
  Mic,
} from "lucide-react";

interface WellnessActivity {
  id: string;
  activity_type: string;
  activity_name: string;
  description: string;
  points_earned: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const predefinedActivities = [
  {
    activity_type: "mindfulness",
    activity_name: "5-Minute Guided Meditation",
    description: "Listen to a short guided meditation to center yourself.",
    points_earned: 10,
  },
  {
    activity_type: "exercise",
    activity_name: "Gentle Stretching",
    description:
      "Follow a 10-minute gentle stretching routine to release tension.",
    points_earned: 15,
  },
  {
    activity_type: "journal",
    activity_name: "Gratitude List",
    description: "Write down three things you are grateful for today.",
    points_earned: 5,
  },
  {
    activity_type: "social",
    activity_name: "Call a Loved One",
    description: "Spend 15 minutes talking to a friend or family member.",
    points_earned: 20,
  },
  {
    activity_type: "game",
    activity_name: "Mindful Puzzles",
    description: "Complete a simple puzzle or brain teaser to focus your mind.",
    points_earned: 12,
  },
  {
    activity_type: "creative",
    activity_name: "Listen to Music",
    description:
      "Listen to your favorite songs and be present with the moment.",
    points_earned: 8,
  },
  {
    activity_type: "learning",
    activity_name: "Read a Positive Article",
    description: "Read an article about a topic you enjoy or find inspiring.",
    points_earned: 8,
  },
];

export const EnhancedActivities = () => {
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
    calculateStreak();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("activities-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wellness_activities",
        },
        () => {
          fetchActivities();
          calculateStreak();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchActivities = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wellness_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setActivities(data || []);
      const points = (data || [])
        .filter((activity) => activity.completed)
        .reduce((sum, activity) => sum + activity.points_earned, 0);
      setTotalPoints(points);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wellness_activities")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < data.length; i++) {
        const completedDate = new Date(data[i].completed_at);
        completedDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === currentStreak) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error("Error calculating streak:", error);
    }
  };

  const completeActivity = async (
    activityId: string,
    activityName: string,
    points: number
  ) => {
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
        title: "🎉 Activity Completed!",
        description: `Great job completing "${activityName}"! You earned ${points} points.`,
      });

      // Add celebration animation trigger here
      setTimeout(() => {
        fetchActivities();
        calculateStreak();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createInitialActivities = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingActivities } = await supabase
        .from("wellness_activities")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (existingActivities && existingActivities.length > 0) return;

      const activitiesToAdd = predefinedActivities.map((activity) => ({
        user_id: user.id,
        ...activity,
      }));
      await supabase.from("wellness_activities").insert(activitiesToAdd);
      fetchActivities();
    } catch (error) {
      console.error("Error creating initial activities:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mindfulness":
        return <Heart className="h-5 w-5 text-wellness" />;
      case "exercise":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case "journal":
        return <BookOpen className="h-5 w-5 text-crisis" />;
      case "social":
        return <Users className="h-5 w-5 text-secondary" />;
      case "game":
        return <Puzzle className="h-5 w-5 text-purple-500" />;
      case "creative":
        return <Mic className="h-5 w-5 text-indigo-500" />;
      case "learning":
        return <Target className="h-5 w-5 text-primary" />;
      default:
        return <Star className="h-5 w-5 text-yellow-500" />;
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

  useEffect(() => {
    if (pendingActivities.length === 0) {
      createInitialActivities();
    }
  }, [pendingActivities]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-primary-light">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Total Points</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {totalPoints}
            </div>
            <div className="text-sm text-muted-foreground">
              Wellness Points Earned
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-wellness-light">
                <Flame className="h-5 w-5 text-wellness" />
              </div>
              <span className="font-semibold">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-wellness mb-1">
              {streak}
            </div>
            <div className="text-sm text-muted-foreground">
              {streak > 0
                ? `${streak} day${streak > 1 ? "s" : ""} strong!`
                : "Start your streak today!"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-crisis-light">
                <Award className="h-5 w-5 text-crisis" />
              </div>
              <span className="font-semibold">Completion Rate</span>
            </div>
            <div className="text-3xl font-bold text-crisis mb-2">
              {Math.round(completionRate)}%
            </div>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-secondary-light">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
              <span className="font-semibold">Completed</span>
            </div>
            <div className="text-3xl font-bold text-secondary mb-1">
              {completedActivities.length}
            </div>
            <div className="text-sm text-muted-foreground">Activities Done</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Activities */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Active Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {pendingActivities.length > 0 ? (
              pendingActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="shadow-card hover:shadow-lg transition-smooth border-l-4 border-l-primary"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">
                            {activity.activity_name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Zap className="h-3 w-3" />+
                              {activity.points_earned} points
                            </Badge>
                            <Badge variant="outline">
                              {activity.activity_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        completeActivity(
                          activity.id,
                          activity.activity_name,
                          activity.points_earned
                        )
                      }
                      className="w-full"
                      variant="wellness"
                      size="lg"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Challenge
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  All Activities Completed!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Amazing work! You've completed all your wellness challenges.
                </p>
                <Button
                  variant="wellness"
                  onClick={() => createInitialActivities()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Activities
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {completedActivities.slice(0, 9).map((activity) => (
              <Card
                key={activity.id}
                className="shadow-card bg-gradient-to-br from-wellness-light/20 to-primary-light/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {activity.activity_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {activity.completed_at
                          ? new Date(activity.completed_at).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-wellness" />
                  </div>
                  <Badge variant="default" className="w-full justify-center">
                    +{activity.points_earned} points earned
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
