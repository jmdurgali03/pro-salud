"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import type { Profesional, ProfesionalInput } from "./page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import HorariosSection, { Franja } from "./HorariosSection";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput & { dni?: string; matricula?: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
  onClientError?: (msg: string | null) => void;
};

export default function ProfesionalForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
  onClientError,
}: Props) {
  const especialidades = useQuery(api.especialidades.listar);
  const obrasSociales = useQuery(api.obrasSociales.listar);

  const [franjas, setFranjas] = useState<Franja[]>([]);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.franjasHorarias)) {
      console.log("💬 Cargando franjas desde backend:", initialData.franjasHorarias);

      const agrupadas: Franja[] = [];

      for (const f of initialData.franjasHorarias) {
        const existente = agrupadas.find(
          (a) => a.inicio === f.inicio && a.fin === f.fin
        );
        if (existente) {
          if (!existente.dias.includes(f.dia)) existente.dias.push(f.dia);
        } else {
          agrupadas.push({ inicio: f.inicio, fin: f.fin, dias: [f.dia] });
        }
      }

      agrupadas.forEach((f) => f.dias.sort((a, b) => a - b));
      agrupadas.sort((a, b) => (a.inicio > b.inicio ? 1 : -1));

      setFranjas(agrupadas);
      console.log("✅ Franjas agrupadas cargadas:", agrupadas);
    }
  }, [initialData]);

  if (!especialidades || !obrasSociales)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [apellido, setApellido] = useState(initialData?.apellido ?? "");
  const [dni, setDni] = useState(initialData?.dni ?? "");
  const [matricula, setMatricula] = useState(initialData?.matricula ?? "");
  const [especialidadId, setEspecialidadId] = useState<Id<"especialidades"> | "">(
    initialData?.especialidadId ?? ""
  );
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );

  /* 🧩 Loggear y validar al guardar */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🟦 handleSubmit ejecutado");
    console.log("👉 Estado actual de franjas:", franjas);

    if (!nombre.trim() || !apellido.trim()) {
      return onClientError?.("Nombre y apellido son obligatorios.");
    }

    const franjasDefinidas = franjas.filter((f) => f.dias.length > 0);
    console.log("✅ Franjas con días asignados:", franjasDefinidas);

    if (franjasDefinidas.length > 2) {
      console.warn("⚠️ Demasiadas franjas:", franjasDefinidas.length);
      return onClientError?.(
        "Solo puedes agregar hasta 2 franjas horarias con días asignados."
      );
    }

    const franjasHorarias = franjas.flatMap((f) =>
      f.dias.map((dia) => ({
        dia,
        inicio: f.inicio,
        fin: f.fin,
      }))
    );

    console.log("🧩 Franjas expandidas para enviar:", franjasHorarias);

    const data: any = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      especialidadId: especialidadId as Id<"especialidades">,
      contacto,
      telefono,
      estado,
      franjasHorarias,
    };

    if (!initialData) {
      data.dni = dni;
      data.matricula = matricula;
    }

    console.log("📦 Datos finales enviados a onSubmit:", data);
    onSubmit(data);
  };

  /* 🧭 Monitorear cambios en HorariosSection */
  const handleFranjasChange = (nuevasFranjas: Franja[]) => {
    console.log("🟨 handleFranjasChange ejecutado:", nuevasFranjas);

    const definidas = nuevasFranjas.filter((f) => f.dias.length > 0);
    if (definidas.length > 2) {
      console.warn("⚠️ Intento de agregar más de 2 franjas:", definidas.length);
      return onClientError?.(
        "Solo puedes agregar hasta 2 franjas horarias con días asignados."
      );
    }

    // Validar superposición
    for (let i = 0; i < nuevasFranjas.length; i++) {
      for (let j = i + 1; j < nuevasFranjas.length; j++) {
        const f1 = nuevasFranjas[i];
        const f2 = nuevasFranjas[j];
        const diasEnComun = f1.dias.some((d) => f2.dias.includes(d));
        if (!diasEnComun) continue;

        const inicio1 = parseInt(f1.inicio.replace(":", ""));
        const fin1 = parseInt(f1.fin.replace(":", ""));
        const inicio2 = parseInt(f2.inicio.replace(":", ""));
        const fin2 = parseInt(f2.fin.replace(":", ""));

        const seSuperponen =
          (inicio1 < fin2 && fin1 > inicio2) ||
          (inicio2 < fin1 && fin2 > inicio1);

        if (seSuperponen) {
          console.warn("⛔ Franjas superpuestas detectadas:", f1, f2);
          return onClientError?.(
            "Las franjas horarias no pueden superponerse en los mismos días."
          );
        }
      }
    }

    console.log("✅ Actualizando estado de franjas:", nuevasFranjas);
    setFranjas(nuevasFranjas);
    onClientError?.(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
    <label className="text-sm font-medium text-gray-700 block mb-2">
          Nombres
        </label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
        required
      />
      <label className="text-sm font-medium text-gray-700 block mb-2">
          Apellidos
        </label>
      <input
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        placeholder="Apellido"
        className="w-full border rounded px-3 py-2"
        required
      />

      {!initialData && (
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">
          DNI
        </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="DNI"
            className="w-full border rounded px-3 py-2"
            required
          />
          <label className="text-sm font-medium text-gray-700 block mb-2">
          Matricula
        </label>
          <input
            type="text"
            value={matricula}
            onChange={(e) =>
              setMatricula(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Matrícula"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      )}

      <div>
  <label className="text-sm font-medium text-gray-700 block mb-2">
    Especialidad
  </label>
  <p className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-800">
    {especialidades.find((e) => e._id === especialidadId)?.nombre ?? "Sin especialidad"}
  </p>
</div>

<label className="text-sm font-medium text-gray-700 block mb-2">
          Email
        </label>
      <input
        type="email"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Correo electrónico"
        className="w-full border rounded px-3 py-2"
        required
      />
      <label className="text-sm font-medium text-gray-700 block mb-2">
          Telefono
        </label>
      <input
        type="tel"
        value={telefono}
        onChange={(e) =>
          setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))
        }
        placeholder="Teléfono"
        className="w-full border rounded px-3 py-2"
        required
      />

      <HorariosSection
        key={JSON.stringify(franjas)}
        onChange={handleFranjasChange}
        initialFranjas={franjas}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          disabled={submitting}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
