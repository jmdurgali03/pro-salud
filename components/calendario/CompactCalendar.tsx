"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

type Props = {
  mode: "day" | "week" | "month";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
};

export default function CompactCalendar({ mode, selected, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        locale={es}
        className="rounded-md border shadow-sm"
      />
    </div>
  );
}
