"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CalendarDays,
  Mail,
  Phone,
  Stethoscope,
  User,
  Heart,
  Settings,
  Droplet,
  Calendar,
} from "lucide-react";
import Link from "next/link";
export default function PerfilDoctorPage() {
  const { user } = useUser();

  // Traer info del profesional logueado desde Convex
  const profesional = useQuery(
    api.profesionales.getByClerkUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  if (!profesional) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando perfil del profesional…
      </div>
    );
  }
  
 

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar lateral izquierdo */}
   

      {/* Contenido principal */}
      <div className="flex-1">
        {/* Top bar */}
        

        {/* Perfil */}
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Cover */}
            <div className="h-40 bg-gradient-to-r from-sky-600 to-sky-800 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                  <img
                    src={user?.imageUrl || "https://via.placeholder.com/150"}
                    alt="doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Datos */}
            <div className="pt-20 px-8 pb-6">
              <h2 className="text-2xl font-bold text-sky-700">
                Dr. {profesional.nombre} {profesional.apellido}
              </h2>
              <p className="text-gray-500">Especialidad: {profesional.especialidadNombre}</p>
              <p className="text-gray-600 flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-gray-400" /> {profesional.contacto}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> {profesional.telefono}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
     
            </div>

       
            <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-sky-600 mb-4">Notas del doctor</h3>
              <textarea
                placeholder="Escribí tus notas internas…"
                className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-sky-500"
              />
              <button className="mt-3 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700">
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      </div>

   
            )
  
  
}
