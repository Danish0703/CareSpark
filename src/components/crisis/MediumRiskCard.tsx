import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Heart, Phone, MessageCircle, Calendar, RefreshCw } from "lucide-react";

interface MediumRiskCardProps {
  onContinue: () => void;
  onRetakeAssessment: () => void;
}

export const MediumRiskCard = ({ onContinue, onRetakeAssessment }: MediumRiskCardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-light to-primary-light p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Medium Risk Header */}
        <Card className="border-warning border-2 shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-warning-light">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold text-warning mb-2">
              ⚠️ Medium Risk Assessment Result
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              Your assessment indicates you may be experiencing some challenges that could benefit from additional support.
            </p>
            <Badge variant="default" className="bg-warning text-warning-foreground">
              Moderate Support Recommended
            </Badge>
          </CardHeader>
        </Card>

        {/* Recommended Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Heart className="h-5 w-5" />
              Recommended Support Options
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Professional Support</h4>
              
              <div className="space-y-3">
              <Button
                variant="crisis"
                size="lg"
                className="w-full h-16 text-left justify-start"
                asChild
              >
                  <a href="tel:988">
                    <Phone className="mr-3 h-6 w-6" />
                    <div>
                      <div className="font-semibold">988 Lifeline</div>
                      <div className="text-sm opacity-90">24/7 Crisis Support</div>
                    </div>
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-left justify-start border-warning"
                >
                  <Calendar className="mr-3 h-6 w-6" />
                  <div>
                    <div className="font-semibold">Schedule Counseling</div>
                    <div className="text-sm text-muted-foreground">Professional guidance</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-left justify-start border-primary"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  <div>
                    <div className="font-semibold">Text Crisis Support</div>
                    <div className="text-sm text-muted-foreground">Text HOME to 741741</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Immediate Coping Strategies</h4>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-semibold mb-1">Breathing Exercise</h5>
                  <p>Try 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8</p>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-semibold mb-1">Grounding Technique</h5>
                  <p>Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste</p>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-semibold mb-1">Connect with Others</h5>
                  <p>Reach out to a trusted friend, family member, or support person</p>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-semibold mb-1">Stay Present</h5>
                  <p>Focus on what you can control right now, one moment at a time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Resources */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Important Resources</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Phone className="h-6 w-6 mx-auto mb-2 text-crisis" />
              <h5 className="font-semibold">Crisis Hotline</h5>
              <p className="text-sm text-muted-foreground mb-2">24/7 Support</p>
              <Button variant="link" size="sm" asChild>
                <a href="tel:988">Call 988</a>
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h5 className="font-semibold">Crisis Text Line</h5>
              <p className="text-sm text-muted-foreground mb-2">Text Support</p>
              <Button variant="link" size="sm" asChild>
                <a href="sms:741741?body=HOME">Text HOME to 741741</a>
              </Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-6 w-6 mx-auto mb-2 text-wellness" />
              <h5 className="font-semibold">Online Chat</h5>
              <p className="text-sm text-muted-foreground mb-2">Live Support</p>
              <Button variant="link" size="sm" asChild>
                <a href="https://suicidepreventionlifeline.org/chat/" target="_blank">
                  Start Chat
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={onRetakeAssessment} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retake Assessment
          </Button>
          
          <Button variant="default" size="lg" onClick={onContinue} className="bg-wellness hover:bg-wellness/90">
            Continue to Wellness Resources
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember: Your feelings are valid and you deserve support. Taking this step shows strength.
          </p>
        </div>
      </div>
    </div>
  );
};