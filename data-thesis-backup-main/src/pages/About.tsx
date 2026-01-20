import { useSettingsStore } from "@/stores/settings-store";
import AppHeader from "@/components/shared/AppHeader";

const About = () => {
  const { systemSettings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="bg-background rounded-xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">About Our Thesis Archive</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              {systemSettings.aboutContent}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-surface/50 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 {systemSettings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;