/* import { PageWrapper } from '@/components/page-wrapper'
import React from 'react'

const ReportesProfesional = () => {
    return (
        <PageWrapper breadcrumbs={[
            { label: "Inicio", href: "/profesional" },
            { label: "Reportes", href: "/profesional/reportes" },
        ]}>
            <div>Reportes</div>
        </PageWrapper>
    )
}

export default ReportesProfesional */

"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import {
    CalendarDays,
    Users,
    Clock,
    TrendingUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
} from "recharts";

export default function ReportesProfesionalPage() {
    const { user } = useUser();

    /* =============================================================== */
    /* ===================== QUERIES SEGURAS ========================== */
    /* =============================================================== */

    // Profesional actual
    const profesional = useQuery(api.profesionales.getByClerkUser, {
        clerkUserId: user?.id || "",
    });

    // ID tipado de Convex
    const profesionalId = profesional?._id as Id<"profesionales"> | undefined;

    // Ejecutar query solo cuando haya profesional
    const turnos = useQuery(
        api.turnos.listarPorProfesional,
        profesionalId ? { profesionalId } : "skip"
    );

    // Filtrar localmente los turnos
    const turnosDelProfesional = useMemo(() => {
        if (!profesionalId || !turnos) return [];
        return turnos.filter((t: any) => t.profesionalId === profesionalId);
    }, [turnos, profesionalId]);

    /* =============================================================== */
    /* ========================= MÉTRICAS ============================= */
    /* =============================================================== */

    const totalTurnos = turnosDelProfesional.length;

    const pacientesAtendidos = useMemo(() => {
        const atendidos = turnosDelProfesional.filter((t: any) => t.estado === "Finalizado");
        const ids = [...new Set(atendidos.map((t: any) => t.pacienteId))];
        return ids.length;
    }, [turnosDelProfesional]);

    /* =============================================================== */
    /* ==================== GRÁFICO: EVOLUCIÓN ======================= */
    /* =============================================================== */

    const hoy = new Date();
    const [desdeEvo, setDesdeEvo] = useState(
        new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1)
            .toISOString()
            .split("T")[0]
    );
    const [hastaEvo, setHastaEvo] = useState(hoy.toISOString().split("T")[0]);

    const turnosEvo = useMemo(() => {
        const ini = new Date(desdeEvo);
        const fin = new Date(hastaEvo);
        return turnosDelProfesional.filter((t: any) => {
            const f = new Date(t.start);
            return f >= ini && f <= fin && t.estado === "Finalizado";
        });
    }, [turnosDelProfesional, desdeEvo, hastaEvo]);

    // Gráfico acumulativo (empieza en 0)
    const pacientesEvolucion = useMemo(() => {
        const conteo: Record<string, number> = {};
        const datos: { fecha: string; cantidad: number }[] = [];
        let acumulado = 0;

        for (const t of turnosEvo) {
            const f = new Date(t.start);
            const key = `${f.getDate()}/${f.getMonth() + 1}`;
            conteo[key] = (conteo[key] || 0) + 1;
        }

        const fechas = Object.keys(conteo)
            .sort((a, b) => {
                const [da, ma] = a.split("/").map(Number);
                const [db, mb] = b.split("/").map(Number);
                return ma - mb || da - db;
            })
            .map((fecha) => {
                acumulado += conteo[fecha];
                return { fecha, cantidad: acumulado };
            });

        return [{ fecha: "Inicio", cantidad: 0 }, ...fechas];
    }, [turnosEvo]);

    /* =============================================================== */
    /* ============= GRÁFICO: FRANJA HORARIA ========================== */
    /* =============================================================== */

    const [desdeHora, setDesdeHora] = useState(
        new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
            .toISOString()
            .split("T")[0]
    );
    const [hastaHora, setHastaHora] = useState(hoy.toISOString().split("T")[0]);

    const turnosHora = useMemo(() => {
        const ini = new Date(desdeHora);
        const fin = new Date(hastaHora);
        return turnosDelProfesional.filter((t: any) => {
            const f = new Date(t.start);
            return f >= ini && f <= fin;
        });
    }, [turnosDelProfesional, desdeHora, hastaHora]);

    // Orden fijo Mañana → Tarde → Noche
    const franjas = useMemo(() => {
        const base = [
            { name: "Mañana (6-12)", value: 0, color: "#3B82F6" },
            { name: "Tarde (12-18)", value: 0, color: "#6366F1" },
            { name: "Noche (18-24)", value: 0, color: "#06B6D4" },
        ];
        for (const t of turnosHora) {
            const h = new Date(t.start).getHours();
            if (h >= 6 && h < 12) base[0].value++;
            else if (h >= 12 && h < 18) base[1].value++;
            else if (h >= 18 && h < 24) base[2].value++;
        }
        return base;
    }, [turnosHora]);

    const franjaMasSolicitada = useMemo(() => {
        if (!franjas?.length) return "Sin datos";
        const copia = [...franjas];
        copia.sort((a, b) => b.value - a.value);
        return copia[0]?.name || "Sin datos";
    }, [franjas]);

    /* =============================================================== */
    /* ============================= UI ============================== */
    /* =============================================================== */

    return (
        <PageWrapper
            breadcrumbs={[
                { label: "Inicio", href: "/profesional" },
                { label: "Reportes", href: "/profesional/reportes" },
            ]}
        >
            <div className="w-full px-10 py-10 space-y-10 bg-gradient-to-b from-slate-50 to-white min-h-screen">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Reportes del Profesional
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Visualización detallada de métricas personales y actividad reciente
                    </p>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPI
                        icon={<CalendarDays className="w-6 h-6 text-blue-500" />}
                        title="Total de Turnos"
                        value={totalTurnos}
                    />
                    <KPI
                        icon={<Users className="w-6 h-6 text-indigo-500" />}
                        title="Pacientes Atendidos"
                        value={pacientesAtendidos}
                    />
                    <KPI
                        icon={<Clock className="w-6 h-6 text-cyan-500" />}
                        title="Franja Horaria más Solicitada"
                        value={franjaMasSolicitada}
                    />
                </div>

                {/* Evolución de Pacientes */}
                <SeccionGrafico
                    titulo="Evolución Acumulada de Pacientes Atendidos"
                    icono={<TrendingUp className="w-5 h-5 text-green-600" />}
                >
                    <FiltroRango
                        desde={desdeEvo}
                        hasta={hastaEvo}
                        setDesde={setDesdeEvo}
                        setHasta={setHastaEvo}
                    />
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={pacientesEvolucion}>
                            <defs>
                                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "10px",
                                    border: "1px solid #E5E7EB",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cantidad"
                                stroke="url(#colorLine)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#6366F1" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </SeccionGrafico>

                {/* Franja Horaria */}
                <SeccionGrafico
                    titulo="Distribución de Turnos por Franja Horaria"
                    icono={<Clock className="w-5 h-5 text-cyan-600" />}
                >
                    <FiltroRango
                        desde={desdeHora}
                        hasta={hastaHora}
                        setDesde={setDesdeHora}
                        setHasta={setHastaHora}
                    />
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={franjas}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "10px",
                                    border: "1px solid #E5E7EB",
                                }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {franjas.map((d, i) => (
                                    <Cell key={i} fill={d.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </SeccionGrafico>
            </div>
        </PageWrapper>
    );
}

/* =============================================================== */
/* ======================== COMPONENTES =========================== */
/* =============================================================== */

function KPI({ icon, title, value }: any) {
    return (
        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function SeccionGrafico({ titulo, icono, children }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {icono} {titulo}
            </h2>
            {children}
        </div>
    );
}

function FiltroRango({ desde, hasta, setDesde, setHasta }: any) {
    return (
        <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Desde</label>
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Hasta</label>
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
            </div>
        </div>
    );
}
