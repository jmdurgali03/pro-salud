"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function LogoutDialog() {
  const { signOut } = useAuth();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 border border-gray-200 bg-white shadow-sm hover:shadow-md group"
          variant="ghost"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="font-medium">Salir</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">¿Cerrar sesión?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder nuevamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg shadow-red-600/30"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            Cerrar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
