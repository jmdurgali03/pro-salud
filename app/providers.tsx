"use client";
import { ConvexProvider } from "convex/react";
import { convex } from "./convexClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
