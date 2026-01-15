"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, LogOut, Coins, Loader2, Moon, Sun } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  totalTokensUsed: number;
  promptTokensUsed: number;
  completionTokensUsed: number;
}

export function UserProfileDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setMounted(true);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatTokens = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(2)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full glass flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0 hover:bg-muted"
            >
              <Avatar className="h-9 w-9 gradient-accent shadow-md shadow-primary/20">
                <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 glass-strong border-border"
          >
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10 gradient-accent shadow-md shadow-primary/20">
                <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-muted-foreground focus:text-foreground focus:bg-muted cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <Coins className="w-4 h-4 mr-2" />
              <span className="flex-1">Token Usage</span>
              <span className="text-xs text-primary font-medium">
                {formatTokens(user.totalTokensUsed)}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Details Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="glass-strong border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5" />
              Profile Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your account information and usage statistics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 gradient-accent shadow-lg shadow-primary/20">
                <AvatarFallback className="bg-transparent text-white text-xl font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Token Usage Section */}
            <div className="rounded-xl glass p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                Token Usage (Paid Models)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {formatTokens(user.totalTokensUsed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {formatTokens(user.promptTokensUsed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Prompt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-500">
                    {formatTokens(user.completionTokensUsed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Token usage is only tracked for paid AI models
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
