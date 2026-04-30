import { useMutation } from "@tanstack/react-query";

export const useFinishPassage = (id: number | undefined) => {
  return useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("ID is required");
      }

      const response = await fetch("/api/passage/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to finish passage: ${response.status}`);
      }

      return response.json();
    },
  });
};
