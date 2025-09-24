import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Headphones, Lightbulb, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const resources = {
  articles: [
    {
      id: "art1",
      title: "Mindfulness for Beginners",
      description: "A guide to starting your mindfulness practice.",
      link: "/resources/articles/mindfulness-beginners",
      icon: <BookOpen className="h-5 w-5 text-primary" />,
    },
    {
      id: "art2",
      title: "Coping with Anxiety",
      description: "Practical strategies to manage daily anxiety.",
      link: "/resources/articles/coping-anxiety",
      icon: <BookOpen className="h-5 w-5 text-primary" />,
    },
  ],
  videos: [
    {
      id: "vid1",
      title: "5-Minute Stress Relief",
      description: "A short video with simple exercises to relieve stress.",
      link: "/resources/videos/stress-relief",
      icon: <Video className="h-5 w-5 text-red-500" />,
    },
    {
      id: "vid2",
      title: "Understanding Depression",
      description: "An educational video explaining the signs of depression.",
      link: "/resources/videos/understanding-depression",
      icon: <Video className="h-5 w-5 text-red-500" />,
    },
  ],
  podcasts: [
    {
      id: "pod1",
      title: "The Daily Dose of Calm",
      description:
        "A short podcast episode on staying calm in a chaotic world.",
      link: "/resources/podcasts/daily-calm",
      icon: <Headphones className="h-5 w-5 text-purple-500" />,
    },
    {
      id: "pod2",
      title: "Navigating Your Emotions",
      description: "An episode on identifying and managing your feelings.",
      link: "/resources/podcasts/navigating-emotions",
      icon: <Headphones className="h-5 w-5 text-purple-500" />,
    },
  ],
  games: [
    {
      id: "game1",
      title: "Mindful Maze",
      description: "A simple game to practice focus and concentration.",
      link: "/resources/games/mindful-maze",
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: "game2",
      title: "Mood Tracker",
      description: "An interactive tool to log and understand your daily mood.",
      link: "/resources/games/mood-tracker",
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    },
  ],
};

export const EnhancedResourceHub = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Mental Wellness Resources
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Explore articles, videos, and tools to support your mental health
            journey.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          <TabsTrigger value="games">Games & Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.articles.map((resource) => (
              <Card
                key={resource.id}
                className="shadow-card hover-scale transition-smooth"
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    <Button variant="link" size="sm" asChild>
                      <RouterLink to={resource.link}>
                        <Link className="h-4 w-4 mr-1" />
                        View Resource
                      </RouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.videos.map((resource) => (
              <Card
                key={resource.id}
                className="shadow-card hover-scale transition-smooth"
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-red-500/10">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    <Button variant="link" size="sm" asChild>
                      <RouterLink to={resource.link}>
                        <Link className="h-4 w-4 mr-1" />
                        View Resource
                      </RouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="podcasts">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.podcasts.map((resource) => (
              <Card
                key={resource.id}
                className="shadow-card hover-scale transition-smooth"
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    <Button variant="link" size="sm" asChild>
                      <RouterLink to={resource.link}>
                        <Link className="h-4 w-4 mr-1" />
                        View Resource
                      </RouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="games">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.games.map((resource) => (
              <Card
                key={resource.id}
                className="shadow-card hover-scale transition-smooth"
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    <Button variant="link" size="sm" asChild>
                      <RouterLink to={resource.link}>
                        <Link className="h-4 w-4 mr-1" />
                        Play Game
                      </RouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
