import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import UserAuth from "./pages/UserAuth";
import AdminAuth from "./pages/AdminAuth";
import CounselorAuth from "./pages/CounselorAuth";
import GeneralAuth from "./pages/GeneralAuth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import Activities from "./pages/Activities";
import Resources from "./pages/Resources";
import PeerSupport from "./pages/PeerSupport";
import Assessment from "./pages/Assessment";
import AdminUsers from "./pages/AdminUsers";
import AdminMonitor from "./pages/AdminMonitor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<GeneralAuth />} />
                <Route path="/user-auth" element={<UserAuth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/counselor-auth" element={<CounselorAuth />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/counselor-dashboard" element={<CounselorDashboard />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/peer-support" element={<PeerSupport />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/admin-users" element={<AdminUsers />} />
                <Route path="/admin-monitor" element={<AdminMonitor />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
