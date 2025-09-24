import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Shield, Stethoscope } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuthFormProps {
  userType?: "user" | "admin" | "counselor";
}

export const AuthForm = ({ userType }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(userType || "user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    instituteName: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // If Institutional signup, require instituteName
    if ((userType || selectedRole) === "admin" && !formData.instituteName.trim()) {
      toast({
        title: "Missing institute name",
        description: "Please enter your institute name to sign up as an institutional account.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            role: selectedRole,
            ...(selectedRole === "admin" && { institute_name: formData.instituteName }),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created successfully",
          description: "Welcome to your mental wellness journey!",
        });

        navigate(selectedRole === "admin" ? "/admin" : selectedRole === "counselor" ? "/counselor-dashboard" : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation: if Institutional Login selected, ensure instituteName is provided
      if ((userType || selectedRole) === "admin" && !formData.instituteName.trim()) {
        toast({
          title: "Missing institute name",
          description: "Please enter your institute name for Institutional Login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Include instituteName in a backend record for login attempts when Institutional Login selected
      if ((userType || selectedRole) === "admin") {
        try {
          await supabase.from("login_attempts").insert({
            email: formData.email,
            institute_name: formData.instituteName,
            role: "admin",
            attempted_at: new Date(),
          });
        } catch (err) {
          // non-fatal: continue with sign-in even if storing attempt fails
          console.warn("Failed to log institute login attempt", err);
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Check user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        const targetRole = userType || selectedRole;
        
        // If userType is specified or role is selected, check role match
        if (targetRole && profile?.role !== targetRole) {
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: `This account is registered as ${profile?.role}. Please use the correct portal or select the right role.`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        navigate(profile?.role === "admin" ? "/admin" : profile?.role === "counselor" ? "/counselor-dashboard" : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary-light">
            {userType === "admin" ? (
              <Shield className="h-8 w-8 text-primary" />
            ) : userType === "counselor" ? (
              <Stethoscope className="h-8 w-8 text-primary" />
            ) : (
              <Heart className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-balance">
            {userType === "admin" ? "Admin Portal" : userType === "counselor" ? "Counselor Portal" : "CareSpark Hub"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {userType === "admin"
              ? "Access your administrative dashboard"
              : userType === "counselor"
              ? "Connect with clients and manage your practice"
              : "Your journey to better mental health starts here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {!userType && (
                  <div className="space-y-2">
                    <Label htmlFor="signin-role">Sign in as</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User - Access wellness resources</SelectItem>
                        <SelectItem value="counselor">Counselor - Manage sessions & clients</SelectItem>
                        <SelectItem value="admin">Institutional Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* When Institutional Login selected, show Institute Name field */}
                {(userType || selectedRole) === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      type="text"
                      placeholder="Enter your institute name"
                      value={formData.instituteName}
                      onChange={handleInputChange}
                      required={(userType || selectedRole) === "admin"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant={
                    (userType || selectedRole) === "admin" ? "default" : 
                    (userType || selectedRole) === "counselor" ? "calm" : "wellness"
                  }
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In as {(userType || selectedRole) === "admin" ? "Admin" : 
                            (userType || selectedRole) === "counselor" ? "Counselor" : "User"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {!userType && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User - Seeking mental wellness support</SelectItem>
                        <SelectItem value="counselor">Counselor - Licensed mental health professional</SelectItem>
                        <SelectItem value="admin">Institutional Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* When Institutional Login selected during signup, show Institute Name field */}
                {(userType || selectedRole) === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      type="text"
                      placeholder="Enter your institute name"
                      value={formData.instituteName}
                      onChange={handleInputChange}
                      required={(userType || selectedRole) === "admin"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant={selectedRole === "admin" ? "default" : selectedRole === "counselor" ? "calm" : "wellness"}
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};