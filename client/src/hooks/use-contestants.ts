import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Contestant } from "@shared/schema";

export function useContestants() {
  return useQuery({
    queryKey: [api.contestants.list.path],
    queryFn: async () => {
      const res = await fetch(api.contestants.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contestants");
      return api.contestants.list.responses[200].parse(await res.json());
    },
  });
}
