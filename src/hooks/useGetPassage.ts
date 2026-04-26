import { PassageData } from "@/types/passage";
import { useQuery } from "@tanstack/react-query";

export const useGetPassage = () => {
  return useQuery({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ["passage"],
    queryFn: async () => {
      const response = await fetch(`/api/passage?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error(`Failed to load passage: ${response.status}`);
      }

      return (await response.json()) as PassageData;
    },
  });
};
