import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgramManagement } from './ProgramManagement';
import { GeneralSettings } from './GeneralSettings';
import { UserManagement } from './UserManagement';
import { WrenchIcon, User, SettingsIcon} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export const SystemSettings = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="programs">
            <span className="flex items-center gap-x-1">
            <WrenchIcon className="h-4 w-4" />Programs
            </span>
            </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users">
              <span className="flex items-center gap-x-1">
              <User className="h-4 w-4" />User Management
              </span>
            </TabsTrigger>
          )}
          <TabsTrigger value="general">
            <span className="flex items-center gap-x-1">
            <SettingsIcon className="h-4 w-4" />Content Settings
            </span>
          </TabsTrigger>

        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <ProgramManagement />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        )}

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
