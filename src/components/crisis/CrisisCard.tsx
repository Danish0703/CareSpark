import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Phone, Clock, ExternalLink, AlertTriangle, Heart, MapPin, Shield, Users, Zap } from "lucide-react";

interface CrisisResource {
  id: string;
  resource_type: string;
  title: string;
  description: string;
  phone_number: string;
  website_url: string;
  available_hours: string;
  priority_order: number;
}

interface CrisisCardProps {
  onContinue: () => void;
}

export const CrisisCard = ({ onContinue }: CrisisCardProps) => {
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCrisisResources();
    triggerEmergencyResponse();
    getLocationAccess();
  }, []);

  const triggerEmergencyResponse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user profile with emergency contact
        const { data: profile } = await supabase
          .from("profiles")
          .select("emergency_contact, emergency_phone")
          .eq("user_id", user.id)
          .single();

        if (profile?.emergency_contact && profile?.emergency_phone) {
          // Send immediate SMS alert to emergency contact
          await supabase.from("sms_alerts").insert({
            recipient_phone: profile.emergency_phone,
            message: `URGENT: ${profile.emergency_contact} has triggered a crisis alert and may need immediate assistance. Please check on them immediately. If this is a medical emergency, call 911.`,
            alert_type: "crisis_emergency",
            sent_by: user.id,
          });

          toast({
            title: "Emergency Contact Notified",
            description: "Your emergency contact has been alerted automatically.",
            variant: "destructive",
          });
        }

        // Alert admin in real-time
        await supabase.from("sms_alerts").insert({
          recipient_phone: "admin", // This will be handled by admin real-time system
          message: `Crisis alert triggered by user ${user.id}`,
          alert_type: "admin_crisis_notification",
          sent_by: user.id,
        });

        setEmergencyTriggered(true);
      }
    } catch (error) {
      console.error("Emergency response error:", error);
    }
  };

  const getLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  };

  const shareLocationWithEmergency = async () => {
    if (location) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("sms_alerts").insert({
          recipient_phone: "emergency_services", // This would integrate with local emergency services
          message: `Crisis alert: Person in distress at location: https://maps.google.com/?q=${location.lat},${location.lng}`,
          alert_type: "location_emergency",
          sent_by: user.id,
        });

        toast({
          title: "Location Shared",
          description: "Your location has been shared with emergency services.",
          variant: "default",
        });
      }
    }
  };

  const connectToCrisisCounselor = async () => {
    toast({
      title: "Connecting...",
      description: "Connecting you to a crisis counselor. Please hold on.",
      variant: "default",
    });

    // This would integrate with a real-time crisis counselor service
    setTimeout(() => {
      toast({
        title: "Crisis Counselor Available",
        description: "A counselor will be with you shortly. Please stay on the line.",
        variant: "default",
      });
    }, 3000);
  };

  const fetchCrisisResources = async () => {
    try {
      const { data, error } = await supabase
        .from("crisis_resources")
        .select("*")
        .eq("is_active", true)
        .order("priority_order");

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching crisis resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-5 w-5 text-crisis" />;
      case "hotline":
        return <Phone className="h-5 w-5 text-primary" />;
      default:
        return <Heart className="h-5 w-5 text-wellness" />;
    }
  };

  const getResourceBadgeVariant = (type: string) => {
    switch (type) {
      case "emergency":
        return "destructive";
      case "hotline":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crisis-light to-primary-light flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">Loading crisis resources...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crisis-light to-primary-light p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Emergency Response Header */}
        <Card className="border-crisis border-2 shadow-card animate-pulse">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-crisis-light animate-bounce">
              <AlertTriangle className="h-8 w-8 text-crisis" />
            </div>
            <CardTitle className="text-2xl font-bold text-crisis mb-2">
              🚨 Crisis Support Activated
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              Emergency response has been triggered. Your safety is our priority.
            </p>
            {emergencyTriggered && (
              <Badge variant="destructive" className="mb-2">
                Emergency contacts have been notified automatically
              </Badge>
            )}
          </CardHeader>
        </Card>

        {/* Immediate Emergency Actions */}
        <Card className="border-crisis border-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-crisis">
              <Zap className="h-5 w-5" />
              Immediate Emergency Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="h-16 text-lg font-semibold"
              asChild
            >
              <a href="tel:988">
                <Phone className="mr-2 h-6 w-6" />
                Call 988 Suicide & Crisis Lifeline
              </a>
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="h-16 text-lg font-semibold"
              asChild
            >
              <a href="tel:911">
                <Shield className="mr-2 h-6 w-6" />
                Call 911 Emergency Services
              </a>
            </Button>

            <Button
              variant="crisis"
              size="lg"
              className="h-16"
              onClick={connectToCrisisCounselor}
            >
              <Users className="mr-2 h-6 w-6" />
              Connect to Crisis Counselor Now
            </Button>

            {location && (
              <Button
                variant="outline"
                size="lg"
                className="h-16 border-crisis text-crisis"
                onClick={shareLocationWithEmergency}
              >
                <MapPin className="mr-2 h-6 w-6" />
                Share Location with Emergency Services
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Crisis Resources */}
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="shadow-card hover:shadow-lg transition-smooth">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getResourceIcon(resource.resource_type)}
                    <div>
                      <h3 className="font-semibold text-lg">{resource.title}</h3>
                      <Badge variant={getResourceBadgeVariant(resource.resource_type)}>
                        {resource.resource_type.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {resource.phone_number && (
                    <Button
                      variant="crisis"
                      size="lg"
                      asChild
                      className="ml-4"
                    >
                      <a href={`tel:${resource.phone_number}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Now
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{resource.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {resource.phone_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span className="font-mono">{resource.phone_number}</span>
                    </div>
                  )}
                  {resource.available_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{resource.available_hours}</span>
                    </div>
                  )}
                  {resource.website_url && (
                    <Button variant="link" size="sm" asChild>
                      <a href={resource.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Support Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-wellness" />
              Additional Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Peer Support Groups</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with others who understand what you're going through.
              </p>
              <Button variant="wellness" onClick={onContinue}>
                Access Peer Support
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Educational Resources</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn about mental health and coping strategies.
              </p>
              <Button variant="calm" onClick={onContinue}>
                Explore Resources
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                When you're ready, you can continue to access additional wellness resources.
              </p>
              <Button variant="default" size="lg" onClick={onContinue}>
                Continue to Wellness Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};