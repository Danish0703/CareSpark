import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, ShoppingCart, Award, BookOpen, Zap, Package, Heart } from "lucide-react";

const WellnessStore = () => {
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mockStoreItems = [
        {
          id: "1",
          name: "Meditation App Premium",
          description: "One month access to premium meditation features",
          points_cost: 500,
          category: "Digital"
        },
        {
          id: "2", 
          name: "Wellness Journal",
          description: "Beautiful hardcover journal for tracking your wellness journey",
          points_cost: 750,
          category: "Physical"
        }
      ];

      setStoreItems(mockStoreItems);
      
      const { data: activities } = await supabase
        .from("wellness_activities")
        .select("points_earned, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (activities) {
        const totalPoints = activities.reduce((sum, activity) => sum + (activity.points_earned || 0), 0);
        setUserPoints(totalPoints);
      }

    } catch (error) {
      console.error("Error fetching store data:", error);
      toast({
        title: "Error",
        description: "Failed to load store data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: any) => {
    if (userPoints < item.points_cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${item.points_cost - userPoints} more points to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Purchase Successful!",
      description: `You've purchased ${item.name}. Feature coming soon!`,
    });

    setUserPoints(prev => prev - item.points_cost);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "digital": return <Zap className="h-4 w-4" />;
      case "physical": return <Package className="h-4 w-4" />;
      case "services": return <Heart className="h-4 w-4" />;
      case "education": return <BookOpen className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-wellness text-wellness-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Your Wellness Points
          </CardTitle>
          <CardDescription className="text-wellness-foreground/80">
            Earn points by completing activities and redeem them here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{userPoints}</div>
          <p className="text-sm text-wellness-foreground/80 mt-2">
            Total points available to spend
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeItems.map((item) => (
          <Card key={item.id} className="hover:shadow-card transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <Badge className="gap-1">
                  {getCategoryIcon(item.category)}
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-primary">
                {item.points_cost} pts
              </div>
              <Button
                onClick={() => handlePurchase(item)}
                disabled={userPoints < item.points_cost}
                className="w-full gap-2"
                variant="wellness"
              >
                <ShoppingCart className="h-4 w-4" />
                {userPoints >= item.points_cost ? "Purchase" : "Not Enough Points"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WellnessStore;