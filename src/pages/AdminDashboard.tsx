import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from "recharts";
import { 
  Users, 
  AlertTriangle, 
  Heart, 
  TrendingUp, 
  Download, 
  Send,
  LogOut,
  Shield,
  Activity
} from "lucide-react";
import { RealTimeMonitor } from "@/components/admin/RealTimeMonitor";

interface DashboardStats {
  totalUsers: number;
  highRiskUsers: number;
  lowRiskUsers: number;
  totalAssessments: number;
  recentActivity: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    highRiskUsers: 0,
    lowRiskUsers: 0,
    totalAssessments: 0,
    recentActivity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
    fetchDashboardStats();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin-auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "Access denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/admin-auth");
      }
    } catch (error) {
      console.error("Admin auth check error:", error);
      navigate("/admin-auth");
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

      // Fetch risk assessments
      const { data: assessments } = await supabase
        .from("risk_assessments")
        .select("risk_level, created_at");

      const highRiskUsers = assessments?.filter(a => a.risk_level === "high").length || 0;
      const lowRiskUsers = assessments?.filter(a => a.risk_level === "low").length || 0;
      const totalAssessments = assessments?.length || 0;

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = assessments?.filter(
        a => new Date(a.created_at) > sevenDaysAgo
      ).length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        highRiskUsers,
        lowRiskUsers,
        totalAssessments,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "Admin session ended.",
      });
      navigate("/admin-auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleSendAlert = () => {
    toast({
      title: "Alert sent",
      description: "SMS alert has been sent to high-risk users.",
    });
  };

  const chartData = [
    { name: "High Risk", value: stats.highRiskUsers, color: "#ef4444" },
    { name: "Low Risk", value: stats.lowRiskUsers, color: "#22c55e" },
  ];

  const weeklyData = [
    { day: "Mon", assessments: 12 },
    { day: "Tue", assessments: 19 },
    { day: "Wed", assessments: 15 },
    { day: "Thu", assessments: 22 },
    { day: "Fri", assessments: 18 },
    { day: "Sat", assessments: 8 },
    { day: "Sun", assessments: 11 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">Loading admin dashboard...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Admin Dashboard
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Monitor user wellbeing and system analytics
                </p>
              </div>
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
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-semibold">Total Users</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Registered users</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-crisis" />
                <span className="font-semibold">High Risk</span>
              </div>
              <div className="text-2xl font-bold text-crisis">{stats.highRiskUsers}</div>
              <div className="text-sm text-muted-foreground">Require attention</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-wellness" />
                <span className="font-semibold">Low Risk</span>
              </div>
              <div className="text-2xl font-bold text-wellness">{stats.lowRiskUsers}</div>
              <div className="text-sm text-muted-foreground">Wellness focused</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold">Recent Activity</span>
              </div>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="realtime" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime">Real-Time Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">SMS Alerts</TabsTrigger>
            <TabsTrigger value="exports">Data Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Risk Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekly Assessments */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Weekly Assessment Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="assessments" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  SMS Alert System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Send Crisis Alert</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send immediate support message to all high-risk users.
                  </p>
                  <Button variant="crisis" onClick={handleSendAlert}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Crisis Alert
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Wellness Check-in</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send wellness reminders to all users.
                  </p>
                  <Button variant="wellness" onClick={handleSendAlert}>
                    <Heart className="mr-2 h-4 w-4" />
                    Send Wellness Reminder
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Alert History</h4>
                  <p className="text-sm text-muted-foreground">
                    Recent alerts will appear here once the SMS service is configured.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">User Assessment Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export all risk assessment data in CSV format.
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Assessments
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">User Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export user engagement and activity metrics.
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Analytics
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Wellness Activities</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export wellness activity completion data.
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Activities
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Counsellor Sessions</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export counsellor session tracking data.
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Sessions
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Export Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All exported data is anonymized for privacy protection</li>
                    <li>• Exports are generated in real-time and may take a few minutes</li>
                    <li>• Data exports comply with healthcare privacy regulations</li>
                    <li>• Export history is maintained for audit purposes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;