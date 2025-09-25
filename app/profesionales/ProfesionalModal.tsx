"use client";

import ProfesionalForm from "./ProfesionalForm";
import type { Profesional } from "./page";

type Props = {
  title: string;
  initialData?: Profesional;
  onSubmit: (data: Profesional) => void;
  onCancel: () => void;
};

export default function ProfesionalModal({ title, initialData, onSubmit, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  <div className="bg-gray-900 text-white rounded-lg shadow-xl p-6 w-96 space-y-4">

        <h2 className="text-lg font-bold">{title}</h2>
        <ProfesionalForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} />
      </div>
    </div>
  );
}
