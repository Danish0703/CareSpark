import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Clock,
  Heart,
  Star,
  UserPlus,
  Video
} from "lucide-react";

interface SupportGroup {
  id: string;
  title: string;
  description: string;
  category: string;
  memberCount: number;
  nextMeeting: string;
  isJoined: boolean;
  facilitator: string;
}

interface PeerConnection {
  id: string;
  name: string;
  supportType: string;
  lastActive: string;
  matchPercentage: number;
  isOnline: boolean;
}

export const PeerSupport = () => {
  const [supportGroups] = useState<SupportGroup[]>([
    {
      id: "1",
      title: "Anxiety Support Circle",
      description: "A safe space to share experiences and coping strategies for anxiety management.",
      category: "Anxiety",
      memberCount: 24,
      nextMeeting: "2024-01-15T19:00:00",
      isJoined: false,
      facilitator: "Dr. Sarah Johnson"
    },
    {
      id: "2",
      title: "Depression Recovery Group",
      description: "Support group focused on sharing recovery stories and practical daily strategies.",
      category: "Depression", 
      memberCount: 18,
      nextMeeting: "2024-01-16T18:30:00",
      isJoined: true,
      facilitator: "Mike Chen, LCSW"
    },
    {
      id: "3",
      title: "Young Adults Mental Health",
      description: "Peer support specifically for young adults navigating mental health challenges.",
      category: "General",
      memberCount: 31,
      nextMeeting: "2024-01-17T20:00:00", 
      isJoined: false,
      facilitator: "Emma Rodriguez"
    },
    {
      id: "4",
      title: "Stress & Work-Life Balance",
      description: "Managing workplace stress and finding healthy work-life balance strategies.",
      category: "Stress",
      memberCount: 15,
      nextMeeting: "2024-01-18T17:00:00",
      isJoined: false,
      facilitator: "Dr. James Kim"
    }
  ]);

  const [peerConnections] = useState<PeerConnection[]>([
    {
      id: "1",
      name: "Alex M.",
      supportType: "Anxiety & Social Support",
      lastActive: "2 hours ago",
      matchPercentage: 92,
      isOnline: true
    },
    {
      id: "2", 
      name: "Jordan K.",
      supportType: "Depression Recovery",
      lastActive: "1 day ago",
      matchPercentage: 88,
      isOnline: false
    },
    {
      id: "3",
      name: "Sam L.", 
      supportType: "General Wellness",
      lastActive: "5 minutes ago",
      matchPercentage: 85,
      isOnline: true
    }
  ]);

  const { toast } = useToast();

  const joinGroup = (groupId: string) => {
    toast({
      title: "Joined Support Group",
      description: "You'll receive meeting reminders and can participate in group discussions.",
    });
  };

  const connectWithPeer = (peerId: string, peerName: string) => {
    toast({
      title: "Connection Request Sent",
      description: `Your request to connect with ${peerName} has been sent.`,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "anxiety":
        return "bg-primary-light text-primary";
      case "depression":
        return "bg-wellness-light text-wellness";
      case "stress":
        return "bg-crisis-light text-crisis";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Peer Support Network
          </CardTitle>
          <p className="text-muted-foreground">
            Connect with others who understand your journey and share similar experiences
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Support Groups</TabsTrigger>
          <TabsTrigger value="connections">Peer Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {supportGroups.map((group) => (
              <Card key={group.id} className="shadow-card hover:shadow-lg transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{group.title}</h3>
                      <Badge className={getCategoryColor(group.category)}>
                        {group.category}
                      </Badge>
                    </div>
                    {group.isJoined && (
                      <Badge variant="default">Joined</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{group.facilitator}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Next meeting: {new Date(group.nextMeeting).toLocaleDateString()} at {new Date(group.nextMeeting).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {group.isJoined ? (
                        <>
                          <Button size="sm" variant="default" className="flex-1">
                            <Video className="mr-2 h-3 w-3" />
                            Join Meeting
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="mr-2 h-3 w-3" />
                            Chat
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="wellness" 
                          className="flex-1"
                          onClick={() => joinGroup(group.id)}
                        >
                          <UserPlus className="mr-2 h-3 w-3" />
                          Join Group
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-wellness" />
                Recommended Connections
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on your profile and interests, here are peers who might offer valuable support
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {peerConnections.map((peer) => (
                <div key={peer.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{peer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {peer.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{peer.name}</h4>
                        <p className="text-sm text-muted-foreground">{peer.supportType}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {peer.matchPercentage}% match
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Active {peer.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => connectWithPeer(peer.id, peer.name)}
                    >
                      <UserPlus className="mr-2 h-3 w-3" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No active conversations yet. Connect with peers to start meaningful discussions.
                </p>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Find Peer Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};