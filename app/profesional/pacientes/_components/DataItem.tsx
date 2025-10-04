"use client";
import React from "react";

export default function DataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}
