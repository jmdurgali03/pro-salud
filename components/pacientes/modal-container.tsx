"use client";

import { X } from "lucide-react";

type ModalContainerProps = {
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

export function ModalContainer({
  children,
  onClose,
  maxWidthClassName = "max-w-2xl",
}: ModalContainerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl p-8 w-full ${maxWidthClassName} relative shadow-2xl animate-in zoom-in-95 duration-200`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
