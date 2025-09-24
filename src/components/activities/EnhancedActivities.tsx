import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Flame
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

interface CustomActivity {
  activity_name: string;
  description: string;
  activity_type: string;
  points_earned: number;
}

export const EnhancedActivities = () => {
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customActivity, setCustomActivity] = useState<CustomActivity>({
    activity_name: "",
    description: "",
    activity_type: "custom",
    points_earned: 10
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
    calculateStreak();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wellness_activities'
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wellness_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setActivities(data || []);
      const points = (data || [])
        .filter(activity => activity.completed)
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
      const { data: { user } } = await supabase.auth.getUser();
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
        
        const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        
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

  const completeActivity = async (activityId: string, activityName: string, points: number) => {
    try {
      const { error } = await supabase
        .from("wellness_activities")
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
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

  const createCustomActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("wellness_activities")
        .insert({
          user_id: user.id,
          ...customActivity
        });

      if (error) throw error;

      toast({
        title: "Custom Activity Created!",
        description: "Your personalized wellness activity has been added.",
      });

      setCustomActivity({
        activity_name: "",
        description: "",
        activity_type: "custom",
        points_earned: 10
      });

      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive",
      });
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
      case "learning":
        return <Target className="h-5 w-5 text-primary" />;
      default:
        return <Star className="h-5 w-5 text-wellness" />;
    }
  };

  const completedActivities = activities.filter(activity => activity.completed);
  const pendingActivities = activities.filter(activity => !activity.completed);
  const completionRate = activities.length > 0 ? (completedActivities.length / activities.length) * 100 : 0;

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
            <div className="text-3xl font-bold text-primary mb-1">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Wellness Points Earned</div>
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
            <div className="text-3xl font-bold text-wellness mb-1">{streak}</div>
            <div className="text-sm text-muted-foreground">
              {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} strong!` : 'Start your streak today!'}
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
            <div className="text-3xl font-bold text-crisis mb-2">{Math.round(completionRate)}%</div>
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
            <div className="text-3xl font-bold text-secondary mb-1">{completedActivities.length}</div>
            <div className="text-sm text-muted-foreground">Activities Done</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Activities */}
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="pending">Active Challenges</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="custom">Create Custom</TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="wellness" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Quick Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Activity Name</Label>
                  <Input
                    id="name"
                    value={customActivity.activity_name}
                    onChange={(e) => setCustomActivity({...customActivity, activity_name: e.target.value})}
                    placeholder="e.g., 30-minute nature walk"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={customActivity.description}
                    onChange={(e) => setCustomActivity({...customActivity, description: e.target.value})}
                    placeholder="Describe your wellness activity"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Points (5-50)</Label>
                  <Input
                    id="points"
                    type="number"
                    min="5"
                    max="50"
                    value={customActivity.points_earned}
                    onChange={(e) => setCustomActivity({...customActivity, points_earned: parseInt(e.target.value) || 10})}
                  />
                </div>
                <Button onClick={createCustomActivity} className="w-full">
                  Create Activity
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {pendingActivities.length > 0 ? (
              pendingActivities.map((activity) => (
                <Card key={activity.id} className="shadow-card hover:shadow-lg transition-smooth border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{activity.activity_name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              +{activity.points_earned} points
                            </Badge>
                            <Badge variant="outline">
                              {activity.activity_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => completeActivity(activity.id, activity.activity_name, activity.points_earned)}
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
                <h3 className="text-xl font-semibold mb-2">All Activities Completed!</h3>
                <p className="text-muted-foreground mb-6">Amazing work! You've completed all your wellness challenges.</p>
                <Button variant="wellness" onClick={() => fetchActivities()}>
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
              <Card key={activity.id} className="shadow-card bg-gradient-to-br from-wellness-light/20 to-primary-light/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.activity_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {activity.completed_at ? new Date(activity.completed_at).toLocaleDateString() : "Recently"}
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

        <TabsContent value="custom" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create Custom Wellness Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="custom-name" className="text-sm font-medium">Activity Name</Label>
                  <Input
                    id="custom-name"
                    value={customActivity.activity_name}
                    onChange={(e) => setCustomActivity({...customActivity, activity_name: e.target.value})}
                    placeholder="e.g., 30-minute nature walk"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-points" className="text-sm font-medium">Points (5-50)</Label>
                  <Input
                    id="custom-points"
                    type="number"
                    min="5"
                    max="50"
                    value={customActivity.points_earned}
                    onChange={(e) => setCustomActivity({...customActivity, points_earned: parseInt(e.target.value) || 10})}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="custom-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="custom-description"
                  value={customActivity.description}
                  onChange={(e) => setCustomActivity({...customActivity, description: e.target.value})}
                  placeholder="Describe your wellness activity and its benefits"
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={createCustomActivity} 
                className="w-full" 
                size="lg"
                variant="wellness"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Activity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};