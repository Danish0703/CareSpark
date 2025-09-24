import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Clock,
  Heart,
  Star,
  UserPlus,
  Video,
  Phone,
  Send,
  Search,
  Filter,
  Smile,
  Zap,
  Globe,
  Shield
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
  isActive: boolean;
  tags: string[];
}

interface PeerConnection {
  id: string;
  name: string;
  supportType: string;
  lastActive: string;
  matchPercentage: number;
  isOnline: boolean;
  bio: string;
  sharedInterests: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  senderAvatar?: string;
}

export const EnhancedPeerSupport = () => {
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([
    {
      id: "1",
      title: "Anxiety Support Circle",
      description: "A safe space to share experiences and coping strategies for anxiety management with peer moderators.",
      category: "Anxiety",
      memberCount: 24,
      nextMeeting: "2024-01-15T19:00:00",
      isJoined: false,
      facilitator: "Dr. Sarah Johnson",
      isActive: true,
      tags: ["anxiety", "coping", "support", "weekly"]
    },
    {
      id: "2",
      title: "Depression Recovery Group",
      description: "Support group focused on sharing recovery stories and practical daily strategies for managing depression.",
      category: "Depression", 
      memberCount: 18,
      nextMeeting: "2024-01-16T18:30:00",
      isJoined: true,
      facilitator: "Mike Chen, LCSW",
      isActive: true,
      tags: ["depression", "recovery", "stories", "hope"]
    },
    {
      id: "3",
      title: "Young Adults Mental Health",
      description: "Peer support specifically for young adults (18-30) navigating mental health challenges in modern life.",
      category: "General",
      memberCount: 31,
      nextMeeting: "2024-01-17T20:00:00", 
      isJoined: false,
      facilitator: "Emma Rodriguez",
      isActive: true,
      tags: ["young-adults", "peer-support", "modern-life", "community"]
    },
    {
      id: "4",
      title: "Mindfulness & Meditation Group",
      description: "Weekly sessions focusing on mindfulness practices, guided meditations, and sharing peaceful moments together.",
      category: "Mindfulness",
      memberCount: 27,
      nextMeeting: "2024-01-18T17:00:00",
      isJoined: true,
      facilitator: "Lisa Park",
      isActive: true,
      tags: ["mindfulness", "meditation", "peace", "weekly"]
    }
  ]);

  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([
    {
      id: "1",
      name: "Alex Thompson",
      supportType: "Anxiety & Stress Management",
      lastActive: "2 hours ago",
      matchPercentage: 89,
      isOnline: true,
      bio: "Software engineer dealing with work stress. Love hiking and mindfulness practices.",
      sharedInterests: ["Technology", "Mindfulness", "Hiking", "Reading"]
    },
    {
      id: "2", 
      name: "Jordan Martinez",
      supportType: "Depression Support",
      lastActive: "1 day ago",
      matchPercentage: 76,
      isOnline: false,
      bio: "Art student passionate about creative expression as therapy. Always here to listen.",
      sharedInterests: ["Art", "Music", "Poetry", "Nature"]
    },
    {
      id: "3",
      name: "Sam Wilson",
      supportType: "General Wellness",
      lastActive: "30 minutes ago", 
      matchPercentage: 82,
      isOnline: true,
      bio: "Yoga instructor focusing on holistic wellness. Believer in community support.",
      sharedInterests: ["Yoga", "Meditation", "Wellness", "Community"]
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Community Bot",
      message: "Welcome to the Peer Support Community! Please be respectful and supportive of all members.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isOwn: false,
      senderAvatar: "🤖"
    },
    {
      id: "2",
      sender: "Alex T.",
      message: "Hi everyone! Just wanted to check in. How is everyone doing today?",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isOwn: false,
      senderAvatar: "AT"
    },
    {
      id: "3",
      sender: "Jordan M.",
      message: "Thanks for asking Alex! Had a tough morning but feeling better now. Hope everyone else is doing well 💙",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isOwn: false,
      senderAvatar: "JM"
    },
    {
      id: "4",
      sender: "You",
      message: "Good to hear Jordan! Sending positive vibes to everyone. Remember, we're all in this together! 🌟",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isOwn: true,
      senderAvatar: "Me"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlinePresence, setOnlinePresence] = useState(12);
  const { toast } = useToast();

  useEffect(() => {
    setupPresenceTracking();
    setupRealtimeSubscriptions();
    
    return () => {
      // Cleanup subscriptions
    };
  }, []);

  const setupPresenceTracking = async () => {
    try {
      // Simulate real-time presence updates
      const interval = setInterval(() => {
        setOnlinePresence(prev => Math.max(8, Math.min(25, prev + Math.floor(Math.random() * 3) - 1)));
      }, 30000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error setting up presence:", error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Simulate incoming messages
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 10 seconds
        const sampleMessages = [
          "Hope everyone is having a peaceful evening 🌙",
          "Just finished a great meditation session. Feeling centered!",
          "Grateful for this supportive community today ❤️",
          "Anyone want to share a positive affirmation?",
          "Sending healing energy to everyone here ✨"
        ];
        
        const senders = ["Alex T.", "Jordan M.", "Sam W.", "Taylor R.", "Casey L."];
        const randomSender = senders[Math.floor(Math.random() * senders.length)];
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: randomSender,
          message: randomMessage,
          timestamp: new Date().toISOString(),
          isOwn: false,
          senderAvatar: randomSender.split(' ').map(n => n[0]).join('')
        };

        setChatMessages(prev => [...prev, newMsg]);
      }
    }, 10000);

    return () => clearInterval(messageInterval);
  };

  const joinGroup = (groupId: string) => {
    setSupportGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      )
    );
    
    toast({
      title: "Joined Support Group",
      description: "You've successfully joined the support group. You'll receive meeting notifications.",
    });
  };

  const leaveGroup = (groupId: string) => {
    setSupportGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, isJoined: false, memberCount: Math.max(0, group.memberCount - 1) }
          : group
      )
    );
    
    toast({
      title: "Left Support Group",
      description: "You've left the support group.",
      variant: "destructive"
    });
  };

  const connectWithPeer = (peerId: string, peerName: string) => {
    toast({
      title: "Connection Request Sent",
      description: `Your connection request has been sent to ${peerName}. They'll be notified shortly.`,
    });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "You",
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isOwn: true,
        senderAvatar: "Me"
      };

      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Simulate response after a delay
      setTimeout(() => {
        const responses = [
          "Thank you for sharing that 💙",
          "I really appreciate your perspective!",
          "Sending you positive thoughts ✨",
          "That's really helpful, thank you!",
          "You always know what to say 🌟"
        ];
        
        const responseMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "Alex T.",
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          isOwn: false,
          senderAvatar: "AT"
        };
        
        setChatMessages(prev => [...prev, responseMsg]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const filteredGroups = supportGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           group.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "anxiety": return "bg-crisis-light text-crisis";
      case "depression": return "bg-primary-light text-primary";
      case "mindfulness": return "bg-wellness-light text-wellness";
      case "general": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Peer Support Network
          </div>
          <Badge variant="default" className="bg-green-100 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            {onlinePresence} members online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups">Support Groups</TabsTrigger>
            <TabsTrigger value="connections">Peer Connections</TabsTrigger>
            <TabsTrigger value="chat">Community Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search support groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm min-w-[150px]"
              >
                <option value="all">All Categories</option>
                <option value="anxiety">Anxiety</option>
                <option value="depression">Depression</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Support Groups Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{group.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {group.description}
                        </p>
                      </div>
                      <Badge className={getCategoryColor(group.category)} variant="secondary">
                        {group.category}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{group.memberCount} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(group.nextMeeting).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          Facilitator: <span className="font-medium">{group.facilitator}</span>
                        </div>
                        <div className="flex gap-2">
                          {group.isJoined ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => leaveGroup(group.id)}>
                                Leave
                              </Button>
                              <Button size="sm" variant="default">
                                <Video className="mr-2 h-4 w-4" />
                                Join Meeting
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="wellness" onClick={() => joinGroup(group.id)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Join Group
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {group.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Connect with peers who share similar experiences and interests
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peerConnections.map((peer) => (
                <Card key={peer.id} className="hover:shadow-lg transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary-light text-primary">
                            {peer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {peer.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{peer.name}</h3>
                        <p className="text-sm text-muted-foreground">{peer.supportType}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            {peer.matchPercentage}% match
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Active {peer.lastActive}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 mb-4">
                      {peer.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {peer.sharedInterests.map((interest) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => connectWithPeer(peer.id, peer.name)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                      <Button size="sm" variant="default" className="flex-1">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="bg-wellness-light border border-wellness/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-wellness" />
                <span className="font-medium text-wellness">Community Guidelines</span>
              </div>
              <ul className="text-sm text-wellness-foreground/80 space-y-1">
                <li>• Be respectful and supportive of all members</li>
                <li>• Keep conversations positive and constructive</li>
                <li>• Respect privacy - no personal details sharing</li>
                <li>• Report any inappropriate behavior to moderators</li>
              </ul>
            </div>

            <Card className="h-[400px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Community Chat
                  <Badge variant="outline" className="ml-auto">
                    {onlinePresence} online
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-primary-light text-primary">
                              {message.senderAvatar || message.sender.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.isOwn 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.sender}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message... (Keep it supportive!)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      variant="wellness"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};