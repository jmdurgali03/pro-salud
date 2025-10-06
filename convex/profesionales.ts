// convex/profesionales.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

// ---- Tipos de respuestas
export type CrearResp =
  | { ok: true; id: string; usuario: string; password: string }   // 👈 ahora sí
  | { ok: false; reason: "DNI_DUP" | "MATRICULA_DUP" | "TELEFONO_DUP" | "BAD_INPUT"; message?: string };

export type EditResp =
  | { ok: true }
  | { ok: false; reason: "TELEFONO_DUP" | "NOT_FOUND" | "BAD_INPUT"; message?: string };

export type EliminarResp =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" };

export const listar = query(async (ctx) => {
  return await ctx.db.query("profesionales").collect();
});

export const crear = mutation({
  args: {
    nombre: v.string(),
    apellido: v.string(),
    dni: v.string(),
    matricula: v.string(),
    especialidadId: v.id("especialidades"),
    contacto: v.string(),
    telefono: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args): Promise<CrearResp> => {
    const nombre = args.nombre.trim();
    const apellido = args.apellido.trim();
    const contacto = args.contacto.trim();
    const dni = onlyDigits(args.dni);
    const matricula = onlyDigits(args.matricula);
    const telefono = onlyDigits(args.telefono);
    const base = (args.nombre[0] + args.apellido).toLowerCase();
    const usuario = base;
    const password = base + args.dni.slice(-3);

    if (dni.length !== 8) return { ok: false, reason: "BAD_INPUT", message: "El DNI debe tener 8 dígitos." };
    if (matricula.length !== 4) return { ok: false, reason: "BAD_INPUT", message: "La matrícula debe tener 4 dígitos." };
    if (telefono.length !== 10) return { ok: false, reason: "BAD_INPUT", message: "El teléfono debe tener 10 dígitos." };

    const dupDni = await ctx.db.query("profesionales").withIndex("por_dni", q => q.eq("dni", dni)).first();
    if (dupDni) return { ok: false, reason: "DNI_DUP" };

    const dupMat = await ctx.db.query("profesionales").withIndex("por_matricula", q => q.eq("matricula", matricula)).first();
    if (dupMat) return { ok: false, reason: "MATRICULA_DUP" };

    const dupTel = await ctx.db.query("profesionales").withIndex("por_telefono", q => q.eq("telefono", telefono)).first();
    if (dupTel) return { ok: false, reason: "TELEFONO_DUP" };

    const id = await ctx.db.insert("profesionales", {
      ...args,
      nombre,
      apellido,
      contacto,
      dni,
      matricula,
      telefono,
      usuario,
      password,
    });
      return { ok: true as const, id, usuario, password };
  },
});

export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.optional(v.string()),
    apellido: v.optional(v.string()),
    especialidadId: v.optional(v.id("especialidades")),
    contacto: v.optional(v.string()),
    telefono: v.optional(v.string()),
    obrasSociales: v.optional(v.array(v.id("obrasSociales"))),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"))),

    // ✅ NUEVO
    franjasHorarias: v.optional(
      v.array(
        v.object({
          dia: v.number(),
          inicio: v.string(),
          fin: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, { id, ...data }): Promise<EditResp> => {
    const actual = await ctx.db.get(id);
    if (!actual) return { ok: false, reason: "NOT_FOUND" };

    const patch: Record<string, any> = {};

    if (data.nombre !== undefined) patch.nombre = data.nombre.trim();
    if (data.apellido !== undefined) patch.apellido = data.apellido.trim();
    if (data.contacto !== undefined) patch.contacto = data.contacto.trim();
    if (data.especialidadId !== undefined) patch.especialidadId = data.especialidadId;
    if (data.obrasSociales !== undefined) patch.obrasSociales = data.obrasSociales;
    if (data.estado !== undefined) patch.estado = data.estado;

    if (data.telefono !== undefined) {
      const tel = onlyDigits(data.telefono);
      if (tel.length !== 10)
        return { ok: false, reason: "BAD_INPUT", message: "El teléfono debe tener 10 dígitos." };
      if (tel !== actual.telefono) {
        const dup = await ctx.db
          .query("profesionales")
          .withIndex("por_telefono", (q) => q.eq("telefono", tel))
          .first();
        if (dup && dup._id !== id)
          return { ok: false, reason: "TELEFONO_DUP" };
      }
      patch.telefono = tel;
    }

    // ✅ NUEVO — Guardar franjas horarias
    if (data.franjasHorarias !== undefined) {
      patch.franjasHorarias = data.franjasHorarias;
    }

    await ctx.db.patch(id, patch);
    return { ok: true };
  },
});


export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, { id }): Promise<EliminarResp> => {
    const ex = await ctx.db.get(id);
    if (!ex) return { ok: false, reason: "NOT_FOUND" };
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const vincularConClerk = mutation({
  args: { usuario: v.string(), password: v.string(), clerkId: v.string() },
  handler: async (ctx, { usuario, password, clerkId }) => {
    // Buscar profesional por usuario
    const prof = await ctx.db.query("profesionales")
      .withIndex("byUsuario", (q) => q.eq("usuario", usuario))
      .first();

    if (!prof || prof.password !== password) {
      return { ok: false, reason: "INVALID_CREDENTIALS" };
    }

    // Vincular profesional con Clerk (usar el nombre exacto del schema: clerkUserId)
    await ctx.db.patch(prof._id, { clerkUserId: clerkId });

    // Actualizar rol en users
    const user = await ctx.db.query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { role: "doctor" });
    }

    return { ok: true };
  },
});
export const getByClerkUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const prof = await ctx.db.query("profesionales")
      .withIndex("byClerkUser", q => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!prof) return null;

    const especialidad = await ctx.db.get(prof.especialidadId);

    return {
      ...prof,
      especialidadNombre: especialidad?.nombre || "Sin especialidad",
    };
  },
});


export const existsUnlinkedByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const docs = await ctx.db.query("profesionales")
      .withIndex("byContacto", q => q.eq("contacto", email))
      .collect();

    return docs.find(p => !p.clerkUserId) || null;
  },
});
