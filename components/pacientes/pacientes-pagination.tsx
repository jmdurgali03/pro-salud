"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_VISIBLE_PAGES = 7;

type PacientesPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
};

export function PacientesPagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PacientesPaginationProps) {
  if (totalPages <= 1) return null;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | "ellipsis"> = [];

    const addRange = (startPage: number, endPage: number) => {
      for (let page = startPage; page <= endPage; page += 1) {
        pages.push(page);
      }
    };

    pages.push(1);

    if (currentPage <= 4) {
      addRange(2, 5);
      pages.push("ellipsis");
    } else if (currentPage >= totalPages - 3) {
      pages.push("ellipsis");
      addRange(totalPages - 4, totalPages - 1);
    } else {
      pages.push("ellipsis");
      addRange(currentPage - 1, currentPage + 1);
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex flex-col gap-4 items-center justify-between py-4 sm:flex-row">
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-semibold text-gray-800">{start}-{end}</span> de
        <span className="font-semibold text-gray-800"> {totalItems}</span> pacientes
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-green-500 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
