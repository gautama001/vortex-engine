import type { ReactNode } from "react";

export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(103,232,249,0.10), transparent 24%), radial-gradient(circle at 84% 14%, rgba(59,130,246,0.10), transparent 28%), radial-gradient(circle at 50% 100%, rgba(14,165,233,0.10), transparent 30%), linear-gradient(180deg, #050816 0%, #0b1220 44%, #0f172a 100%)",
      }}
    >
      {children}
    </div>
  );
}
