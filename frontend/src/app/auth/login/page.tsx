"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-eduverse-text)", letterSpacing: "-0.02em" }}>
              Edu<span className="text-eduverse-accent">Verse</span>
            </Link>
            <p className="text-eduverse-text-muted mt-2">Welcome back, adventurer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error" role="alert">
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-eduverse-text-muted mb-1">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-input"
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-eduverse-text-muted mb-1">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <GradientButton type="submit" loading={loading} className="w-full">
              Login
            </GradientButton>
          </form>

          <p className="text-center text-sm text-eduverse-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-eduverse-accent-light hover:underline">
              Register
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
