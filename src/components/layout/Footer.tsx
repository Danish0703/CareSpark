import { Link } from "react-router-dom";
import {
  Brain,
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary-light">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary">
                Care<span className="text-wellness">Spark</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering your mental wellness journey with AI-powered
              assessments, personalized resources, and professional support.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <div className="space-y-2">
              <a
                href="#assessment"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                AI Mental Health Assessment
              </a>
              <a
                href="#counselling"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Online Counselling Sessions
              </a>
              <a
                href="#resources"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Wellness Resources
              </a>
              <a
                href="#crisis"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Crisis Support
              </a>
              <a
                href="#peer"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Peer Support Groups
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <div className="space-y-2">
              <a
                href="#blog"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Mental Health Blog
              </a>
              <a
                href="#guides"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Self-Help Guides
              </a>
              <a
                href="#faq"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                FAQ
              </a>
              <a
                href="#privacy"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@caresark.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>24/7 Crisis Hotline</span>
              </div>
            </div>
            <div className="bg-crisis-light/20 border border-crisis-light rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-crisis" />
                <span className="text-sm font-medium text-crisis">
                  Crisis Support
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                If you're in crisis, immediate help is available
              </p>
              <Button variant="crisis" size="sm" className="w-full">
                Get Immediate Help
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 CareSpark. All rights reserved. Your privacy and wellbeing
              are our priority.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/admin-auth"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                Admin Portal
              </Link>
              <a
                href="#accessibility"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                Accessibility
              </a>
              <a
                href="#cookies"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
