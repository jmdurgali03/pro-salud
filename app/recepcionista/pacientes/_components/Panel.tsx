// app/recepcionista/pacientes/_components/Panel.tsx
"use client";
import React from "react";

export default function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {children}
    </div>
  );
}
