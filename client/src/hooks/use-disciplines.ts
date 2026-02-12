import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Discipline } from "@shared/schema";

export function useDisciplines() {
  return useQuery({
    queryKey: [api.disciplines.list.path],
    queryFn: async () => {
      const res = await fetch(api.disciplines.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch disciplines");
      return api.disciplines.list.responses[200].parse(await res.json());
    },
  });
}
