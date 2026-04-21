import { Button } from "@/components/ui/button";

export const InstallForm = () => {
  return (
    <form
      action="/oauth/tiendanube/install"
      className="grid gap-4 rounded-[28px] border border-slate-950/10 bg-white/75 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
      method="GET"
    >
      <label className="grid gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
          URL o subdominio de la tienda
        </span>
        <input
          autoComplete="off"
          className="h-12 rounded-2xl border border-slate-900/10 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-300/20"
          name="store_domain"
          placeholder="mitienda.mitiendanube.com o www.tumarca.com"
          type="text"
        />
        <span className="text-xs leading-5 text-slate-600">
          Pegá el dominio de TiendaNube o la URL pública. Vortex arranca el flujo de instalacion
          y te lleva directo al control plane.
        </span>
      </label>

      <div className="flex items-end">
        <Button className="w-full sm:w-auto" size="lg" type="submit">
          Instalar la app
        </Button>
      </div>
    </form>
  );
};
