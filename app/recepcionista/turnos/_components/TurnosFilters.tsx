import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export function TurnosFilters({
  search,
  setSearch,
  estado,
  setEstado,
  orden,
  setOrden,
}: {
  search: string;
  setSearch: (v: string) => void;
  estado: string;
  setEstado: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 items-end border-b pb-4 bg-gray-50 p-3 rounded-lg shadow-sm">
      {/* 🔹 Búsqueda */}
      <div className="flex-1 min-w-[220px]">
        <label className="block text-sm text-gray-600 mb-1">Buscar</label>
        <Input
          placeholder="Buscar por paciente o profesional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-gray-300"
        />
      </div>

      {/* 🔹 Estado */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Estado</label>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[160px] border-gray-300">
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Pendiente">Pendientes</SelectItem>
            <SelectItem value="Confirmado">Confirmados</SelectItem>
            <SelectItem value="Cancelado">Cancelados</SelectItem>
            <SelectItem value="Finalizado">Finalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 🔹 Orden */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Ordenar por</label>
        <Select value={orden} onValueChange={setOrden}>
          <SelectTrigger className="w-[200px] border-gray-300">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fecha-desc">Más recientes</SelectItem>
            <SelectItem value="fecha-asc">Más antiguos</SelectItem>
            <SelectItem value="paciente-nombre">Nombre del paciente (A-Z)</SelectItem>
            <SelectItem value="paciente-apellido">Apellido del paciente (A-Z)</SelectItem>
            <SelectItem value="profesional">Profesional (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
