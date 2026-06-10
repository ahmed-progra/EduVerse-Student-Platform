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
            <Link href="/" className="text-3xl font-bold gradient-text">EduVerse</Link>
            <p className="text-eduverse-text-muted mt-2">Welcome back, adventurer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-eduverse-text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-eduverse-accent outline-none text-eduverse-text transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-eduverse-text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-eduverse-accent outline-none text-eduverse-text transition-colors"
                placeholder="Enter your password"
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
