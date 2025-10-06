"use client";

import ProfesionalForm from "./ProfesionalForm";
import type { Profesional, ProfesionalInput } from "./page";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorText && (
            <div
              role="alert"
              className="rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorText}</span>
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
    </div>
  );
}