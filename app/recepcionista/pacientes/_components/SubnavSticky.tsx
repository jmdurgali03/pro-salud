// app/recepcionista/pacientes/_components/SubnavSticky.tsx
"use client";

export default function SubnavSticky({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <div className="sticky top-0 z-30 mt-4 border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-2">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {i.label}
          </a>
        ))}
      </div>
    </div>
  );
}
