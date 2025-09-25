"use client";
import { ConvexReactClient } from "convex/react";

const address = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!address) {
  throw new Error("Falta NEXT_PUBLIC_CONVEX_URL en .env.local");
}

export const convex = new ConvexReactClient(address);
