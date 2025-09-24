import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  Download, 
  ExternalLink,
  Heart,
  Brain,
  Shield,
  Headphones
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "audio" | "guide";
  category: "anxiety" | "depression" | "stress" | "general";
  url?: string;
  duration?: string;
}

export const ResourceHub = () => {
  const [resources] = useState<Resource[]>([
    {
      id: "1",
      title: "Understanding Anxiety: A Complete Guide",
      description: "Learn about anxiety disorders, symptoms, and coping strategies from mental health professionals.",
      type: "article",
      category: "anxiety",
      duration: "10 min read"
    },
    {
      id: "2", 
      title: "Mindfulness Meditation for Beginners",
      description: "Guided meditation session to help you start your mindfulness journey.",
      type: "audio",
      category: "stress",
      duration: "15 min"
    },
    {
      id: "3",
      title: "Managing Depression: Daily Strategies",
      description: "Practical techniques and habits to help manage depression symptoms.",
      type: "video", 
      category: "depression",
      duration: "8 min"
    },
    {
      id: "4",
      title: "Crisis Prevention Workbook",
      description: "Downloadable workbook with exercises for crisis prevention and management.", 
      type: "guide",
      category: "general",
      duration: "PDF"
    },
    {
      id: "5",
      title: "Sleep Hygiene for Mental Health",
      description: "How good sleep habits can improve your mental wellbeing.",
      type: "article",
      category: "general", 
      duration: "7 min read"
    },
    {
      id: "6",
      title: "Breathing Exercises for Panic Attacks",
      description: "Quick breathing techniques to help during moments of panic or high anxiety.",
      type: "audio",
      category: "anxiety",
      duration: "5 min"
    }
  ]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="h-5 w-5" />;
      case "video":
        return <Play className="h-5 w-5" />;
      case "audio":
        return <Headphones className="h-5 w-5" />;
      case "guide":
        return <Download className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "anxiety":
        return <Brain className="h-4 w-4" />;
      case "depression":
        return <Heart className="h-4 w-4" />;
      case "stress":
        return <Shield className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  const filterResourcesByCategory = (category: string) => {
    if (category === "all") return resources;
    return resources.filter(resource => resource.category === category);
  };

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="anxiety">Anxiety</TabsTrigger>
          <TabsTrigger value="depression">Depression</TabsTrigger>
          <TabsTrigger value="stress">Stress</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {["all", "anxiety", "depression", "stress", "general"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterResourcesByCategory(category).map((resource) => (
                <Card key={resource.id} className="shadow-card hover:shadow-lg transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-full ${getCategoryColor(resource.category)}`}>
                        {getResourceIcon(resource.type)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getCategoryIcon(resource.category)}
                        <span>{resource.category}</span>
                        {resource.duration && (
                          <>
                            <span>•</span>
                            <span>{resource.duration}</span>
                          </>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        {resource.type === "guide" ? (
                          <>
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Featured Resources Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-wellness" />
            Featured This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-primary-light to-wellness-light">
              <h4 className="font-semibold mb-2">Crisis Prevention Toolkit</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Essential resources for recognizing warning signs and preventing mental health crises.
              </p>
              <Button size="sm" variant="default">
                <Shield className="mr-2 h-3 w-3" />
                Access Toolkit
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-wellness-light to-primary-light">
              <h4 className="font-semibold mb-2">Weekly Wellness Challenge</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Join our community challenge focusing on daily gratitude practices.
              </p>
              <Button size="sm" variant="wellness">
                <Heart className="mr-2 h-3 w-3" />
                Join Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};