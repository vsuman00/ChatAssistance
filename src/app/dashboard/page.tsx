"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  MoreVertical,
  Loader2,
  Sparkles,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfileDropdown } from "@/components/layout/UserProfileDropdown";

interface Project {
  _id: string;
  name: string;
  system_prompt: string;
  model_config: {
    provider: string;
    model: string;
  };
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    system_prompt: "You are a helpful AI assistant.",
  });

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setNewProject({
          name: "",
          system_prompt: "You are a helpful AI assistant.",
        });
        setIsDialogOpen(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="relative z-10 glass-strong sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                AI Chatbot Platform
              </h1>
            </div>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Your Projects
            </h2>
            <p className="text-muted-foreground">
              Create and manage your AI chatbot agents
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create New Project
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Set up a new AI chatbot with a custom system prompt.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Project Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Customer Support Bot"
                    className="bg-white border-border text-foreground focus:border-primary focus:ring-primary"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system_prompt" className="text-foreground">
                    System Prompt
                  </Label>
                  <Textarea
                    id="system_prompt"
                    placeholder="You are a helpful AI assistant..."
                    className="bg-white border-border text-foreground min-h-[120px] focus:border-primary focus:ring-primary"
                    value={newProject.system_prompt}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        system_prompt: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating || !newProject.name.trim()}
                  className="gradient-accent text-white"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
              <Bot className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI chatbot project to get started.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gradient-accent text-white shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass hover:glass-strong hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 gradient-accent shadow-md shadow-primary/20">
                          <AvatarFallback className="bg-transparent text-white text-sm font-semibold">
                            {project.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-foreground text-lg">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground text-sm">
                            {project.model_config?.model?.includes("/")
                              ? project.model_config.model
                              : "meta-llama/llama-3.3-70b-instruct:free"}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="glass-strong border-border"
                        >
                          <DropdownMenuItem
                            className="text-muted-foreground focus:text-foreground focus:bg-[#1A1A1A]/5 cursor-pointer"
                            onClick={() => router.push(`/chat/${project._id}`)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Open Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-muted-foreground focus:text-foreground focus:bg-[#1A1A1A]/5 cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/${project._id}/settings`)
                            }
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteProject(project._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {project.system_prompt}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gradient-accent text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                          onClick={() => router.push(`/chat/${project._id}`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="border-border text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5"
                          onClick={() =>
                            router.push(`/dashboard/${project._id}/settings`)
                          }
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
