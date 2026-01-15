"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Settings,
  User,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Paperclip,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserProfileDropdown } from "@/components/layout/UserProfileDropdown";

interface Project {
  _id: string;
  name: string;
  system_prompt: string;
  model_config: {
    provider: string;
    model: string;
  };
}

interface Message {
  id: string;
  _id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface UploadedSource {
  _id: string;
  fileName: string;
  uploadedAt: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Manual chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedSources, setUploadedSources] = useState<UploadedSource[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{
    fileName: string;
    content: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);

  // Handle source file preview
  const handlePreviewSource = async (sourceId: string) => {
    setIsLoadingPreview(true);
    setPreviewOpen(true);
    try {
      const response = await fetch(`/api/projects/${id}/sources/${sourceId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviewContent({
          fileName: data.source.fileName,
          content: data.source.content,
        });
      } else {
        toast.error("Failed to load file preview");
        setPreviewOpen(false);
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load file preview");
      setPreviewOpen(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle source file delete
  const handleDeleteSource = async (sourceId: string) => {
    setDeletingSourceId(sourceId);
    try {
      const response = await fetch(`/api/projects/${id}/sources/${sourceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUploadedSources((prev) => prev.filter((s) => s._id !== sourceId));
        toast.success("File deleted successfully");
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting source:", error);
      toast.error("Failed to delete file");
    } finally {
      setDeletingSourceId(null);
    }
  };

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      const [projectRes, messagesRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/messages`),
      ]);

      if (projectRes.ok) {
        const data = await projectRes.json();
        setProject(data.project);
      } else {
        router.push("/dashboard");
        return;
      }

      if (messagesRes.ok) {
        const data = await messagesRes.json();
        if (data.messages && Array.isArray(data.messages)) {
          // Ensure each message has a unique ID
          const messagesWithIds = data.messages.map((msg: Message) => ({
            ...msg,
            id: msg.id || msg._id || crypto.randomUUID(),
          }));
          setMessages(messagesWithIds);
        }
      }

      // Fetch uploaded sources
      const sourcesRes = await fetch(`/api/projects/${id}/sources`);
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        if (data.sources && Array.isArray(data.sources)) {
          setUploadedSources(data.sources);
        }
      }
    } catch (error) {
      console.error("Error fetching project/messages:", error);
      router.push("/dashboard");
    } finally {
      setIsLoadingProject(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Clean messages to only include role and content as strings
      const cleanMessages = newMessages.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : String(m.content),
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: cleanMessages,
          projectId: id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      // Initialize assistant message
      const assistantId = crypto.randomUUID();
      let assistantContent = "";
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: assistantContent } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/projects/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Refresh the sources list
      const sourcesRes = await fetch(`/api/projects/${id}/sources`);
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        if (data.sources && Array.isArray(data.sources)) {
          setUploadedSources(data.sources);
        }
      }

      toast.success(
        "File uploaded successfully! Context will be used in chat."
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  if (isLoadingProject) {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="relative z-20 glass-strong sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
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
                <div>
                  <span className="text-foreground font-medium text-sm">
                    {project.name}
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {project.model_config?.model?.includes("/")
                      ? project.model_config.model
                      : "meta-llama/llama-3.3-70b-instruct:free"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5"
                onClick={resetChat}
                disabled={messages.length === 0 && !isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5"
                onClick={() => router.push(`/dashboard/${id}/settings`)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Start a Conversation
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Send a message to begin chatting with your AI assistant. The
                assistant will respond based on your configured system prompt.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex gap-4 mb-6",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar
                    className={cn(
                      "w-8 h-8 shrink-0",
                      message.role === "user"
                        ? "gradient-accent shadow-md shadow-primary/20"
                        : "bg-muted border border-border"
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "bg-transparent",
                        message.role === "user"
                          ? "text-white"
                          : "text-primary"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "group relative max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "gradient-accent text-white shadow-lg shadow-primary/20"
                        : "glass text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "prose prose-sm max-w-none wrap-break-word leading-relaxed",
                        message.role === "user" ? "prose-invert" : "prose-slate"
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                      {!message.content && message.role === "assistant" && (
                        <span className="text-muted-foreground italic">
                          Thinking...
                        </span>
                      )}
                    </div>
                    {message.role === "assistant" && message.content && (
                      <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5 h-8 w-8"
                          onClick={() =>
                            copyToClipboard(message.content, message.id)
                          }
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5 h-8 w-8"
                          title="Regenerate"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Glassmorphism */}
      <div className="relative z-20 glass-strong">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Uploaded Files Display */}
          {uploadedSources.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedSources.map((source) => (
                <div
                  key={source._id}
                  className="group relative inline-flex items-center gap-2 px-3 py-1.5 glass border-border rounded-lg text-xs text-muted-foreground hover:bg-white/80 hover:border-primary/50 transition-all duration-200"
                >
                  <Paperclip className="w-3 h-3 shrink-0" />
                  <span className="max-w-[120px] truncate">
                    {source.fileName}
                  </span>

                  {/* Hover Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1">
                    <button
                      type="button"
                      onClick={() => handlePreviewSource(source._id)}
                      className="p-1 rounded hover:bg-[#1A1A1A]/5 text-muted-foreground hover:text-blue-500 transition-colors"
                      title="Preview file"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSource(source._id)}
                      disabled={deletingSourceId === source._id}
                      className="p-1 rounded hover:bg-[#1A1A1A]/5 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete file"
                    >
                      {deletingSourceId === source._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-[52px] w-[52px] shrink-0 border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </Button>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[52px] max-h-[200px] resize-none bg-white border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary pr-12"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-[52px] w-[52px] shrink-0 gradient-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* File Preview Dialog */}
      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewContent(null);
        }}
      >
        <DialogContent className="glass-strong border-border text-foreground max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Paperclip className="w-4 h-4" />
              {previewContent?.fileName || "File Preview"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preview of the uploaded file content
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-lg bg-muted border border-border p-4 mt-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : previewContent?.content ? (
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {previewContent.content}
              </pre>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No content available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
