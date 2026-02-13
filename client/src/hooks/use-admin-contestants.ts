import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useAdminEditContestant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, name, country, skillMultiplier, multiplierText }) => {
      const res = await fetch(`/api/admin/contestants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, skillMultiplier, multiplierText }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update contestant");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Contestant updated!", className: "bg-green-50 border-green-200 text-green-900" });
    },
  });
}

export function useAdminDeleteContestant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/contestants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete contestant");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Contestant deleted!", className: "bg-red-50 border-red-200 text-red-900" });
    },
  });
}
