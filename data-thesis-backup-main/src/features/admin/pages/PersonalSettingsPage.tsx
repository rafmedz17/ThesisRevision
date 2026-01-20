import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { PersonalSettings } from '../components/PersonalSettings';
import { cn } from '@/lib/utils';

const PersonalSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { systemSettings } = useSettingsStore();

  const isStudent = user?.role === 'student';
  const pageTitle = isStudent ? 'Personal Settings' : `${systemSettings.schoolName} Admin Dashboard`;
  const backPath = isStudent ? '/' : '/admin';
  const displayName = user?.username;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60",
          systemSettings.headerBackground 
            ? 'bg-background/80' 
            : 'bg-background/95'
        )}
        style={
          systemSettings.headerBackground 
            ? systemSettings.headerBackground.startsWith('http') 
              ? {
                  backgroundImage: `url(${systemSettings.headerBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundColor: systemSettings.headerBackground,
                }
            : {
                backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))', // Default subtle gradient
              }
        }
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {systemSettings.schoolLogo ? (
              <img 
                src={systemSettings.schoolLogo} 
                alt="Logo" 
                className="h-10 w-10 object-contain rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <GraduationCap className="h-6 w-6" />
            )}
            <div>
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
              <p className="text-xs">Academic Research Repository</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 max-w-4xl">
        <PersonalSettings />
      </main>
    </div>
  );
};

export default PersonalSettingsPage;
