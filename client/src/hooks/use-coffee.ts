import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Coffee } from "@shared/schema";

export function useCoffee() {
  return useQuery({
    queryKey: [api.coffees.get.path],
    queryFn: async () => {
      const res = await fetch(api.coffees.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch coffee count");
      return api.coffees.get.responses[200].parse(await res.json());
    },
  });
}

export function useIncrementCoffee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.coffees.increment.path, {
        method: api.coffees.increment.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to increment coffee");
      return api.coffees.increment.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coffees.get.path] });
    },
  });
}
