import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Play, 
  Download, 
  ExternalLink,
  Heart,
  Brain,
  Shield,
  Headphones,
  Search,
  Bookmark,
  Star,
  Filter,
  Clock,
  Users,
  TrendingUp,
  Award,
  Zap,
  Moon,
  Smile
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "audio" | "guide" | "course";
  category: "anxiety" | "depression" | "stress" | "general" | "sleep" | "mindfulness";
  url?: string;
  duration?: string;
  rating: number;
  bookmarked: boolean;
  completed: boolean;
  views: number;
  tags: string[];
}

export const EnhancedResourceHub = () => {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "Understanding Anxiety: A Complete Guide",
      description: "Learn about anxiety disorders, symptoms, and evidence-based coping strategies from licensed mental health professionals.",
      type: "article",
      category: "anxiety",
      url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
      duration: "15 min read",
      rating: 4.8,
      bookmarked: false,
      completed: false,
      views: 2341,
      tags: ["anxiety", "disorders", "coping", "guide"]
    },
    {
      id: "2",
      title: "Mindfulness Meditation for Beginners",
      description: "A comprehensive video series introducing mindfulness meditation techniques for stress reduction and mental clarity.",
      type: "video",
      category: "mindfulness",
      url: "https://www.youtube.com/watch?v=inpok4MKVLM",
      duration: "12 min",
      rating: 4.9,
      bookmarked: true,
      completed: false,
      views: 5127,
      tags: ["mindfulness", "meditation", "beginners", "stress-relief"]
    },
    {
      id: "3",
      title: "Sleep Hygiene: Better Sleep for Better Health",
      description: "Evidence-based strategies for improving sleep quality and addressing common sleep disorders from Mayo Clinic.",
      type: "article",
      category: "sleep",
      url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379",
      duration: "10 min read",
      rating: 4.7,
      bookmarked: false,
      completed: true,
      views: 1892,
      tags: ["sleep", "health", "hygiene", "wellness"]
    },
    {
      id: "4",
      title: "Cognitive Behavioral Therapy Workbook",
      description: "Interactive workbook with CBT exercises and techniques for managing depression and anxiety symptoms.",
      type: "guide",
      category: "depression",
      url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression",
      duration: "Self-paced",
      rating: 4.6,
      bookmarked: false,
      completed: false,
      views: 987,
      tags: ["CBT", "workbook", "depression", "anxiety", "therapy"]
    },
    {
      id: "5",
      title: "Stress Management Techniques",
      description: "Practical audio guide featuring stress reduction techniques including breathing exercises and progressive muscle relaxation.",
      type: "audio",
      category: "stress",
      url: "https://www.headspace.com/meditation/stress",
      duration: "25 min",
      rating: 4.5,
      bookmarked: true,
      completed: false,
      views: 3241,
      tags: ["stress", "relaxation", "breathing", "mindfulness"]
    },
    {
      id: "6",
      title: "Mental Health First Aid Course",
      description: "Comprehensive online course teaching how to identify and respond to mental health crises and provide initial support.",
      type: "course",
      category: "general",
      url: "https://www.mentalhealthfirstaid.org/",
      duration: "8 hours",
      rating: 4.9,
      bookmarked: false,
      completed: false,
      views: 756,
      tags: ["first-aid", "crisis", "support", "training"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "views" | "duration">("rating");
  const { toast } = useToast();

  const toggleBookmark = (resourceId: string) => {
    setResources(resources.map(resource =>
      resource.id === resourceId
        ? { ...resource, bookmarked: !resource.bookmarked }
        : resource
    ));
    
    const resource = resources.find(r => r.id === resourceId);
    toast({
      title: resource?.bookmarked ? "Bookmark Removed" : "Bookmark Added",
      description: resource?.bookmarked 
        ? `Removed "${resource.title}" from bookmarks`
        : `Added "${resource?.title}" to bookmarks`,
    });
  };

  const markAsCompleted = (resourceId: string) => {
    setResources(resources.map(resource =>
      resource.id === resourceId
        ? { ...resource, completed: true }
        : resource
    ));
    
    const resource = resources.find(r => r.id === resourceId);
    toast({
      title: "Resource Completed!",
      description: `Great job completing "${resource?.title}"`,
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />;
      case "audio": return <Headphones className="h-4 w-4" />;
      case "guide": return <Download className="h-4 w-4" />;
      case "course": return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "anxiety": return <Heart className="h-3 w-3" />;
      case "depression": return <Brain className="h-3 w-3" />;
      case "stress": return <Zap className="h-3 w-3" />;
      case "sleep": return <Moon className="h-3 w-3" />;
      case "mindfulness": return <Smile className="h-3 w-3" />;
      default: return <Heart className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "anxiety": return "bg-crisis-light text-crisis";
      case "depression": return "bg-primary-light text-primary";
      case "stress": return "bg-wellness-light text-wellness";
      case "sleep": return "bg-accent text-accent-foreground";
      case "mindfulness": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredResources = resources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      const matchesType = selectedType === "all" || resource.type === selectedType;
      const matchesBookmarked = !showBookmarked || resource.bookmarked;
      
      return matchesSearch && matchesCategory && matchesType && matchesBookmarked;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "views": return b.views - a.views;
        case "duration": return a.duration?.localeCompare(b.duration || "") || 0;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Resource Hub
          </CardTitle>
          <p className="text-muted-foreground">
            Explore curated mental health resources, guides, and educational content
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="anxiety">Anxiety</option>
                <option value="depression">Depression</option>
                <option value="stress">Stress</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="sleep">Sleep</option>
                <option value="general">General</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="guide">Guides</option>
                <option value="course">Courses</option>
              </select>

              <Button
                variant={showBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBookmarked(!showBookmarked)}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmarked
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredResources.length} resources found
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "views" | "duration")}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="rating">Rating</option>
                <option value="views">Popularity</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="shadow-card hover:shadow-lg transition-smooth group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-full ${getCategoryColor(resource.category)}`}>
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {resource.type.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(resource.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${resource.bookmarked ? 'fill-current text-primary' : ''}`} 
                    />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {resource.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(resource.category)}
                      <span>{resource.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{resource.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{resource.views}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{resource.rating}</span>
                  </div>
                  <div className="flex gap-2">
                    {!resource.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsCompleted(resource.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => {
                        if (resource.url) {
                          window.open(resource.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      {resource.type === "video" ? "Watch" : resource.type === "audio" ? "Listen" : "Read"}
                    </Button>
                  </div>
                </div>

                {resource.completed && (
                  <Badge variant="default" className="w-full justify-center bg-green-100 text-green-700">
                    ✓ Completed
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find relevant resources.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedType("all");
              setShowBookmarked(false);
            }}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Featured Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-wellness" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-primary-light to-wellness-light">
              <h4 className="font-semibold mb-2">Mental Health First Aid</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to provide initial support to someone experiencing a mental health crisis.
              </p>
              <Button size="sm" variant="default" onClick={() => window.open('https://www.mentalhealthfirstaid.org/', '_blank')}>
                <Shield className="mr-2 h-3 w-3" />
                Start Learning
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-wellness-light to-crisis-light">
              <h4 className="font-semibold mb-2">Building Resilience</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Develop mental toughness and bounce back stronger from life's challenges.
              </p>
              <Button size="sm" variant="wellness" onClick={() => window.open('https://www.headspace.com/meditation/stress', '_blank')}>
                <Heart className="mr-2 h-3 w-3" />
                Explore Course
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};