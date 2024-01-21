import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { Staff } from "@shared/types";

import { filterByTreatment } from "../utils";

import { axiosInstance } from "@/axiosInstance";
import { queryKeys } from "@/react-query/constants";

// query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get("/staff");
  return data;
}

export function useStaff() {
  // for filtering staff by treatment
  const [filter, setFilter] = useState("all");

  // select function to filter treatments by staff treatments
  const selectFn = useCallback(
    (unfilteredSatff: Staff[]) => {
      if (filter === "all") return unfilteredSatff;
      return filterByTreatment(unfilteredSatff, filter);
    },
    [filter]
  );

  const fallback: Staff[] = [];

  // get data from server via useQuery
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.staff],
    queryFn: getStaff,
    select: (data) => selectFn(data),
  });

  return { staff: data, filter, setFilter };
}
