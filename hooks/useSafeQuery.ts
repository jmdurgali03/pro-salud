import { useQuery } from "convex/react";

export function useSafeQuery(queryFn: any, args: any) {
  try {
    const data = useQuery(queryFn, args);
    return { data, error: null };
  } catch (err: any) {
    console.error("Convex query error:", err);
    return { data: null, error: err };
  }
}
