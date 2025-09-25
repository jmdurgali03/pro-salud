import { mutationGeneric } from "convex/server";

export const seed = mutationGeneric({
  args: {}, // no necesitamos argumentos
  handler: async (ctx) => {
    // Evitar duplicados
    const obras = await ctx.db.query("obrasSociales").collect();
    const especialidades = await ctx.db.query("especialidades").collect();

    if (obras.length === 0) {
      await ctx.db.insert("obrasSociales", { nombre: "IPS" });
      await ctx.db.insert("obrasSociales", { nombre: "Swiss Medical" });
      await ctx.db.insert("obrasSociales", { nombre: "OSDE" });
      await ctx.db.insert("obrasSociales", { nombre: "Sancor Salud" });
    }

    if (especialidades.length === 0) {
      await ctx.db.insert("especialidades", { nombre: "Cardiología" });
      await ctx.db.insert("especialidades", { nombre: "Traumatología" });
      await ctx.db.insert("especialidades", { nombre: "Dermatología" });
      await ctx.db.insert("especialidades", { nombre: "Urología" });
      await ctx.db.insert("especialidades", { nombre: "Ginecología" });
    }
  },
});
