"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function PermisosPage() {
  const usuarios = useQuery(api.users.listar, {}) ?? [];
  const actualizarRol = useMutation(api.users.actualizarRol);
  const eliminarUsuario = useMutation(api.users.eliminar);

  const [busqueda, setBusqueda] = useState("");
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ mensaje: string; tipo: "success" | "error" | null }>({
    mensaje: "",
    tipo: null,
  });

  /* -------------------- FILTRO -------------------- */
  const filtrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(term) ||
        u.apellido?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [busqueda, usuarios]);

  /* -------------------- PAGINACIÓN -------------------- */
  const porPagina = 8;
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina;
  const paginaActual = filtrados.slice(desde, hasta);

  /* -------------------- ACTUALIZAR ROL -------------------- */
  const handleActualizarRol = async (
    id: Id<"users">,
    role: "paciente" | "profesional" | "recepcionista" | "gerente"
  ) => {
    try {
      await actualizarRol({ id, role });
      setToast({ mensaje: " Rol actualizado correctamente", tipo: "success" });
      setRoles((prev) => {
        const nuevo = { ...prev };
        delete nuevo[id.toString()];
        return nuevo;
      });
      setTimeout(() => setToast({ mensaje: "", tipo: null }), 3000);
    } catch (err) {
      setToast({ mensaje: "❌ Error al actualizar rol", tipo: "error" });
      setTimeout(() => setToast({ mensaje: "", tipo: null }), 3000);
    }
  };


  /* -------------------- ELIMINAR USUARIO -------------------- */
  const handleEliminarUsuario = async (id: Id<"users">) => {
    try {
      await eliminarUsuario({ id });
      setToast({ mensaje: " Usuario eliminado correctamente", tipo: "success" });
      setTimeout(() => setToast({ mensaje: "", tipo: null }), 3000);
    } catch (err) {
      setToast({ mensaje: " Error al eliminar usuario", tipo: "error" });
      setTimeout(() => setToast({ mensaje: "", tipo: null }), 3000);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Permisos", href: "/gerente/permisos" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Gestión de Permisos
          </h1>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            className="w-full outline-none text-sm"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow bg-white">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Rol</th>
                <th className="p-4 text-left">Creación</th>
                <th className="p-4 text-center w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginaActual.map((u) => {
                const idStr = u._id.toString();
                const rolActual = roles[idStr] ?? u.role;
                const modificado = roles[idStr] && roles[idStr] !== u.role;

                return (
                  <tr
                    key={idStr}
                    className={`border-t transition-all ${modificado ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="p-4 font-medium">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={rolActual}
                        onChange={(e) =>
                          setRoles((prev) => ({
                            ...prev,
                            [idStr]: e.target.value,
                          }))
                        }
                        className={`border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 ${modificado ? "border-blue-400 bg-blue-100" : ""
                          }`}
                      >
                        <option value="paciente">Paciente</option>
                        <option value="profesional">Profesional</option>
                        <option value="recepcionista">Recepcionista</option>
                        <option value="gerente">Gerente</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {u._creationTime
                        ? new Date(u._creationTime).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                    <td className="p-4 text-center flex justify-center items-center gap-2">
                      <button
                        disabled={!modificado}
                        onClick={() => handleActualizarRol(u._id as Id<"users">,
                          rolActual as "paciente" | "profesional" | "recepcionista" | "gerente")
                        }

                        className={`px-4 py-1 rounded-lg text-sm transition-all ${modificado
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Guardar
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button hidden className="px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all text-sm font-medium flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
                              <strong>{u.nombre} {u.apellido}</strong> del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEliminarUsuario(u._id as Id<"users">)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-3 py-4 text-sm">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
              className={`px-3 py-1 rounded-md ${pagina === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className={`px-3 py-1 rounded-md ${pagina === totalPaginas
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* ✅ Toast de éxito / error */}
        {toast.tipo && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white animate-in fade-in slide-in-from-bottom-4 duration-500 ${toast.tipo === "success"
              ? "bg-green-600 border border-green-400"
              : "bg-red-600 border border-red-400"
              }`}
          >
            {toast.tipo === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
            <p className="font-medium">{toast.mensaje}</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
