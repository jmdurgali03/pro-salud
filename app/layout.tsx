import "./globals.css";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Cargar Inter (sans) y Roboto Mono directamente desde Google Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});
import { ReactNode } from "react";
import Header from "@/components/Header";
import ConvexClientProvider from "@/components/convex-client-provider";

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

