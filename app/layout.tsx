import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "@/components/Header";
import ConvexClientProvider from "@/components/convex-client-provider";

export const metadata: Metadata = {
  title: "ProSalud",
  description: "Sistema de gestión médica con Next.js + Convex",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        {/* Convex Provider envuelve toda la app */}
        <ConvexClientProvider>
          <Header />
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
