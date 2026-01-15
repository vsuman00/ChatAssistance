"use client";

import { useState, useEffect, useCallback, use } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  _id: string;
  name: string;
  system_prompt: string;
  model_config: {
    provider: string;
    model: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    system_prompt: "",
    model: "meta-llama/llama-3.3-70b-instruct:free",
  });

  const availableModels = [
    {
      value: "meta-llama/llama-3.3-70b-instruct:free",
      label: "Llama 3.3 70B (Free)",
    },
    {
      value: "google/gemini-2.0-flash-exp:free",
      label: "Gemini 2.0 Flash (Free)",
    },
    { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Free)" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Paid)" },
    { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku (Paid)" },
  ];

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setFormData({
          name: data.project.name,
          system_prompt: data.project.system_prompt,
          model:
            data.project.model_config?.model ||
            "meta-llama/llama-3.3-70b-instruct:free",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          system_prompt: formData.system_prompt,
          model_config: {
            provider: "openrouter",
            model: formData.model,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="relative z-10 glass-strong sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6 bg-[#E5E7EB]" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-md shadow-primary/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-foreground font-medium">
                  {project.name}
                </span>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/chat/${id}`)}
              className="gradient-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Project Settings
            </h1>
            <p className="text-muted-foreground">Configure your AI chatbot agent</p>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-foreground">General Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your project name and AI configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="My Chatbot"
                  className="bg-white border-border text-foreground focus:border-primary focus:ring-primary"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt" className="text-foreground">
                  System Prompt
                </Label>
                <p className="text-sm text-muted-foreground">
                  This prompt defines the AI&apos;s personality and behavior.
                </p>
                <Textarea
                  id="system_prompt"
                  placeholder="You are a helpful AI assistant..."
                  className="bg-white border-border text-foreground min-h-[200px] font-mono text-sm focus:border-primary focus:ring-primary"
                  value={formData.system_prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, system_prompt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-foreground">
                  AI Model
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select the AI model to power your assistant.
                </p>
                <select
                  id="model"
                  className="w-full h-10 rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                >
                  {availableModels.map((model) => (
                    <option
                      key={model.value}
                      value={model.value}
                      className="bg-white text-foreground"
                    >
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                  className="gradient-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription className="text-red-500/70">
                Irreversible actions for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Delete Project</p>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your project and all its data.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
