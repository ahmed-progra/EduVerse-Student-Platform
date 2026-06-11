"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, username, password);
      router.push("/courses");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <p className="text-eduverse-text-muted mt-2">Begin your coding adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error" role="alert">
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-eduverse-text-muted mb-1">Email</label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-username" className="block text-sm font-medium text-eduverse-text-muted mb-1">Username</label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="app-input"
                placeholder="Choose a username"
                autoComplete="username"
                minLength={3}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-eduverse-text-muted mb-1">Password</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <GradientButton type="submit" loading={loading} className="w-full">
              Create Account
            </GradientButton>
          </form>

          <p className="text-center text-sm text-eduverse-text-muted mt-6">
            Already have an account?{" "}
             <Link href="/auth/login" className="text-eduverse-accent hover:underline">
              Login
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
