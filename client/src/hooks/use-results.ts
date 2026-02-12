import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateResultRequest, type Result, type LeaderboardEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useResults(disciplineId?: number) {
  return useQuery({
    queryKey: [api.results.list.path, disciplineId],
    queryFn: async () => {
      // Build URL with optional query param for filtering
      let url = api.results.list.path;
      if (disciplineId) {
        url += `?disciplineId=${disciplineId}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch results");
      return api.results.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateResultRequest) => {
      const res = await fetch(api.results.create.path, {
        method: api.results.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 409) {
          const error = api.results.create.responses[409].parse(await res.json());
          throw new Error(error.message); // "nuh uh ya cant roll twice"
        }
        if (res.status === 400) {
          const error = api.results.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit result");
      }
      return api.results.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.list.path] });
    },
    onError: (error) => {
      // 409 errors are handled in UI usually, but good to have a backup toast
      if (error.message.includes("nuh uh")) {
         // let the UI handle the specific popup if desired, or show toast here
      }
    }
  });
}
