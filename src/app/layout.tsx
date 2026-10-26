import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "SFIC QC System — GSCSCL",
  description: "Automated QC Sampling and Reporting System for State Commodities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#f5f5f7", color: "#1d1d1f" }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
