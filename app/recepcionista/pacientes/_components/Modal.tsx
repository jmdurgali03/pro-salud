// app/recepcionista/pacientes/_components/Modal.tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW =
    size === "md" ? "max-w-xl" : size === "xl" ? "max-w-4xl" : "max-w-3xl";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={() => closeOnBackdrop && onClose()}
      />
      {/* Card */}
      <div
        ref={ref}
        className={clsx(
          "relative w-[92vw] rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl",
          "ring-1 ring-black/5",
          maxW
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* Helpers de inputs para estilos consistentes */
export const inputBase =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100";

export const selectBase =
  "block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100";

export const textareaBase =
  "block w-full min-h-[120px] resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100";

export function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Cancelar
    </button>
  );
}

export function PrimaryButton({
  disabled,
  children,
  onClick,
}: {
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm",
        disabled
          ? "bg-emerald-200"
          : "bg-emerald-600 hover:bg-emerald-700"
      )}
    >
      {children}
    </button>
  );
}
