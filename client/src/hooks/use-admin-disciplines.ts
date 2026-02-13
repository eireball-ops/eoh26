import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation(
    async ({ id, name, icon }: { id: number; name: string; icon: string }) => {
      const res = await fetch(`/api/admin/disciplines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update discipline");
      return await res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast({ title: "Discipline updated!", className: "bg-green-50 border-green-200 text-green-900" });
      },
    }
  );
}

  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation(
    async (id: number) => {
      const res = await fetch(`/api/admin/disciplines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete discipline");
      return await res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast({ title: "Discipline deleted!", className: "bg-red-50 border-red-200 text-red-900" });
      },
    }
  );
}
