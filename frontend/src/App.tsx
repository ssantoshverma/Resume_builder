import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import ATSScore from "./pages/ATSScore";
import Settings from "./pages/Settings";
import CareerInsights from "./pages/CareerInsights";
import SkillsGap from "./pages/SkillsGap";
import GrowthPath from "./pages/GrowthPathCard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ColdEmail from "./pages/coldEmail";
import GrowthPlanner from "./pages/GrowthPlanner";
import Progress from "./pages/Progress";
import RoadmapDetails from "./pages/RoadmapDetails";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to appropriate page */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
              } 
            />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-builder" 
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ats-score" 
              element={
                <ProtectedRoute>
                  <ATSScore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cold-email" 
              element={
                <ProtectedRoute>
                  <ColdEmail/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/career-insights" 
              element={
                <ProtectedRoute>
                  <CareerInsights/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/growth-planner" 
              element={
                <ProtectedRoute>
                 <GrowthPlanner/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                 <Progress/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roadmap-details/:id" 
              element={
                <ProtectedRoute>
                 <RoadmapDetails/>
                </ProtectedRoute>
              } 
            />
            
            {/* Career Insights Routes */}
            {/* <Route 
              path="/career-insights/*" 
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<Navigate to="skills-gap" replace />} />
                    <Route path="skills-gap" element={<SkillsGap />} />
                    <Route path="growth-path" element={<GrowthPath />} />
                  </Routes>
                </ProtectedRoute>
              } 
            /> */}
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;