import { Button } from "@/components/ui/button";

export const InstallForm = () => {
  return (
    <form
      action="/oauth/tiendanube/install"
      className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 sm:grid-cols-[1fr_auto]"
      method="GET"
    >
      <label className="grid gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
          URL o subdominio de la tienda
        </span>
        <input
          autoComplete="off"
          className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/10"
          name="store_domain"
          placeholder="gautamashoes.mitiendanube.com o www.tumarca.com"
          type="text"
        />
        <span className="text-xs leading-5 text-slate-400">
          Podes pegar el subdominio de TiendaNube o el dominio publico de la tienda. Vortex
          inicia el flujo de autorizacion y deja la sesion merchant lista para abrir el panel.
        </span>
      </label>

      <div className="flex items-end">
        <Button className="w-full sm:w-auto" size="lg" type="submit">
          Instalar Vortex
        </Button>
      </div>
    </form>
  );
};
