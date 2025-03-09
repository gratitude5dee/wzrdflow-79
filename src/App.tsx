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
import VideoEditor from "./pages/VideoEditor";
import ShotEditor from "./pages/ShotEditor";
import Storyboard from "./pages/Storyboard";
import SharedVideo from "./pages/SharedVideo";
import { useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [viewMode, setViewMode] = useState<'studio' | 'storyboard' | 'editor'>('storyboard');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/editor/:projectId?" element={<ProtectedRoute><VideoEditor /></ProtectedRoute>} />
              <Route path="/shot-editor" element={<ProtectedRoute><ShotEditor /></ProtectedRoute>} />
              <Route path="/storyboard" element={<ProtectedRoute><Storyboard /></ProtectedRoute>} />
              <Route path="/shared/:shareId" element={<SharedVideo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
