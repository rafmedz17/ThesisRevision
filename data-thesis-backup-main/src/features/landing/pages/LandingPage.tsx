import DepartmentSelector from "../components/DepartmentSelector";
import { useSettingsStore } from '@/stores/settings-store';
import AppHeader from "@/components/shared/AppHeader";

const LandingPage = () => {
  const { systemSettings } = useSettingsStore();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AppHeader />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          
          <h1 className="text-display mb-6 max-w-4xl mx-auto">
            Discover Outstanding Academic Research
          </h1>
        </div>

        {/* Department Selection */}
        <div className="animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-heading mb-3">Select Department</h2>
            <p className="text-muted-foreground">Choose your area of interest to browse relevant research</p>
          </div>
          
          <DepartmentSelector />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-surface/50 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Thesis Archive System. Empowering academic research discovery.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;