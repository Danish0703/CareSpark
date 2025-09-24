import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Zap, ShoppingBag, CheckCircle, Flame, Trophy } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image: string;
  category: string;
}

const storeItems: StoreItem[] = [
  {
    id: "1",
    name: "CareSpark T-Shirt",
    description: "A comfortable t-shirt with the CareSpark logo.",
    points_cost: 500,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/MHFAT-Shirt.jpg",
    category: "apparel",
  },
  {
    id: "2",
    name: "Branded Water Bottle",
    description: "Stay hydrated and mindful with this branded water bottle.",
    points_cost: 350,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/MFHA-StainlessSteelWaterBottle-Final.jpg",
    category: "accessories",
  },
  {
    id: "3",
    name: "Mindfulness Journal",
    description: "A high-quality journal to track your gratitude and thoughts.",
    points_cost: 200,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/Journal.jpg",
    category: "tools",
  },
  {
    id: "4",
    name: "Wellness Sticker Pack",
    description: "Spread positivity with a pack of CareSpark stickers.",
    points_cost: 100,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/Stickers-Final.jpg",
    category: "accessories",
  },
  {
    id: "5",
    name: "Digital Wellness Guide",
    description: "An e-book with tips and exercises for mental health.",
    points_cost: 150,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/digitalguide.jpg",
    category: "digital",
  },
  {
    id: "6",
    name: "Mental Health First Aid Pin",
    description:
      "A stylish pin to show your support for mental health awareness.",
    points_cost: 75,
    image:
      "https://d1k7n08929vj14.cloudfront.net/prod/images/products/MHFA-Pin.jpg",
    category: "accessories",
  },
];

const WellnessStore = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: activities, error: activitiesError } = await supabase
        .from("wellness_activities")
        .select("points_earned")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (activitiesError) throw activitiesError;

      const points = activities.reduce(
        (sum, activity) => sum + activity.points_earned,
        0
      );

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("redeemed_items")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      const redeemed = profileData?.redeemed_items || [];
      const redeemedPoints = redeemed.reduce((sum: number, itemId: string) => {
        const item = storeItems.find((i) => i.id === itemId);
        return sum + (item?.points_cost || 0);
      }, 0);

      setTotalPoints(points - redeemedPoints);
      setRedeemedItems(redeemed);
    } catch (error) {
      console.error("Error fetching user data for store:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (item: StoreItem) => {
    if (totalPoints < item.points_cost) {
      toast({
        title: "Not Enough Points",
        description: `You need ${item.points_cost} points to redeem this item. Keep earning!`,
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const newRedeemedItems = [...redeemedItems, item.id];
      const { error } = await supabase
        .from("profiles")
        .update({ redeemed_items: newRedeemedItems })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "🎉 Item Redeemed!",
        description: `You successfully redeemed "${item.name}" for ${item.points_cost} points. A confirmation email has been sent.`,
        variant: "default",
      });

      fetchUserData();
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading the CareSpark Store...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            CareSpark Store
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Redeem your wellness points for exclusive CareSpark goodies.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">{totalPoints}</span>
            <span className="text-sm text-muted-foreground">
              Points Available
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeItems.map((item) => (
          <Card
            key={item.id}
            className="shadow-card hover-scale transition-smooth"
          >
            <CardContent className="p-4">
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <Badge variant="secondary" className="absolute top-2 right-2">
                  {item.category}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {item.points_cost} Points
                  </span>
                </div>
                <Button
                  onClick={() => handleRedeem(item)}
                  disabled={
                    totalPoints < item.points_cost ||
                    redeemedItems.includes(item.id)
                  }
                  variant="wellness"
                  size="sm"
                >
                  {redeemedItems.includes(item.id) ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Redeemed
                    </>
                  ) : (
                    "Redeem"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WellnessStore;
