import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/api";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/shared/AdminProtectedRoute";
import { useSettingsStore } from "@/stores/settings-store";

// Pages
import LandingPage from "@/features/landing/pages/LandingPage";
import CollegeDashboard from "@/features/thesis/pages/CollegeDashboard";
import SeniorHighDashboard from "@/features/thesis/pages/SeniorHighDashboard";
import StudentSubmissionsPage from "@/features/thesis/pages/StudentSubmissionsPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import PersonalSettingsPage from "@/features/admin/pages/PersonalSettingsPage";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const App = () => {
  const { fetchSystemSettings, fetchPrograms } = useSettingsStore();

  // Fetch system settings and programs on app initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch system settings (logo, colors, school name, etc.)
        await fetchSystemSettings();
        // Fetch programs
        await fetchPrograms();
      } catch (error) {
        console.error('Failed to initialize app settings:', error);
        // App continues to work with default/cached settings
      }
    };

    initializeApp();
  }, [fetchSystemSettings, fetchPrograms]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/college" element={<CollegeDashboard />} />
            <Route path="/senior-high" element={<SeniorHighDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/personal-settings"
              element={
                <ProtectedRoute>
                  <PersonalSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <ProtectedRoute>
                  <StudentSubmissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminProtectedRoute>
                  <PersonalSettingsPage />
                </AdminProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
