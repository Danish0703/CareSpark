import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  Star, 
  Clock,
  Video,
  Phone,
  MessageSquare,
  User,
  Award,
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Heart,
  Brain,
  Shield
} from "lucide-react";

interface CounsellorSession {
  id: string;
  counsellor_name: string;
  session_date: string;
  session_notes: string;
  session_rating: number | null;
  next_appointment: string | null;
}

interface Counsellor {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  experience: string;
  bio: string;
  availability: string[];
  sessionTypes: ("video" | "phone" | "chat")[];
  profileImage?: string;
  languages: string[];
  approaches: string[];
}

interface AppointmentRequest {
  counsellor_id: string;
  preferred_date: Date | null;
  preferred_time: string;
  session_type: "video" | "phone" | "chat";
  notes: string;
}

export const EnhancedCounsellor = () => {
  const [sessions, setSessions] = useState<CounsellorSession[]>([]);
  const [counsellors] = useState<Counsellor[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: ["Anxiety", "Depression", "PTSD"],
      rating: 4.9,
      experience: "8+ years",
      bio: "Specialized in cognitive behavioral therapy with extensive experience helping individuals overcome anxiety and depression.",
      availability: ["Mon", "Wed", "Fri"],
      sessionTypes: ["video", "phone"],
      languages: ["English", "Spanish"],
      approaches: ["CBT", "Mindfulness", "Trauma-informed"]
    },
    {
      id: "2",
      name: "Mike Chen, LCSW",
      specialty: ["Depression", "Stress Management", "Life Transitions"],
      rating: 4.8,
      experience: "6+ years",
      bio: "Licensed clinical social worker focused on helping clients navigate major life changes and manage chronic stress.",
      availability: ["Tue", "Thu", "Sat"],
      sessionTypes: ["video", "chat"],
      languages: ["English", "Mandarin"],
      approaches: ["Solution-focused", "Humanistic", "Psychodynamic"]
    },
    {
      id: "3",
      name: "Dr. Emma Rodriguez",
      specialty: ["Anxiety", "Social Anxiety", "Panic Disorders"],
      rating: 4.9,
      experience: "10+ years",
      bio: "Clinical psychologist specializing in anxiety disorders with particular expertise in social anxiety and panic attacks.",
      availability: ["Mon", "Tue", "Thu", "Fri"],
      sessionTypes: ["video", "phone", "chat"],
      languages: ["English"],
      approaches: ["CBT", "Exposure therapy", "EMDR"]
    },
    {
      id: "4",
      name: "Dr. James Kim",
      specialty: ["Stress", "Work-life Balance", "Burnout Prevention"],
      rating: 4.7,
      experience: "5+ years",
      bio: "Occupational psychologist helping professionals manage workplace stress and achieve better work-life balance.",
      availability: ["Wed", "Thu", "Fri", "Sat"],
      sessionTypes: ["video", "phone"],
      languages: ["English", "Korean"],
      approaches: ["ACT", "Stress management", "Workplace psychology"]
    }
  ]);

  const [appointmentRequest, setAppointmentRequest] = useState<AppointmentRequest>({
    counsellor_id: "",
    preferred_date: null,
    preferred_time: "",
    session_type: "video",
    notes: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('counsellor-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counsellor_sessions'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("counsellor_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const bookAppointment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!appointmentRequest.preferred_date || !appointmentRequest.preferred_time) {
        toast({
          title: "Missing Information",
          description: "Please select a date and time for your appointment.",
          variant: "destructive",
        });
        return;
      }

      const counsellor = counsellors.find(c => c.id === appointmentRequest.counsellor_id);
      if (!counsellor) return;

      // In a real app, this would create a booking request
      const sessionDate = new Date(appointmentRequest.preferred_date);
      const [hours, minutes] = appointmentRequest.preferred_time.split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from("counsellor_sessions")
        .insert({
          user_id: user.id,
          counsellor_name: counsellor.name,
          session_date: sessionDate.toISOString(),
          session_notes: `Upcoming ${appointmentRequest.session_type} session. Notes: ${appointmentRequest.notes}`,
          next_appointment: sessionDate.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked! 📅",
        description: `Your ${appointmentRequest.session_type} session with ${counsellor.name} has been scheduled.`,
      });

      setAppointmentRequest({
        counsellor_id: "",
        preferred_date: null,
        preferred_time: "",
        session_type: "video",
        notes: ""
      });

      fetchSessions();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const ratePastSession = async (sessionId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from("counsellor_sessions")
        .update({ session_rating: rating })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });

      fetchSessions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredCounsellors = counsellors.filter(counsellor => {
    const matchesSearch = counsellor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counsellor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counsellor.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = selectedSpecialty === "all" || 
                             counsellor.specialty.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase());
    
    return matchesSearch && matchesSpecialty;
  });

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case "anxiety":
        return <Brain className="h-4 w-4 text-primary" />;
      case "depression":
        return <Heart className="h-4 w-4 text-wellness" />;
      case "stress":
      case "stress management":
        return <Shield className="h-4 w-4 text-crisis" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const upcomingSessions = sessions.filter(session => 
    session.next_appointment && new Date(session.next_appointment) > new Date()
  );
  
  const pastSessions = sessions.filter(session => 
    new Date(session.session_date) < new Date()
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Professional Counselling
          </CardTitle>
          <p className="text-muted-foreground">
            Connect with licensed mental health professionals for personalized support
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="book" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="book">Book Session</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-4">
          {/* Search and Filters */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search counsellors or specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Specialties</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="stress">Stress Management</option>
                  <option value="ptsd">PTSD</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Counsellors Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredCounsellors.map((counsellor) => (
              <Card key={counsellor.id} className="shadow-card hover:shadow-lg transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary-light text-primary text-lg">
                        {counsellor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{counsellor.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{counsellor.rating}</span>
                        </div>
                        <Badge variant="outline">{counsellor.experience}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {counsellor.specialty.map(spec => (
                          <Badge key={spec} variant="secondary" className="text-xs flex items-center gap-1">
                            {getSpecialtyIcon(spec)}
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {counsellor.bio}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Sessions:</h4>
                      <div className="flex gap-2">
                        {counsellor.sessionTypes.map(type => (
                          <Badge key={type} variant="outline" className="flex items-center gap-1">
                            {getSessionTypeIcon(type)}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Approaches:</h4>
                      <div className="flex flex-wrap gap-1">
                        {counsellor.approaches.map(approach => (
                          <Badge key={approach} variant="outline" className="text-xs">
                            {approach}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Languages:</h4>
                      <div className="flex gap-1">
                        {counsellor.languages.map(lang => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="wellness"
                        onClick={() => setAppointmentRequest(prev => ({ ...prev, counsellor_id: counsellor.id }))}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Book Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Book Session with {counsellor.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Preferred Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-2",
                                  !appointmentRequest.preferred_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {appointmentRequest.preferred_date ? (
                                  format(appointmentRequest.preferred_date, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={appointmentRequest.preferred_date || undefined}
                                onSelect={(date) => setAppointmentRequest(prev => ({ ...prev, preferred_date: date || null }))}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label htmlFor="time">Preferred Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={appointmentRequest.preferred_time}
                            onChange={(e) => setAppointmentRequest(prev => ({ ...prev, preferred_time: e.target.value }))}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Session Type</Label>
                          <select
                            value={appointmentRequest.session_type}
                            onChange={(e) => setAppointmentRequest(prev => ({ ...prev, session_type: e.target.value as "video" | "phone" | "chat" }))}
                            className="w-full px-3 py-2 border rounded-md mt-2"
                          >
                            {counsellor.sessionTypes.map(type => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)} Session
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={appointmentRequest.notes}
                            onChange={(e) => setAppointmentRequest(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Anything you'd like your counsellor to know beforehand..."
                            className="mt-2"
                          />
                        </div>

                        <Button onClick={bookAppointment} className="w-full">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <Card key={session.id} className="shadow-card border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{session.counsellor_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(session.next_appointment!).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(session.next_appointment!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        {session.session_notes && (
                          <p className="text-sm text-muted-foreground">{session.session_notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="default">
                          <Video className="mr-2 h-3 w-3" />
                          Join Session
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-2 h-3 w-3" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground mb-6">
                  Book your first session with one of our licensed counsellors.
                </p>
                <Button variant="wellness">
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map(session => (
                <Card key={session.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{session.counsellor_name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">
                            {new Date(session.session_date).toLocaleDateString()}
                          </Badge>
                          {session.session_rating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: session.session_rating }, (_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {!session.session_rating && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant="ghost"
                              size="sm"
                              onClick={() => ratePastSession(session.id, rating)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    {session.session_notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {session.session_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Session History</h3>
                <p className="text-muted-foreground">
                  Your completed sessions will appear here after your appointments.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};