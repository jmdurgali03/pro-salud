"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type HistoriasPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    totalItems: number;
};

export function HistoriasPagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    totalItems,
}: HistoriasPaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">
                    {startItem}-{endItem}
                </span>{" "}
                de <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
                pacientes
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const isCurrentPage = page === currentPage;
                        const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                                return (
                                    <span key={page} className="px-2 text-gray-400">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-all ${isCurrentPage
                                        ? "bg-green-500 text-white shadow-md"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Página siguiente"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
}