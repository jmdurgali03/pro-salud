"use client";

import React from "react";

export type BigTabItem = {
  key: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  helper?: string;
};

export default function BigTabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: BigTabItem[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ key, label, icon: Icon, helper }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={[
              "group relative w-full rounded-2xl border px-4 py-4 text-left transition-all",
              "shadow-sm hover:shadow-md",
              active
                ? "border-emerald-200 bg-emerald-50"
                : "border-gray-200 bg-white hover:bg-gray-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl shadow-inner",
                  active
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 group-hover:bg-gray-200",
                ].join(" ")}
              >
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </div>
              <div>
                <div
                  className={[
                    "text-base font-semibold",
                    active ? "text-emerald-800" : "text-gray-900",
                  ].join(" ")}
                >
                  {label}
                </div>
                {helper && <div className="text-xs text-gray-500">{helper}</div>}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/0 group-hover:ring-black/5 transition" />
          </button>
        );
      })}
    </div>
  );
}
