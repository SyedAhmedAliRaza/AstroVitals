import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstroVitals | Autonomous Astronaut Health Monitoring & Space Medicine",
  description:
    "Autonomous astronaut health monitoring platform powered by Tiger Data, Google Gemini AI, Auth0, and Twilio. Built for the NASA Space Apps Challenge 2026.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Subtle Starfield Ambient Overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] pointer-events-none z-0" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
