import type React from "react";
import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  description: "TiendaNube smart recommendations engine for upsell and cross-sell journeys.",
  title: "Vortex Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
