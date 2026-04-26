"use client";

import React, { useEffect, useState } from "react";
import Flashcards from "@/components/Flashcards";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;
const LOCAL_STORAGE_KEY = "flashcardSetIndex";

type CardData = {
  word: string;
  reading: string;
  meaning: string;
  sentence?: string;
};

type ApiResponse = {
  data: Array<{
    expression: string | null;
    reading: string | null;
    meaning: string | null;
    sentence: string | null;
  }>;
  totalCount: number | null;
  error?: string;
};

export default function FlashcardsPage() {
  const [setIndex, setSetIndex] = useState(0);

  // Load setIndex from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setSetIndex(Number(stored));
    }
  }, []);

  // Save setIndex to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, setIndex.toString());
  }, [setIndex]);

  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["flashcards", setIndex],
    queryFn: async () => {
      const res = await fetch(
        `/api/flashcards?setIndex=${setIndex}&pageSize=${PAGE_SIZE}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      return res.json();
    },
    placeholderData: { data: [], totalCount: null },
  });

  const cards: CardData[] =
    (apiData?.data ?? []).map((w: {
      expression: string | null;
      reading: string | null;
      meaning: string | null;
      sentence: string | null;
    }) => ({
      word: w.expression || "",
      reading: w.reading || "",
      meaning: w.meaning || "",
      sentence: w.sentence || undefined,
    }));

  const totalCount = apiData?.totalCount ?? null;

  const handlePrevSet = () => {
    setSetIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleNextSet = () => {
    if (totalCount !== null) {
      const maxSet = Math.floor((totalCount - 1) / PAGE_SIZE);
      setSetIndex((prev) => Math.min(maxSet, prev + 1));
    } else {
      setSetIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevSet} disabled={setIndex === 0}>
          Previous 10
        </Button>
        <span>
          Set {setIndex + 1}
          {totalCount !== null && (
            <> / {Math.ceil(totalCount / PAGE_SIZE)}</>
          )}
        </span>
        <Button
          onClick={handleNextSet}
          disabled={
            totalCount !== null && setIndex >= Math.floor((totalCount - 1) / PAGE_SIZE)
          }
        >
          Next 10
        </Button>
      </div>
      <Flashcards cards={cards} isLoading={isLoading} error={error as Error | null} />
    </div>
  );
} 