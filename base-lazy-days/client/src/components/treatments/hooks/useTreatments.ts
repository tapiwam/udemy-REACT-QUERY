import { useQuery } from "@tanstack/react-query";

import type { Treatment } from "@shared/types";

import { axiosInstance } from "@/axiosInstance";
import { queryKeys } from "@/react-query/constants";

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get("/treatments");
  return data;
}

export function useTreatments(): Treatment[] {
  const fallback: Treatment[] = [];

  // Get data from server via useQuery
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,

    // Suppress refetching for data that does not change often
    staleTime: 1000 * 60 * 10, // 10 mins in ms
    gcTime: 1000 * 60 * 15, // 15 mins in ms
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return data || [];
}
