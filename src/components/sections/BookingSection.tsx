import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Video, MessageSquare, CheckCircle } from "lucide-react";
import { useEffect } from "react";

const BookingSection = () => {
  // Load Calendly widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCalendly = () => {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/thatsdanish02'
      });
    } else {
      // Fallback: open in new window
      window.open('https://calendly.com/thatsdanish02', '_blank');
    }
  };

  const benefits = [
    "Professional licensed counsellors",
    "Secure & confidential sessions",
    "Flexible scheduling options", 
    "Evidence-based therapy approaches",
    "Crisis support available 24/7"
  ];

  const sessionTypes = [
    {
      icon: Video,
      title: "Video Sessions",
      description: "Face-to-face therapy from the comfort of your home",
      duration: "50 minutes"
    },
    {
      icon: MessageSquare,
      title: "Chat Therapy",
      description: "Text-based counselling for continuous support",
      duration: "Ongoing"
    },
    {
      icon: Calendar,
      title: "Group Sessions",
      description: "Connect with others in guided support groups",
      duration: "60 minutes"
    }
  ];

  return (
    <section id="booking" className="py-16 bg-gradient-wellness">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Book Your Counselling Session
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Take the next step in your mental wellness journey. Connect with professional 
            counsellors who understand and are here to support you.
          </p>
        </div>

        {/* Session Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {sessionTypes.map((session, index) => (
            <Card key={index} className="shadow-card hover:shadow-lg transition-smooth">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-wellness-light">
                  <session.icon className="h-8 w-8 text-wellness" />
                </div>
                <CardTitle className="text-xl">{session.title}</CardTitle>
                <CardDescription>{session.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Booking Card */}
        <Card className="max-w-4xl mx-auto shadow-card">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Benefits List */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">
                  Why Choose Our Counselling Services?
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-wellness flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary-light/20 border border-primary-light rounded-lg p-4">
                  <p className="text-sm text-center font-medium">
                    🌟 First session is <span className="text-primary font-semibold">completely free</span> - 
                    no commitment required
                  </p>
                </div>
              </div>

              {/* Booking CTA */}
              <div className="text-center space-y-6">
                <div className="p-6 rounded-lg bg-gradient-primary text-white">
                  <h4 className="text-xl font-semibold mb-2">Ready to Start?</h4>
                  <p className="text-primary-foreground/90 mb-4">
                    Book your consultation session today and take the first step towards better mental health.
                  </p>
                  <Button 
                    onClick={openCalendly}
                    variant="secondary" 
                    size="lg"
                    className="w-full bg-white text-primary hover:bg-white/90"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Your Session
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Available Monday - Sunday</p>
                  <p>Response within 24 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="max-w-2xl mx-auto mt-8 border-crisis-light">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold text-crisis mb-2">Need Immediate Support?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you're experiencing a mental health crisis, don't wait for an appointment
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="crisis" size="sm">
                Crisis Hotline: 988
              </Button>
              <Button variant="outline" size="sm">
                Emergency: 911
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BookingSection;