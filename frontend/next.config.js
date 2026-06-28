/** @type {import('next').NextConfig} */

// Baseline HTTP security headers applied to every route. Deliberately excludes a
// Content-Security-Policy: a strict CSP needs per-app tuning (Monaco web workers use
// blob:, Three.js, Next's inline runtime) and must be validated on staging before
// shipping — see docs/DEPLOYMENT.md. These headers are render-safe and standard.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Activates only over HTTPS; browsers ignore it on http/localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig = {
  serverExternalPackages: ["@monaco-editor/react"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
