import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, MessageSquare, Settings, Star, Clock, DollarSign, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CounselorProfile {
  id: string;
  specialty: string;
  license_number: string;
  years_experience: number;
  hourly_rate: number;
  bio: string;
  rating: number;
  total_reviews: number;
  is_available: boolean;
}

interface Appointment {
  id: string;
  user_id: string;
  session_date: string;
  session_notes: string;
  session_rating: number;
  client_name: string;
}

const CounselorDashboard = () => {
  const [profile, setProfile] = useState<CounselorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkCounselorAuth();
  }, []);

  const checkCounselorAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/counselor-auth");
        return;
      }

      // Check if user has counselor role
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (userProfile?.role !== "counselor") {
        toast({
          title: "Access Denied",
          description: "You must be a registered counselor to access this dashboard.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Create mock counselor profile
      const mockProfile: CounselorProfile = {
        id: user.id,
        specialty: "General Mental Health",
        license_number: "LIC-12345",
        years_experience: 5,
        hourly_rate: 120.00,
        bio: "Welcome to my practice. I'm here to help you on your mental wellness journey.",
        rating: 4.8,
        total_reviews: 24,
        is_available: true
      };
      setProfile(mockProfile);

      // Create mock appointments data
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          user_id: "user1",
          session_date: new Date().toISOString(),
          session_notes: "Initial consultation completed successfully",
          session_rating: 5,
          client_name: "John Doe"
        },
        {
          id: "2",
          user_id: "user2", 
          session_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          session_notes: "Follow-up session on anxiety management",
          session_rating: 0,
          client_name: "Jane Smith"
        },
        {
          id: "3",
          user_id: "user3",
          session_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          session_notes: "Productive session on coping strategies",
          session_rating: 4,
          client_name: "Mike Johnson"
        }
      ];
      setAppointments(mockAppointments);

    } catch (error) {
      console.error("Error checking auth:", error);
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate("/counselor-auth");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.session_date).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.session_date) > new Date()
  );

  const averageRating = appointments.length > 0 
    ? appointments.reduce((acc, apt) => acc + (apt.session_rating || 0), 0) / appointments.filter(apt => apt.session_rating > 0).length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Counselor Dashboard</h1>
          <p className="text-muted-foreground">Manage your practice and client sessions</p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingAppointments.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From {appointments.filter(apt => apt.session_rating > 0).length} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profile?.hourly_rate || 0}</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No appointments today</p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.client_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{appointment.client_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.session_date).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        50min
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your latest completed sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.client_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.client_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.session_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {appointment.session_rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{appointment.session_rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>Manage your past and upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.client_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.client_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.session_date).toLocaleString()}
                        </p>
                        {appointment.session_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Notes: {appointment.session_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.session_rating > 0 && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {appointment.session_rating}
                        </Badge>
                      )}
                      <Badge variant={new Date(appointment.session_date) > new Date() ? "default" : "outline"}>
                        {new Date(appointment.session_date) > new Date() ? "Upcoming" : "Completed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>View and manage your client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.reduce((unique, appointment) => {
                  const exists = unique.find(item => item.user_id === appointment.user_id);
                  if (!exists) {
                    unique.push(appointment);
                  }
                  return unique;
                }, [] as Appointment[]).map((client) => (
                  <div key={client.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {client.client_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.client_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointments.filter(apt => apt.user_id === client.user_id).length} sessions
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Counselor Profile</CardTitle>
              <CardDescription>Manage your professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Specialty</label>
                  <p className="text-muted-foreground">{profile?.specialty || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Years of Experience</label>
                  <p className="text-muted-foreground">{profile?.years_experience || 0} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium">License Number</label>
                  <p className="text-muted-foreground">{profile?.license_number || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hourly Rate</label>
                  <p className="text-muted-foreground">${profile?.hourly_rate || 0}/hour</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <p className="text-muted-foreground mt-1">{profile?.bio || "No bio provided"}</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CounselorDashboard;