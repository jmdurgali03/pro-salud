import { query } from "./_generated/server";

export const listar = query(async (ctx) => {
  return await ctx.db.query("especialidades").collect();
});
