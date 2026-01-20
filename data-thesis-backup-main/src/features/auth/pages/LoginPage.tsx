import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { LoginForm } from '../components/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { systemSettings } = useSettingsStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {systemSettings.schoolLogo ? (
              <img 
                src={systemSettings.schoolLogo} 
                alt="Logo" 
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M22 10v6M18 6v12M14 8v8M10 4v16M6 6v12M2 10v6" />
                </svg>
              </div>
            )}
            <div className="text-left">
              <h1 className="text-2xl font-bold">{systemSettings.schoolName} Admin Portal</h1>
              <p className="text-sm text-muted-foreground">{systemSettings.schoolName} Repository</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Admin Login</h2>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Academic Research Repository System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
