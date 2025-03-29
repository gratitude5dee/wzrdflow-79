
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Credits from "./pages/Credits";
import ProjectSetup from "./pages/ProjectSetup";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Adding viewMode state to the App component
  const [viewMode, setViewMode] = useState<'studio' | 'storyboard' | 'editor'>('storyboard');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/project-setup" element={
                <ProtectedRoute>
                  <ProjectSetup />
                </ProtectedRoute>
              } />
              <Route path="/editor" element={
                <ProtectedRoute>
                  <Index viewMode="editor" />
                </ProtectedRoute>
              } />
              <Route path="/editor/:projectId" element={
                <ProtectedRoute>
                  <Index viewMode="editor" />
                </ProtectedRoute>
              } />
              <Route path="/shot-editor" element={
                <ProtectedRoute>
                  <Index viewMode="editor" />
                </ProtectedRoute>
              } />
              <Route path="/credits" element={
                <ProtectedRoute>
                  <Credits />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
