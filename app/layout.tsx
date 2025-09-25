import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Navbar from "./componentes/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
import { ReactNode } from "react";
import Header from "@/components/Header";


export const metadata: Metadata = {
  title: "ProSalud",
  description: "Sistema de gestión médica con Next.js + Convex",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        
    
        {/* Convex Provider envuelve toda la app */}
        <ConvexClientProvider>
          <Header />
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </ConvexClientProvider>
      </body>


    </html>
  );

}

