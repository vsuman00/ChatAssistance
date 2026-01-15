"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { User, LogOut, Coins, Loader2 } from "lucide-react";

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
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0 hover:bg-white/10"
          >
            <Avatar className="h-9 w-9 bg-gradient-to-br from-purple-500 to-blue-500">
              <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-slate-900 border-white/20"
        >
          <div className="flex items-center gap-3 p-3">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500">
              <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-gray-300 focus:text-white focus:bg-white/10 cursor-pointer"
            onClick={() => setIsProfileOpen(true)}
          >
            <User className="w-4 h-4 mr-2" />
            Profile Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-gray-300 focus:text-white focus:bg-white/10 cursor-pointer"
            onClick={() => setIsProfileOpen(true)}
          >
            <Coins className="w-4 h-4 mr-2" />
            <span className="flex-1">Token Usage</span>
            <span className="text-xs text-purple-400">
              {formatTokens(user.totalTokensUsed)}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Details Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Your account information and usage statistics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500">
                <AvatarFallback className="bg-transparent text-white text-xl font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Token Usage Section */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400" />
                Token Usage (Paid Models)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatTokens(user.totalTokensUsed)}
                  </p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {formatTokens(user.promptTokensUsed)}
                  </p>
                  <p className="text-xs text-gray-400">Prompt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {formatTokens(user.completionTokensUsed)}
                  </p>
                  <p className="text-xs text-gray-400">Completion</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Token usage is only tracked for paid AI models
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
