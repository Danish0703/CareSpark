import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Brain, Users, TrendingUp, Award, ArrowRight, Calendar } from "lucide-react";
import BookingSection from "@/components/sections/BookingSection";

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-light/50 border border-primary-light">
                <span className="text-sm font-medium text-primary">✨ AI-Powered Mental Health Platform</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Let's get through this
                <span className="block text-primary">together!</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl text-balance">
                Your mental wellness journey starts here. Get personalized AI assessments, 
                connect with professional counsellors, and access 24/7 support resources.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/user-auth">
                    <Heart className="mr-2 h-5 w-5" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <a href="#booking">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Consultation
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>24/7 Crisis Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>100% Confidential</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-wellness p-8 shadow-card">
                <div className="w-full h-full rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Brain className="h-20 w-20 text-white mx-auto opacity-90" />
                    <div className="space-y-2">
                      <div className="h-2 w-20 bg-white/30 rounded mx-auto"></div>
                      <div className="h-2 w-16 bg-white/20 rounded mx-auto"></div>
                      <div className="h-2 w-12 bg-white/10 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full shadow-lg animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-wellness rounded-full shadow-lg animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What we offer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive mental health support powered by AI and human expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-card hover:shadow-lg transition-smooth">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary-light">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Smart Assessment</CardTitle>
              <CardDescription>
                AI-powered mental health assessment tool that analyzes various factors 
                to offer comprehensive understanding of your current mental condition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-lg transition-smooth">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-wellness-light">
                <Heart className="h-8 w-8 text-wellness" />
              </div>
              <CardTitle>Counselling Sessions</CardTitle>
              <CardDescription>
                Accessible online counseling sessions with flexible scheduling. 
                Connect with licensed professionals worldwide for immediate support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-lg transition-smooth">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-crisis-light">
                <Shield className="h-8 w-8 text-crisis" />
              </div>
              <CardTitle>AI-Wellness Buddy</CardTitle>
              <CardDescription>
                Your personal AI companion providing 24/7 emotional support, 
                mindfulness exercises, and wellness tracking.
              </CardDescription>
            </CardHeader>
          </Card>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <BookingSection />

      {/* How it Works */}
      <section id="how-it-works" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start your mental wellness journey
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center space-y-6 group">
              <div className="relative">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -right-4 -top-2 w-8 h-8 bg-primary-light rounded-full opacity-50 animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold">Take Assessment</h3>
              <p className="text-muted-foreground">
                Complete our confidential AI-powered mental health assessment to understand your current state
              </p>
            </div>
            
            <div className="text-center space-y-6 group">
              <div className="relative">
                <div className="mx-auto w-16 h-16 rounded-full bg-wellness text-wellness-foreground flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute -right-4 -top-2 w-8 h-8 bg-wellness-light rounded-full opacity-50 animate-pulse delay-200"></div>
              </div>
              <h3 className="text-xl font-semibold">Get Personalized Plan</h3>
              <p className="text-muted-foreground">
                Receive tailored wellness resources, activities, and counsellor recommendations based on your needs
              </p>
            </div>
            
            <div className="text-center space-y-6 group">
              <div className="relative">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary-glow text-primary flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute -right-4 -top-2 w-8 h-8 bg-primary-light rounded-full opacity-50 animate-pulse delay-500"></div>
              </div>
              <h3 className="text-xl font-semibold">Ongoing Support</h3>
              <p className="text-muted-foreground">
                Track your progress, join peer support groups, and access professional counselling when needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <Card className="shadow-card border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80 font-medium">Crisis Support</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-white mb-2">AI</div>
                  <div className="text-white/80 font-medium">Powered Assessment</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/80 font-medium">Confidential</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-white mb-2">Free</div>
                  <div className="text-white/80 font-medium">To Use</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Admin Features */}
      <section id="about" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="shadow-card max-w-6xl mx-auto">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl lg:text-4xl mb-4">For Healthcare Administrators</CardTitle>
              <CardDescription className="text-xl max-w-3xl mx-auto">
                Comprehensive dashboard with advanced analytics, real-time monitoring, and crisis management tools
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-3">Data Analytics</h4>
                  <p className="text-muted-foreground">
                    Real-time insights into user wellbeing trends, system usage patterns, and outcome measurements
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <Users className="h-12 w-12 text-wellness mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-3">User Management</h4>
                  <p className="text-muted-foreground">
                    Monitor user progress, track engagement metrics, and identify individuals requiring additional support
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <Award className="h-12 w-12 text-crisis mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-3">Crisis Alerts</h4>
                  <p className="text-muted-foreground">
                    Automated SMS alerts for high-risk assessments and emergency situations with escalation protocols
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link to="/admin-auth">
                    Access Admin Portal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Index;
