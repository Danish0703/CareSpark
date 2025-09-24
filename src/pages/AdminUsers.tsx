import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  Phone, 
  Search,
  Eye,
  UserX,
  Shield,
  Clock,
  Filter
} from "lucide-react";

interface User {
  user_id: string;
  profile: {
    full_name: string | null;
    email?: string;
    role: string;
    emergency_contact: string | null;
    emergency_phone: string | null;
    created_at: string;
  };
  latest_assessment?: {
    risk_level: string;
    assessment_score: number;
    created_at: string;
  };
  crisis_count: number;
  total_assessments: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "low">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, riskFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all user profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!profiles) return;

      // Get latest risk assessments for each user
      const userPromises = profiles.map(async (profile) => {
        const { data: assessment } = await supabase
          .from("risk_assessments")
          .select("risk_level, assessment_score, created_at")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { count: crisisCount } = await supabase
          .from("risk_assessments")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", profile.user_id)
          .eq("risk_level", "high");

        const { count: totalAssessments } = await supabase
          .from("risk_assessments")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", profile.user_id);

        return {
          user_id: profile.user_id,
          profile: {
            ...profile,
            email: `user${profile.user_id.substring(0, 8)}@example.com` // Placeholder since we can't access auth.users
          },
          latest_assessment: assessment || undefined,
          crisis_count: crisisCount || 0,
          total_assessments: totalAssessments || 0,
        };
      });

      const usersData = await Promise.all(userPromises);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by risk level
    if (riskFilter !== "all") {
      filtered = filtered.filter(user => 
        user.latest_assessment?.risk_level === riskFilter
      );
    }

    // Sort by risk level (high risk first) and then by latest activity
    filtered.sort((a, b) => {
      if (a.latest_assessment?.risk_level === "high" && b.latest_assessment?.risk_level !== "high") return -1;
      if (b.latest_assessment?.risk_level === "high" && a.latest_assessment?.risk_level !== "high") return 1;
      
      const aTime = new Date(a.latest_assessment?.created_at || a.profile.created_at).getTime();
      const bTime = new Date(b.latest_assessment?.created_at || b.profile.created_at).getTime();
      return bTime - aTime;
    });

    setFilteredUsers(filtered);
  };

  const viewUserDetails = (userId: string) => {
    // This would open a detailed user view
    toast({
      title: "User Details",
      description: `Viewing details for user ${userId}`,
    });
  };

  const flagUser = async (userId: string) => {
    try {
      await supabase.from("sms_alerts").insert({
        recipient_phone: "admin_flag",
        message: `User ${userId} has been flagged for administrative review`,
        alert_type: "admin_flag",
        sent_by: null,
      });

      toast({
        title: "User Flagged",
        description: "User has been flagged for administrative review",
      });
    } catch (error) {
      console.error("Error flagging user:", error);
    }
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

  const getRiskBadgeVariant = (riskLevel?: string) => {
    switch (riskLevel) {
      case "high": return "destructive";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-card border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="h-6 w-6" />
            User Management ({filteredUsers.length} users)
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={riskFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRiskFilter("all")}
              >
                <Filter className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button
                variant={riskFilter === "high" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setRiskFilter("high")}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                High Risk
              </Button>
              <Button
                variant={riskFilter === "low" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setRiskFilter("low")}
              >
                <Shield className="h-4 w-4 mr-1" />
                Low Risk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6 space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.user_id} className={`p-4 border-l-4 ${
                  user.latest_assessment?.risk_level === "high" 
                    ? "border-l-crisis bg-crisis/5" 
                    : "border-l-primary"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        user.latest_assessment?.risk_level === "high" 
                          ? "bg-crisis animate-pulse" 
                          : user.latest_assessment?.risk_level === "low"
                          ? "bg-wellness"
                          : "bg-muted"
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {user.profile?.full_name || "Anonymous User"}
                          </h3>
                          <Badge variant={getRiskBadgeVariant(user.latest_assessment?.risk_level)}>
                            {user.latest_assessment?.risk_level || "No assessment"}
                          </Badge>
                          <Badge variant="outline">
                            {user.profile?.role}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{user.profile?.email}</p>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last activity: {user.latest_assessment ? getTimeAgo(user.latest_assessment.created_at) : "Never"}
                            </span>
                            <span>Crisis alerts: {user.crisis_count}</span>
                            <span>Total assessments: {user.total_assessments}</span>
                          </div>
                          {user.profile?.emergency_contact && (
                            <p className="text-xs">
                              Emergency: {user.profile.emergency_contact} ({user.profile.emergency_phone})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user.latest_assessment?.risk_level === "high" && user.profile?.emergency_phone && (
                        <Button variant="crisis" size="sm" asChild>
                          <a href={`tel:${user.profile.emergency_phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserDetails(user.user_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => flagUser(user.user_id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;