import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash, Stethoscope, AlertTriangle } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Especialidad = {
    _id: Id<"especialidades">;
    nombre: string;
};

interface EspecialidadCardProps {
    especialidad: Especialidad;
    editando: Id<"especialidades"> | null;
    onEditar: (especialidad: Especialidad) => void;
    onEliminar: (id: Id<"especialidades">) => void;
    onGuardar: (id: Id<"especialidades">, nombre: string) => void;
    onCancelar: () => void;
}

interface EspecialidadesGridProps {
    especialidades: Especialidad[];
    editando: Id<"especialidades"> | null;
    onEditar: (especialidad: Especialidad) => void;
    onEliminar: (id: Id<"especialidades">) => void;
    onGuardar: (id: Id<"especialidades">, nombre: string) => void;
    onCancelar: () => void;
}

// Componente de tarjeta de especialidad
export function EspecialidadCard({
    especialidad,
    onEditar,
    onEliminar,
    editando,
    onGuardar,
    onCancelar
}: EspecialidadCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [nombreEditado, setNombreEditado] = useState(especialidad.nombre);

    const handleGuardar = () => {
        onGuardar(especialidad._id, nombreEditado);
    };

    const isEditing = editando === especialidad._id;

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-teal-300">
                {isEditing ? (
                    <div className="space-y-3">
                        <input
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="w-full border border-teal-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleGuardar}
                                className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={onCancelar}
                                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{especialidad.nombre}</h3>
                                <p className="text-xs text-gray-500">Especialidad médica</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => onEditar(especialidad)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Trash className="w-4 h-4" />
                                    <span>Eliminar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center">¿Eliminar especialidad?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Esta acción eliminará permanentemente la especialidad "{especialidad.nombre}".
                            Los médicos asociados no perderán su información, pero no tendrán especialidad asignada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onEliminar(especialidad._id);
                                setShowDeleteDialog(false);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Componente de grid de especialidades
export function EspecialidadesGrid({
    especialidades,
    editando,
    onEditar,
    onEliminar,
    onGuardar,
    onCancelar
}: EspecialidadesGridProps) {
    if (especialidades.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay especialidades</h3>
                <p className="text-gray-500 text-sm">
                    Comienza agregando una nueva especialidad médica usando el formulario de arriba.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {especialidades.map((esp) => (
                <EspecialidadCard
                    key={esp._id.toString()}
                    especialidad={esp}
                    editando={editando}
                    onEditar={onEditar}
                    onEliminar={onEliminar}
                    onGuardar={onGuardar}
                    onCancelar={onCancelar}
                />
            ))}
        </div>
    );
}