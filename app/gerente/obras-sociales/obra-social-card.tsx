import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash, Heart, AlertTriangle } from 'lucide-react';
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

type ObraSocial = {
    _id: Id<"obrasSociales">;
    nombre: string;
};

interface ObraSocialCardProps {
    obraSocial: ObraSocial;
    editando: Id<"obrasSociales"> | null;
    onEditar: (obraSocial: ObraSocial) => void;
    onEliminar: (id: Id<"obrasSociales">) => void;
    onGuardar: (id: Id<"obrasSociales">, nombre: string) => void;
    onCancelar: () => void;
}

interface ObrasSocialesGridProps {
    obrasSociales: ObraSocial[];
    editando: Id<"obrasSociales"> | null;
    onEditar: (obraSocial: ObraSocial) => void;
    onEliminar: (id: Id<"obrasSociales">) => void;
    onGuardar: (id: Id<"obrasSociales">, nombre: string) => void;
    onCancelar: () => void;
}

// Componente de tarjeta de obra social
export function ObraSocialCard({
    obraSocial,
    onEditar,
    onEliminar,
    editando,
    onGuardar,
    onCancelar
}: ObraSocialCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [nombreEditado, setNombreEditado] = useState(obraSocial.nombre);

    const handleGuardar = () => {
        onGuardar(obraSocial._id, nombreEditado);
    };

    const isEditing = editando === obraSocial._id;

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-rose-300">
                {isEditing ? (
                    <div className="space-y-3">
                        <input
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleGuardar}
                                className="flex-1 bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 transition-all text-sm font-medium"
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
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{obraSocial.nombre}</h3>
                                <p className="text-xs text-gray-500">Cobertura médica</p>
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
                                    onClick={() => onEditar(obraSocial)}
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
                        <AlertDialogTitle className="text-center">¿Eliminar obra social?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Esta acción eliminará permanentemente la obra social "{obraSocial.nombre}".
                            Los pacientes asociados no perderán su información, pero no tendrán cobertura asignada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onEliminar(obraSocial._id);
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

// Componente de grid de obras sociales
export function ObrasSocialesGrid({
    obrasSociales,
    editando,
    onEditar,
    onEliminar,
    onGuardar,
    onCancelar
}: ObrasSocialesGridProps) {
    if (obrasSociales.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay obras sociales</h3>
                <p className="text-gray-500 text-sm">
                    Comienza agregando una nueva obra social usando el formulario de arriba.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {obrasSociales.map((os) => (
                <ObraSocialCard
                    key={os._id.toString()}
                    obraSocial={os}
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