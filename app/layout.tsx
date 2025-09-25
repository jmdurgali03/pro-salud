import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Navbar from "./componentes/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HealthConnect",
  description: "Sistema de gestión médica",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} bg-gray-50 text-gray-900`}>
        <ConvexClientProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto p-6" >{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
