"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* Split auth layout: brand panel on the left (desktop), form on the right.
   The panel is static by design — the form is the only thing that matters here. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-inner">
          <p className="auth-kicker font-mono">
            <span>{"//"}</span> eduverse
          </p>
          <h1 className="auth-headline font-display">
            Learn the craft,<br />line by line.
          </h1>
          <pre className="auth-snippet font-mono">
            <code>
              <span className="ak">def</span> <span className="af">level_up</span>(you):{"\n"}
              {"    "}<span className="ak">while</span> you.curious:{"\n"}
              {"        "}you.write_code(){"\n"}
              {"        "}you.xp <span className="ao">+=</span> <span className="an">1</span>
            </code>
          </pre>
          <p className="auth-facts font-mono">7 subjects · AI tutor · 3D labs · $0, no paywalls</p>
        </div>
      </aside>

      <main className="auth-form-side">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
        <Link href="/" className="auth-back font-mono">
          ← back to eduverse.home
        </Link>
      </main>
    </div>
  );
}
