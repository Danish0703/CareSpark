import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedRiskAssessment } from "@/components/crisis/EnhancedRiskAssessment";
import { CrisisCard } from "@/components/crisis/CrisisCard";
import { MediumRiskCard } from "@/components/crisis/MediumRiskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

type AssessmentState = "assessment" | "crisis" | "medium-risk" | "completed";

const Assessment = () => {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("assessment");
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAssessmentComplete = (riskLevel: "low" | "medium" | "high", assessmentData: any) => {
    setAssessmentResults({ riskLevel, assessmentData });
    
    if (riskLevel === "high") {
      setAssessmentState("crisis");
    } else if (riskLevel === "medium") {
      setAssessmentState("medium-risk");
    } else {
      setAssessmentState("completed");
      toast({
        title: "Assessment Complete",
        description: "Your wellness assessment has been completed. Continue to your dashboard for personalized recommendations.",
      });
    }
  };

  const handleCrisisContinue = () => {
    navigate("/dashboard");
  };

  const handleMediumRiskContinue = () => {
    navigate("/dashboard");
  };

  const handleRetakeAssessment = () => {
    setAssessmentState("assessment");
    setAssessmentResults(null);
  };

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  if (assessmentState === "assessment") {
    return (
      <div className="min-h-screen">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <EnhancedRiskAssessment onAssessmentComplete={handleAssessmentComplete} />
      </div>
    );
  }

  if (assessmentState === "crisis") {
    return <CrisisCard onContinue={handleCrisisContinue} />;
  }

  if (assessmentState === "medium-risk") {
    return (
      <MediumRiskCard 
        onContinue={handleMediumRiskContinue} 
        onRetakeAssessment={handleRetakeAssessment} 
      />
    );
  }

  // Completed state (low risk)
  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-light to-primary-light p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReturnToDashboard}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-card border-wellness border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-wellness-light">
              <CheckCircle className="h-8 w-8 text-wellness" />
            </div>
            <CardTitle className="text-2xl font-bold text-wellness mb-2">
              ✅ Assessment Complete
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              Great news! Your assessment indicates you're in a good mental health space.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-wellness/10 border border-wellness/20 rounded-lg p-4">
              <h3 className="font-semibold text-wellness mb-2">Your Results</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Based on your responses, you appear to be managing well and have good coping strategies in place.
              </p>
              {assessmentResults?.assessmentData?.riskScore && (
                <p className="text-xs text-muted-foreground">
                  Risk Score: {Math.round(assessmentResults.assessmentData.riskScore)}/100
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Recommendations for Continued Wellness:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Continue with your current self-care practices</li>
                <li>• Stay connected with your support network</li>
                <li>• Engage in regular physical activity and mindfulness</li>
                <li>• Monitor your mental health and take future assessments as needed</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleRetakeAssessment} className="flex-1">
                Retake Assessment
              </Button>
              <Button variant="wellness" onClick={handleReturnToDashboard} className="flex-1">
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Keep Up the Good Work!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your mental wellness journey is ongoing. Here are some resources to help you maintain your current positive state:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" onClick={() => navigate("/activities")}>
                Wellness Activities
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/resources")}>
                Mental Health Resources
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate("/peer-support")}>
                Peer Support Groups
              </Button>
              <Button variant="outline" className="justify-start">
                Mindfulness Exercises
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;