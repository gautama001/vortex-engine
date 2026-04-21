import type React from "react";
import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  description:
    "Vortex ayuda a TiendaNube con recomendaciones, quick add y descuento real dentro de una experiencia comercial simple.",
  title: "Vortex Engine | TiendaNube",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
