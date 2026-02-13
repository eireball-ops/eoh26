import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Contestant, type Discipline } from "@shared/schema";

export type ContestantWithDisciplines = Contestant & { disciplines: Discipline[] };

export function useContestants() {
  return useQuery<ContestantWithDisciplines[]>({
    queryKey: [api.contestants.list.path],
    queryFn: async () => {
      const res = await fetch(api.contestants.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contestants");
      // No zod validation here, just trust backend shape
      return await res.json();
    },
  });
}
