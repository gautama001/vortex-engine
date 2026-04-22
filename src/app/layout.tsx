import type React from "react";
import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  description:
    "Vortex ayuda a TiendaNube con recomendaciones, quick add y descuento real dentro de una experiencia comercial simple.",
  icons: {
    apple: "/apple-icon.png",
    icon: [
      { sizes: "32x32", type: "image/png", url: "/icon.png" },
      { sizes: "any", url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
  },
  title: "Vortex Engine | TiendaNube",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
