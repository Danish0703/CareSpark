import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedRiskAssessment } from "@/components/crisis/EnhancedRiskAssessment";
import { CrisisCard } from "@/components/crisis/CrisisCard";
import { MediumRiskCard } from "@/components/crisis/MediumRiskCard";
import { WellnessDashboard } from "@/components/dashboard/WellnessDashboard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

type UserState = "assessment" | "crisis" | "wellness" | "medium-risk";

const UserDashboard = () => {
  const [userState, setUserState] = useState<UserState>("assessment");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/user-auth");
        return;
      }

      // Check if user has completed assessment
      const { data: assessment } = await supabase
        .from("risk_assessments")
        .select("risk_level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (assessment) {
        if (assessment.risk_level === "high") {
          setUserState("crisis");
        } else if (assessment.risk_level === "medium") {
          setUserState("medium-risk");
        } else {
          setUserState("wellness");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentComplete = (riskLevel: "low" | "medium" | "high") => {
    if (riskLevel === "high") {
      setUserState("crisis");
    } else if (riskLevel === "medium") {
      setUserState("medium-risk");
    } else {
      setUserState("wellness");
    }
  };

  const handleCrisisContinue = () => {
    setUserState("wellness");
  };

  const handleRetakeAssessment = () => {
    setUserState("assessment");
  };

  const handleMediumRiskContinue = () => {
    setUserState("wellness");
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "Take care of yourself!",
      });
      navigate("/user-auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      {userState === "assessment" && (
        <EnhancedRiskAssessment onAssessmentComplete={handleAssessmentComplete} />
      )}
      
      {userState === "crisis" && (
        <CrisisCard onContinue={handleCrisisContinue} />
      )}

      {userState === "medium-risk" && (
        <MediumRiskCard onContinue={handleMediumRiskContinue} onRetakeAssessment={handleRetakeAssessment} />
      )}
      
      {userState === "wellness" && (
        <WellnessDashboard onRetakeAssessment={handleRetakeAssessment} />
      )}
    </div>
  );
};

export default UserDashboard;