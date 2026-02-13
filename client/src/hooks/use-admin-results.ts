import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useAdminEditResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, score }: { id: number; score: number }) => {
      const res = await fetch(`/api/admin/results/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update result");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Result updated!", className: "bg-green-50 border-green-200 text-green-900" });
    },
  });
}

export function useAdminDeleteResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/results/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete result");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Result deleted!", className: "bg-red-50 border-red-200 text-red-900" });
    },
  });
}
