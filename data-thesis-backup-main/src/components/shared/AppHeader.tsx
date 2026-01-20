import { useState } from 'react';
import { Library, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { LoginModal } from "./LoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AppHeader = () => {
  const navigate = useNavigate();
  const { systemSettings } = useSettingsStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50"
        style={
          systemSettings.headerBackground && typeof systemSettings.headerBackground === 'string'
            ? systemSettings.headerBackground.startsWith('http')
              ? {
                  backgroundImage: `url(${systemSettings.headerBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor: typeof systemSettings.headerBackground === 'string' && (systemSettings.headerBackground.startsWith('#') || systemSettings.headerBackground.startsWith('rgb') || systemSettings.headerBackground.startsWith('rgba') || systemSettings.headerBackground.startsWith('hsl') || systemSettings.headerBackground.startsWith('hsla'))
                    ? systemSettings.headerBackground
                    : undefined,
                  backgroundImage: typeof systemSettings.headerBackground === 'string' && (systemSettings.headerBackground.startsWith('linear-gradient') || systemSettings.headerBackground.startsWith('radial-gradient'))
                    ? systemSettings.headerBackground
                    : undefined
                }
            : undefined
        }
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {systemSettings.schoolLogo ? (
                <img
                  src={systemSettings.schoolLogo}
                  alt={systemSettings.schoolName}
                  className="h-11 w-11 object-contain rounded-full"
                />
              ) : (
                <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                  <Library className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold">
                  {systemSettings.schoolName}
                </h1>
                <p className="text-sm ">
                  Academic Research Repository
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted/50"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/about")}
                className="hover:bg-muted/50"
              >
                About
              </Button>
              {isAuthenticated && user?.role === 'student' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/personal-settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Personal Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setLoginModalOpen(true)}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
};

export default AppHeader;
