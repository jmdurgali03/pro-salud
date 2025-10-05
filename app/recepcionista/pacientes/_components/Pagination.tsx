"use client";

export default function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  const prev = () => go(page - 1);
  const next = () => go(page + 1);

  // numeración compacta máx 7 botones
  const buttons: number[] = [];
  const maxBtns = 7;
  let start = Math.max(1, page - 3);
  let end = Math.min(pageCount, start + maxBtns - 1);
  start = Math.max(1, end - maxBtns + 1);
  for (let p = start; p <= end; p++) buttons.push(p);

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        onClick={prev}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === 1}
      >
        Anterior
      </button>

      {start > 1 && (
        <>
          <Dot onClick={() => go(1)} active={page === 1}>
            1
          </Dot>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {buttons.map((p) => (
        <Dot key={p} onClick={() => go(p)} active={p === page}>
          {p}
        </Dot>
      ))}

      {end < pageCount && (
        <>
          {end < pageCount - 1 && <span className="px-1 text-gray-400">…</span>}
          <Dot onClick={() => go(pageCount)} active={page === pageCount}>
            {pageCount}
          </Dot>
        </>
      )}

      <button
        onClick={next}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === pageCount}
      >
        Siguiente
      </button>
    </div>
  );
}

function Dot({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm transition",
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
