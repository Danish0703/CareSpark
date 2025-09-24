import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Users, 
  MessageCircle, 
  Phone, 
  MapPin,
  Clock,
  Eye,
  Send,
  Shield
} from "lucide-react";

interface ActiveUser {
  user_id: string;
  profile: {
    full_name: string;
    emergency_contact: string;
    emergency_phone: string;
  };
  risk_level: string;
  last_activity: string;
  location?: { lat: number; lng: number };
  conversation_count: number;
}

interface CrisisAlert {
  id: string;
  user_id: string;
  message: string;
  alert_type: string;
  sent_at: string;
  delivery_status: string;
  profile: {
    full_name: string;
  };
}

interface LiveConversation {
  id: string;
  user_id: string;
  chatbot_conversation: any;
  risk_level: string;
  created_at: string;
  profile: {
    full_name: string;
  };
}

export const RealTimeMonitor = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveUsers();
    fetchCrisisAlerts();
    fetchLiveConversations();
    setupRealTimeSubscriptions();
  }, []);

  const setupRealTimeSubscriptions = () => {
    // Listen for new risk assessments
    const assessmentChannel = supabase
      .channel('risk_assessments_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_assessments'
        },
        (payload) => {
          console.log('New assessment:', payload);
          if (payload.new.risk_level === 'high') {
            toast({
              title: "🚨 High Risk Alert",
              description: "A user has been flagged as high risk. Immediate attention required.",
              variant: "destructive",
            });
          }
          fetchActiveUsers();
          fetchLiveConversations();
        }
      )
      .subscribe();

    // Listen for crisis alerts
    const alertChannel = supabase
      .channel('sms_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sms_alerts'
        },
        (payload) => {
          console.log('New crisis alert:', payload);
          if (payload.new.alert_type === 'crisis_emergency') {
            toast({
              title: "🚨 CRISIS EMERGENCY",
              description: "Emergency contact has been triggered for a user!",
              variant: "destructive",
            });
          }
          fetchCrisisAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assessmentChannel);
      supabase.removeChannel(alertChannel);
    };
  };

  const fetchActiveUsers = async () => {
    try {
      const { data } = await supabase
        .from("risk_assessments")
        .select(`
          user_id,
          risk_level,
          created_at,
          assessment_data
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        // Get user profiles separately
        const userIds = data.map(item => item.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, emergency_contact, emergency_phone")
          .in("user_id", userIds);

        const users = data.map(item => {
          const profile = profiles?.find(p => p.user_id === item.user_id);
          const assessmentData = item.assessment_data as any;
          
          return {
            user_id: item.user_id,
            profile: {
              full_name: profile?.full_name || 'Anonymous User',
              emergency_contact: profile?.emergency_contact || '',
              emergency_phone: profile?.emergency_phone || '',
            },
            risk_level: item.risk_level,
            last_activity: item.created_at,
            conversation_count: assessmentData?.conversation?.length || 0,
          };
        });
        setActiveUsers(users);
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const fetchCrisisAlerts = async () => {
    try {
      const { data } = await supabase
        .from("sms_alerts")
        .select("*")
        .eq("alert_type", "crisis_emergency")
        .order("sent_at", { ascending: false })
        .limit(10);

      if (data) {
        // Get user profiles separately
        const userIds = data.map(item => item.sent_by).filter(Boolean);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const alertsWithProfiles = data.map(alert => {
          const profile = profiles?.find(p => p.user_id === alert.sent_by);
          return {
            ...alert,
            user_id: alert.sent_by || '',
            profile: {
              full_name: profile?.full_name || 'Anonymous User',
            },
          };
        });
        setCrisisAlerts(alertsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching crisis alerts:", error);
    }
  };

  const fetchLiveConversations = async () => {
    try {
      const { data } = await supabase
        .from("risk_assessments")
        .select("*")
        .not("chatbot_conversation", "is", null)
        .order("created_at", { ascending: false })
        .limit(15);

      if (data) {
        // Get user profiles separately
        const userIds = data.map(item => item.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const conversationsWithProfiles = data.map(conv => {
          const profile = profiles?.find(p => p.user_id === conv.user_id);
          return {
            ...conv,
            profile: {
              full_name: profile?.full_name || 'Anonymous User',
            },
          };
        });
        setLiveConversations(conversationsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendEmergencyResponse = async (userId: string) => {
    try {
      await supabase.from("sms_alerts").insert({
        recipient_phone: "admin_response",
        message: `Admin is responding to crisis alert for user ${userId}`,
        alert_type: "admin_intervention",
        sent_by: null,
      });

      toast({
        title: "Emergency Response Sent",
        description: "Crisis intervention team has been notified.",
      });
    } catch (error) {
      console.error("Error sending emergency response:", error);
    }
  };

  const viewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const selectedConv = liveConversations.find(c => c.id === selectedConversation);

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-6 w-6" />
            Real-Time Crisis Monitoring
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active-users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-users">Active Users</TabsTrigger>
          <TabsTrigger value="crisis-alerts">Crisis Alerts</TabsTrigger>
          <TabsTrigger value="conversations">Live Conversations</TabsTrigger>
          <TabsTrigger value="conversation-view">Conversation View</TabsTrigger>
        </TabsList>

        <TabsContent value="active-users">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Users ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <Card key={user.user_id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            user.risk_level === 'high' ? 'bg-crisis animate-pulse' : 'bg-wellness'
                          }`} />
                          <div>
                            <p className="font-semibold">{user.profile?.full_name || 'Anonymous User'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant={user.risk_level === 'high' ? 'destructive' : 'secondary'}>
                                {user.risk_level} risk
                              </Badge>
                              <span>{getTimeAgo(user.last_activity)}</span>
                              <span>• {user.conversation_count} messages</span>
                            </div>
                          </div>
                        </div>
                        {user.risk_level === 'high' && (
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => sendEmergencyResponse(user.user_id)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Intervene
                            </Button>
                            {user.profile?.emergency_phone && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`tel:${user.profile.emergency_phone}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crisis-alerts">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-crisis">
                <AlertTriangle className="h-5 w-5" />
                Crisis Alerts ({crisisAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {crisisAlerts.map((alert) => (
                    <Card key={alert.id} className="p-4 border-crisis">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">CRISIS</Badge>
                            <span className="font-semibold">{alert.profile?.full_name || 'Anonymous User'}</span>
                            <span className="text-sm text-muted-foreground">
                              {getTimeAgo(alert.sent_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <Badge variant={alert.delivery_status === 'sent' ? 'default' : 'secondary'}>
                            {alert.delivery_status}
                          </Badge>
                        </div>
                        <Button
                          variant="crisis"
                          size="sm"
                          onClick={() => sendEmergencyResponse(alert.user_id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Conversations ({liveConversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {liveConversations.map((conv) => (
                    <Card key={conv.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            conv.risk_level === 'high' ? 'bg-crisis animate-pulse' : 'bg-wellness'
                          }`} />
                          <div>
                            <p className="font-semibold">{conv.profile?.full_name || 'Anonymous User'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant={conv.risk_level === 'high' ? 'destructive' : 'secondary'}>
                                {conv.risk_level} risk
                              </Badge>
                              <span>{getTimeAgo(conv.created_at)}</span>
                              <span>• {Array.isArray(conv.chatbot_conversation) ? conv.chatbot_conversation.length : 0} messages</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewConversation(conv.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversation-view">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Conversation Viewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConv ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold">{selectedConv.profile?.full_name || 'Anonymous User'}</h4>
                      <Badge variant={selectedConv.risk_level === 'high' ? 'destructive' : 'secondary'}>
                        {selectedConv.risk_level} risk
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimeAgo(selectedConv.created_at)}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    <div className="space-y-3">
                      {(Array.isArray(selectedConv.chatbot_conversation) ? selectedConv.chatbot_conversation : []).map((message: any, index: number) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {selectedConv.risk_level === 'high' && (
                    <Button
                      variant="destructive"
                      onClick={() => sendEmergencyResponse(selectedConv.user_id)}
                      className="w-full"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Trigger Emergency Intervention
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a conversation to view details
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};