"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/layout/UserProfileDropdown";
import {
  Sparkles,
  MessageSquare,
  Zap,
  Shield,
  ArrowRight,
  Bot,
  Settings,
  Users,
  LayoutDashboard,
} from "lucide-react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user has a token cookie
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation - Glassmorphism */}
      <nav className="relative z-10 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                ChatDalta
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button className="gradient-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <UserProfileDropdown />
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="gradient-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-[0.5px] border-border mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Powered by GPT-4o and Advanced AI
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Build Custom{" "}
            <span className="text-gradient-accent">AI Chatbots</span>
            <br />
            in Minutes
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create intelligent conversational agents with personalized
            personalities. Define custom system prompts and deploy your own AI
            assistants instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gradient-accent text-white text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <LayoutDashboard className="mr-2 w-5 h-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gradient-accent text-white text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  >
                    Start Building Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:bg-[#1A1A1A]/5 text-lg px-8 py-6"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform for building, managing, and deploying AI
            chatbots
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: "Custom AI Agents",
              description:
                "Create multiple AI agents with unique personalities and behaviors using custom system prompts.",
            },
            {
              icon: MessageSquare,
              title: "Real-time Streaming",
              description:
                "Experience fast, streaming responses with a beautiful typewriter effect as your AI thinks.",
            },
            {
              icon: Settings,
              title: "Easy Configuration",
              description:
                "Simple dashboard to manage your projects, update prompts, and configure AI settings.",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description:
                "Optimized for speed with sub-second response times and instant streaming.",
            },
            {
              icon: Shield,
              title: "Secure by Design",
              description:
                "Enterprise-grade security with encrypted data, secure authentication, and private conversations.",
            },
            {
              icon: Users,
              title: "Multi-Project Support",
              description:
                "Create unlimited projects for different use cases - support bots, coding assistants, and more.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass hover:glass-strong hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-primary/20">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-accent p-8 md:p-16 shadow-2xl shadow-primary/30">
          <div className='absolute inset-0 bg-[url(&apos;data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&apos;)]' />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your AI Assistant?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of developers and businesses using our platform to
              create intelligent chatbots.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg"
              >
                {isLoggedIn ? (
                  <>
                    <LayoutDashboard className="mr-2 w-5 h-5" />
                    Go to Dashboard
                  </>
                ) : (
                  <>
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">
                © 2026 ChatDalta. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
