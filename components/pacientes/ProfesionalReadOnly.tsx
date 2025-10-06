"use client";
import React from "react";

export default function ProfesionalReadOnly({
  label = "Profesional",
  value,
}: { label?: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
        value={value}
        disabled
        readOnly
      />
    </div>
  );
}
