"use client";

import ProfesionalForm from "./ProfesionalForm";
import type { Profesional, ProfesionalInput } from "./page";

type Props = {
  title: string;
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput) => void;
  onCancel: () => void;
  errorText?: string;
  loading?: boolean;
  onClientError?: (msg: string | null) => void;
};

export default function ProfesionalModal({
  title,
  initialData,
  onSubmit,
  onCancel,
  errorText,
  loading,
  onClientError,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg shadow-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>

        {errorText && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {errorText}
          </div>
        )}

        <ProfesionalForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitting={!!loading}
          onClientError={onClientError}
        />
      </div>
    </div>
  );
}
