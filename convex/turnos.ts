import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { checkSolapamiento } from "./helpers/checkSolapamiento";
import { addMinutes, isWithinInterval, parse } from "date-fns";
/* -----------------------------------------------------
   📅 Listar turnos enriquecidos por rango (para reportes)
----------------------------------------------------- */
export const listarRango = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byStart", (q) => q.gte("start", from).lte("start", to))
      .order("asc")
      .collect();

    const resultados = [];

    for (const t of turnos) {
      const paciente = await ctx.db.get(t.pacienteId);
      const profesional = await ctx.db.get(t.profesionalId);
      const especialidad = profesional
        ? await ctx.db.get(profesional.especialidadId)
        : null;

      // 🔹 Obtener obras sociales del paciente
      let obrasSocialesPaciente: string[] = [];
      if (paciente) {
        const rels = await ctx.db
          .query("pacientes_obrasSociales")
          .withIndex("por_paciente", (q) => q.eq("pacienteId", paciente._id))
          .collect();

        const obras = await Promise.all(
          rels.map(async (r) => {
            const os = await ctx.db.get(r.obraSocialId);
            return os?.nombre ?? "";
          })
        );

        obrasSocialesPaciente = obras.filter(Boolean);
      }

      resultados.push({
        ...t,
        pacienteNombre: paciente?.nombre ?? "—",
        pacienteApellido: paciente?.apellido ?? "—",
        profesionalNombre: profesional?.nombre ?? "—",
        profesionalApellido: profesional?.apellido ?? "—",
        profesionalEstado: profesional?.estado ?? "Inactivo",
        especialidadNombre: especialidad?.nombre ?? "—",
        obrasSocialesPaciente,
      });
    }

    return resultados;
  },
});

/* -----------------------------------------------------
   ➕ Crear turno
----------------------------------------------------- */
export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    tipo: v.string(),
    estado: v.union(
      v.literal("Confirmado"),
      v.literal("Pendiente"),
      v.literal("Cancelado"),
      v.literal("Finalizado")
    ),
    start: v.number(),
    end: v.number(),
    notas: v.optional(v.string()),
    duracion: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    console.log("=== 🟢 CREAR TURNO ===");
    console.log("args:", args);

    // 🧩 1️⃣ Verificar solapamiento existente
    const existeSolapamiento = await checkSolapamiento(
      ctx.db,
      args.profesionalId,
      args.start,
      args.end
    );

    if (existeSolapamiento) {
      console.warn("⚠️ Solapamiento detectado");
      throw new ConvexError("El profesional ya tiene un turno en este horario.");
    }

   // 🧩 2️⃣ Verificar horario dentro de las franjas del profesional
const profesional = await ctx.db.get(args.profesionalId);
if (!profesional) throw new ConvexError("Profesional no encontrado.");

const fechaInicio = new Date(args.start);
const fechaFin = new Date(args.end);
const dia = fechaInicio.getDay(); // 0 = domingo ... 6 = sábado

// 🔹 Forzar conversión a hora local de Argentina (UTC-3)
const toLocalMinutes = (date: Date) => {
  // Usamos Intl.DateTimeFormat con zona horaria fija
  const parts = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type === "hour" || p.type === "minute") acc[p.type] = p.value;
      return acc;
    }, {});

  const h = parseInt(parts.hour ?? "0", 10);
  const m = parseInt(parts.minute ?? "0", 10);
  return h * 60 + m;
};

const minutosInicio = toLocalMinutes(fechaInicio);
const minutosFin = toLocalMinutes(fechaFin);

console.log("🌎 Turno minutos (ARG local):", { minutosInicio, minutosFin });
console.log("📅 Día (0=Dom):", dia);

// 🔹 Buscar franjas del mismo día
const franjasDia = (profesional.franjasHorarias ?? []).filter(
  (f) => f.dia === dia
);

console.log("📆 Franjas para este día:", franjasDia);

if (franjasDia.length === 0) {
  throw new ConvexError("El profesional no atiende este día.");
}

let dentroDeFranja = false;

for (const f of franjasDia) {
  const [hInicio, mInicio] = f.inicio.split(":").map(Number);
  const [hFin, mFin] = f.fin.split(":").map(Number);

  const inicioFranjaMin = hInicio * 60 + mInicio;
  const finFranjaMin = hFin * 60 + mFin;

  console.log(
    `⏰ Evaluando franja ${f.inicio}-${f.fin} -> (${inicioFranjaMin}-${finFranjaMin})`
  );

  const margen = 1;
  const cumple =
    minutosInicio >= inicioFranjaMin - margen &&
    minutosFin <= finFranjaMin + margen;

  console.log("   ↳ ¿Cumple franja?:", cumple);

  if (cumple) {
    dentroDeFranja = true;
    break;
  }
}

console.log("✅ Dentro de franja final:", dentroDeFranja);

if (!dentroDeFranja) {
  throw new ConvexError(
    "El turno está fuera del horario de atención del profesional."
  );
}


    // 🧩 3️⃣ Insertar turno si todo está correcto
    const ahora = Date.now();
    const duracionMin =
      args.duracion ?? Math.round((args.end - args.start) / 60000);

    console.log("📝 Insertando turno con duración:", duracionMin, "minutos");

    const id = await ctx.db.insert("turnos", {
      ...args,
      duracion: duracionMin,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    console.log("✅ Turno creado con ID:", id);
    console.log("===============================");
    return id;
  },
});

/* -----------------------------------------------------
   ✏️ Editar turno
----------------------------------------------------- */
export const editar = mutation({
  args: {
    id: v.id("turnos"),
    pacienteId: v.optional(v.id("pacientes")),
    profesionalId: v.optional(v.id("profesionales")),
    tipo: v.optional(v.string()),

    estado: v.optional(
      v.union(
        v.literal("Confirmado"),
        v.literal("Pendiente"),
        v.literal("Cancelado"),
        v.literal("Finalizado")
      )
    ),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    notas: v.optional(v.string()),
    duracion: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...data }) => {
    const turnoActual = await ctx.db.get(id);
    if (!turnoActual) throw new ConvexError("Turno no encontrado");

    const nuevo = { ...turnoActual, ...data };
    const existeSolapamiento = await checkSolapamiento(
      ctx.db,
      nuevo.profesionalId,
      nuevo.start,
      nuevo.end,
      id
    );

    if (existeSolapamiento) {
      throw new ConvexError("El profesional ya tiene un turno en este horario.");
    }

    await ctx.db.patch(id, { ...data, actualizadoEn: Date.now() });
    return id;
  },
});

/* -----------------------------------------------------
   🗑️ Eliminar turno
----------------------------------------------------- */
export const eliminar = mutation({
  args: { id: v.id("turnos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/* -----------------------------------------------------
   🧑‍⚕️ Listar por profesional (simple)
----------------------------------------------------- */
export const listarPorProfesional = query({
  args: { profesionalId: v.id("profesionales") },
  handler: async (ctx, { profesionalId }) => {
    return await ctx.db
      .query("turnos")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
      .collect();
  },
});

// ----------------------------
// Listar con nombres (básico, sin rango)
// ----------------------------
export const listarConNombres = query({
  args: { profesionalId: v.optional(v.id("profesionales")) },
  handler: async (ctx, args) => {
    try {
      let turnos;

      // 🔹 Caso 1: con profesionalId (usa índice)
      if (args.profesionalId) {
        turnos = await ctx.db
          .query("turnos")
          .withIndex("byProfesional", (q) =>
            q.eq("profesionalId", args.profesionalId!)
          )
          .collect();
      } 
      // 🔹 Caso 2: sin profesionalId (trae todos)
      else {
        turnos = await ctx.db.query("turnos").collect();
      }

      // 🔹 Enriquecer datos
      const result = await Promise.all(
        turnos.map(async (t) => {
          const paciente = await ctx.db.get(t.pacienteId);
          const profesional = await ctx.db.get(t.profesionalId);
          const especialidad = profesional?.especialidadId
            ? await ctx.db.get(profesional.especialidadId)
            : null;

          // 🔹 Obtener obras sociales del paciente
          let obrasSocialesPaciente: string[] = [];
          if (paciente) {
            const rels = await ctx.db
              .query("pacientes_obrasSociales")
              .withIndex("por_paciente", (q) => q.eq("pacienteId", paciente._id))
              .collect();

            const obras = await Promise.all(
              rels.map(async (r) => {
                const os = await ctx.db.get(r.obraSocialId);
                return os?.nombre ?? "";
              })
            );

            obrasSocialesPaciente = obras.filter(Boolean);
          }

          return {
            ...t,
            pacienteNombre: paciente?.nombre ?? "Paciente sin nombre",
            pacienteApellido: paciente?.apellido ?? "Paciente sin apellido",
            profesionalNombre: profesional?.nombre ?? "Profesional sin nombre",
            profesionalApellido: profesional?.apellido ?? "Profesional sin apellido",
            profesionalEstado: profesional?.estado ?? "Inactivo",
            especialidadNombre: especialidad?.nombre ?? "",
            obrasSocialesPaciente,
          };
        })
      );

      return result;
    } catch (error) {
      console.error("❌ Error en listarConNombres:", error);
      throw new Error("Error al listar los turnos.");
    }
  },
});




/* -----------------------------------------------------
   📊 Listar todos los turnos (para dashboard)
   🔹 Ahora también incluye obrasSocialesPaciente
----------------------------------------------------- */
export const listar = query({
  args: {},
  handler: async (ctx) => {
    const turnos = await ctx.db.query("turnos").collect();

    return Promise.all(
      turnos.map(async (t) => {
        const paciente = await ctx.db.get(t.pacienteId);
        const profesional = await ctx.db.get(t.profesionalId);
        const especialidad = profesional
          ? await ctx.db.get(profesional.especialidadId)
          : null;

        // 🔹 Obtener obras sociales del paciente
        let obrasSocialesPaciente: string[] = [];
        if (paciente) {
          const rels = await ctx.db
            .query("pacientes_obrasSociales")
            .withIndex("por_paciente", (q) => q.eq("pacienteId", paciente._id))
            .collect();

          const obras = await Promise.all(
            rels.map(async (r) => {
              const os = await ctx.db.get(r.obraSocialId);
              return os?.nombre ?? "";
            })
          );

          obrasSocialesPaciente = obras.filter(Boolean);
        }

        return {
          ...t,
          pacienteNombre: paciente?.nombre || "—",
          profesionalNombre: profesional?.nombre || "—",
          especialidadNombre: especialidad?.nombre || "—",
          obrasSocialesPaciente,
        };
      })
    );
  },
});

/* -----------------------------------------------------
   📈 Indicadores por rango (para estadísticas)
----------------------------------------------------- */
export const listarIndicadores = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byStart", (q) => q.gte("start", from).lte("start", to))
      .collect();

    const total = turnos.length;
    if (total === 0) {
      return {
        total: 0,
        confirmados: 0,
        cancelados: 0,
        porcentajeConfirmados: 0,
        porcentajeCancelados: 0,
        promedioDiario: 0,
        especialidadesTop: [],
      };
    }

    const confirmados = turnos.filter((t) => t.estado === "Confirmado").length;
    const cancelados = turnos.filter((t) => t.estado === "Cancelado").length;

    const diasDelMes = new Date(to).getDate();
    const promedioDiario = Math.ceil(total / diasDelMes);

    const porEspecialidad: Record<string, number> = {};
    for (const t of turnos) {
      if (!porEspecialidad[t.tipo]) porEspecialidad[t.tipo] = 0;
      porEspecialidad[t.tipo]++;
    }

    const especialidadesTop = Object.entries(porEspecialidad)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([nombre]) => nombre);

    return {
      total,
      confirmados,
      cancelados,
      porcentajeConfirmados: Math.round((confirmados / total) * 100),
      porcentajeCancelados: Math.round((cancelados / total) * 100),
      promedioDiario,
      especialidadesTop,
    };
  },
});

export const listarDisponibles = query({
  args: {
    profesionalId: v.id("profesionales"),
    fecha: v.string(), // formato "YYYY-MM-DD"
  },
  handler: async (ctx, { profesionalId, fecha }) => {
    const profesional = await ctx.db.get(profesionalId);
    if (!profesional?.franjasHorarias) return [];

    const base = new Date(`${fecha}T00:00:00`).getTime();
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
      .filter((q) =>
  q.and(
    q.gte(q.field("start"), base),
    q.lt(q.field("start"), base + 24 * 60 * 60 * 1000)
  )
)

      .collect();

    const dia = new Date(base).getDay();
    const franjas = profesional.franjasHorarias.filter((f) => f.dia === dia);
    const ocupados = turnos.map((t) => ({ inicio: t.start, fin: t.end }));

    const disponibles = franjas.flatMap((f) => {
      const inicio = new Date(`${fecha}T${f.inicio}`).getTime();
      const fin = new Date(`${fecha}T${f.fin}`).getTime();

      let actual = inicio;
      const bloques = [];
      while (actual + 30 * 60 * 1000 <= fin) {
        const bloqueFin = actual + 30 * 60 * 1000;
        const solapado = ocupados.some(
          (o) => actual < o.fin && bloqueFin > o.inicio
        );
        if (!solapado) {
          bloques.push({
            inicio: actual,
            fin: bloqueFin,
            label: `${new Date(actual).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}`,
          });
        }
        actual = bloqueFin;
      }
      return bloques;
    });

    return disponibles;
  },
});

export const horasDisponibles = query({
  args: {
    profesionalId: v.id("profesionales"),
    fecha: v.string(),
    duracion: v.optional(v.number()),
  },
  handler: async (ctx, { profesionalId, fecha, duracion = 30 }) => {
    const profesional = await ctx.db.get(profesionalId);
    if (!profesional?.franjasHorarias) return [];

    const dia = new Date(fecha).getDay();
    const franjasDia = profesional.franjasHorarias.filter((f) => f.dia === dia);
    if (franjasDia.length === 0) return [];

    // 1️⃣ Buscar turnos existentes del día
    const inicioDia = new Date(`${fecha}T00:00:00`).getTime();
    const finDia = inicioDia + 24 * 60 * 60 * 1000;
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
      .filter((q) =>
        q.and(q.gte(q.field("start"), inicioDia), q.lt(q.field("start"), finDia))
      )
      .collect();

    // 2️⃣ Transformar a intervalos legibles
    const ocupados = turnos.map((t) => {
      const ini = new Date(t.start);
      const fin = new Date(t.end);
      const minIni = ini.getHours() * 60 + ini.getMinutes();
      const minFin = fin.getHours() * 60 + fin.getMinutes();
      return { ini, fin, minIni, minFin };
    });

    console.log("🧩 Fecha:", fecha, "Día:", dia);
    console.log("🕓 Franjas del profesional:", profesional.franjasHorarias);
    console.log("📅 Franjas del día:", franjasDia);
    console.log("🟥 Turnos ocupados:", ocupados.map(o => ({
      ini: o.ini.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      fin: o.fin.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      minIni: o.minIni,
      minFin: o.minFin
    })));

    // 3️⃣ Generar bloques candidatos y detectar solapamiento
    const disponibles: string[] = [];
    for (const fr of franjasDia) {
  const [h1, m1] = fr.inicio.split(":").map(Number);
  const [h2, m2] = fr.fin.split(":").map(Number);

  // 🔹 Creamos Date en zona local Argentina
  const franjaInicio = new Date(`${fecha}T${fr.inicio}:00-03:00`);
  const franjaFin = new Date(`${fecha}T${fr.fin}:00-03:00`);

  let actual = franjaInicio.getTime();
  const finMs = franjaFin.getTime();

  while (actual + duracion * 60000 <= finMs) {
    const bloqueFin = actual + duracion * 60000;

    const seSolapa = ocupados.some(
      (o) => actual < o.fin.getTime() && bloqueFin > o.ini.getTime()
    );

    const label = new Date(actual).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    

    if (!seSolapa) disponibles.push(label);
    actual += duracion * 60000;
  }
}

return disponibles;
  },
});

export const actualizarEstado = mutation({
  args: {
    turnoId: v.id("turnos"),
    estado: v.union(
      v.literal("Pendiente"),
      v.literal("Confirmado"),
      v.literal("Cancelado"),
      v.literal("Finalizado")
    ),
  },
  handler: async (ctx, { turnoId, estado }) => {
    const turno = await ctx.db.get(turnoId);
    if (!turno) throw new ConvexError("Turno no encontrado.");

    const ahora = Date.now();

    // 🔹 Bloquear cambios si ya fue finalizado manualmente
    if (turno.estado === "Finalizado") {
      throw new ConvexError("No se puede modificar un turno ya finalizado.");
    }

    // 🔹 Bloquear solo si el turno ya terminó (end < ahora)
    if (turno.end < ahora) {
      throw new ConvexError("No se pueden modificar turnos que ya finalizaron.");
    }

    // 🔹 Permitir cambios antes o durante la franja
    await ctx.db.patch(turnoId, {
      estado,
      actualizadoEn: ahora,
    });

    console.log("✅ Estado del turno actualizado:", {
      turnoId,
      anterior: turno.estado,
      nuevo: estado,
    });

    return { ok: true, nuevoEstado: estado };
  },
});
