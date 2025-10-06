"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, LucideIcon, Stethoscope, Mail } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// 👉 cargamos el diálogo sólo en cliente para evitar hydration mismatch
const LogoutDialog = dynamic(() => import("@/components/LogoutDialog.client"), {
  ssr: false,
});

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type AppSidebarProps = {
  links: SidebarLink[];
  panelName: string;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ links, panelName, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Evitar que SSR y el primer render de cliente difieran
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const profesional = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id || "",
  });

  return (
    <Sidebar {...props} className="border-r bg-gradient-to-b from-white to-gray-50/50">
      {/* Header con logo */}
      <SidebarHeader className="flex flex-col items-start gap-1 px-6 py-5 border-b border-gray-200/60">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
            <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              ProSalud
            </span>
            <span className="text-xs text-slate-500">{panelName}</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Links principales */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={href}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                        : "text-gray-700 hover:bg-gray-100 hover:scale-[1.01]"
                      }
                    `}
                  >
                    <Icon
                      size={24}
                      strokeWidth={2.5}
                      className={`transition-transform duration-200 ${isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-blue-600 group-hover:scale-110"
                        }`}
                    />
                    <span
                      className={`text-base font-semibold ${isActive ? "text-white" : ""
                        }`}
                    >
                      {label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer con user y logout */}
      <div className="mt-auto border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col gap-3 p-3">
          {/* Bloque informativo del profesional; usamos 'mounted' para no cambiar el HTML de SSR */}
          {mounted && profesional ? (
            <div className="w-full pb-3">
              <div className="w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-full ring-2 ring-blue-500/20",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      Dr. {profesional.nombre} {profesional.apellido}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Stethoscope className="h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                      <span className="truncate">
                        {profesional.especialidadNombre || "Sin especialidad"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {profesional.contacto || "Sin contacto"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Skeleton para mantener estructura
            <div className="w-full pb-3">
              <div className="w-full h-[78px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm animate-pulse" />
            </div>
          )}

          {/* Diálogo de logout: client-only sin SSR */}
          <LogoutDialog />
        </div>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
