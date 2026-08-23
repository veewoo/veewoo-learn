"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import initialSentenceDataJson from "@/data/sentenceScrambleData.json";
import { BottomMenu } from "@/components/BottomMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SentencePair {
  id: number;
  japanese: string;
  english: string;
  englishWords: string[]; // Pre-split correct order
}

const initialSentenceData: SentencePair[] = initialSentenceDataJson;

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface WordToken {
  id: string; // Unique ID for dnd-kit
  text: string;
}

interface SortableWordProps {
  id: UniqueIdentifier;
  text: string;
  onClick?: () => void; // Optional click handler
}

function SortableWord({ id, text, onClick }: SortableWordProps) {
  const {
    attributes,
    listeners, // Use listeners from useSortable
    setNodeRef,
    transform,
    transition,
    isDragging, // Use isDragging from useSortable
  } = useSortable({ id });

  const style: React.CSSProperties = {
    // Define style based on useSortable values
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: "8px 12px",
    margin: "4px",
    backgroundColor: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    cursor: "grab", // Set cursor to grab as it's a draggable item
    touchAction: "none", // Important for mobile
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

export default function SentenceScramblePage() {
  const [sentenceData, setSentenceData] = useState<SentencePair[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [completedSentenceIds, setCompletedSentenceIds] = useState<Set<number>>(
    new Set(),
  );

  const [wordPool, setWordPool] = useState<WordToken[]>([]); // Words available to pick
  const [assembledWords, setAssembledWords] = useState<WordToken[]>([]); // Words user has picked

  const [feedback, setFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Load completed sentence IDs from localStorage on component mount
  useEffect(() => {
    const savedCompletedIds = localStorage.getItem(
      "sentence-scramble-completed",
    );
    if (savedCompletedIds) {
      try {
        const parsedIds = JSON.parse(savedCompletedIds) as number[];
        const completedSet = new Set(parsedIds);
        setCompletedSentenceIds(completedSet);

        // Filter out completed sentences
        const availableSentences = initialSentenceData.filter(
          (sentence) => !completedSet.has(sentence.id),
        );
        setSentenceData(availableSentences);
      } catch (error) {
        console.error(
          "Error parsing completed sentence IDs from localStorage:",
          error,
        );
        setSentenceData(initialSentenceData);
      }
    } else {
      setSentenceData(initialSentenceData);
    }
  }, []);

  // Update sentence data when completed IDs change
  useEffect(() => {
    const availableSentences = initialSentenceData.filter(
      (sentence) => !completedSentenceIds.has(sentence.id),
    );
    setSentenceData(availableSentences);

    // Reset to first available sentence if current index is out of bounds
    if (currentSentenceIndex >= availableSentences.length) {
      setCurrentSentenceIndex(0);
    }
  }, [completedSentenceIds, currentSentenceIndex]);

  const currentSentence = sentenceData[currentSentenceIndex];

  const initializeSentence = useCallback(() => {
    if (!currentSentence) return; // No sentences available

    const words = currentSentence.englishWords;
    const shuffled = shuffleArray(words);
    setWordPool(
      shuffled.map((word, index) => ({
        id: `pool-${currentSentence.id}-${index}-${word}`,
        text: word,
      })),
    );
    setAssembledWords([]);
    setFeedback("");
    setIsCorrect(null);
  }, [currentSentence]);

  useEffect(() => {
    initializeSentence();
  }, [currentSentenceIndex, initializeSentence]);

  const checkAnswer = () => {
    const assembledSentenceText = assembledWords
      .filter((w) => ![".", "?", ","].includes(w.text))
      .map((w) => w.text)
      .join(" ");

    if (
      assembledSentenceText ===
      currentSentence.english.replace(".", "").replace("?", "").replace(",", "")
    ) {
      setFeedback("Correct!");
      setIsCorrect(true);

      // Save completed sentence ID to localStorage
      const newCompletedIds = new Set(completedSentenceIds);
      newCompletedIds.add(currentSentence.id);
      setCompletedSentenceIds(newCompletedIds);

      // Save to localStorage
      localStorage.setItem(
        "sentence-scramble-completed",
        JSON.stringify(Array.from(newCompletedIds)),
      );
    } else {
      setFeedback("Incorrect. Try again!");
      setIsCorrect(false);
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < sentenceData.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      // Optionally, handle end of sentences (e.g., show a completion message or loop back)
      setCurrentSentenceIndex(0); // Loop back to the first sentence
    }
    // useEffect will then call initializeSentence
  };

  const resetCurrentSentence = () => {
    initializeSentence();
  };

  const clearAllAssembledWords = () => {
    // Move all assembled words back to the word pool
    setWordPool((prev) => [...prev, ...assembledWords]);
    setAssembledWords([]);
    setFeedback("");
    setIsCorrect(null);
  };

  const resetProgress = () => {
    setCompletedSentenceIds(new Set());
    localStorage.removeItem("sentence-scramble-completed");
    setCurrentSentenceIndex(0);
  };

  // If no sentences are available (all completed), show completion message
  if (sentenceData.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl mb-2">
              Sentence Scramble
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                🎉 Congratulations!
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                You&apos;ve completed all sentences! Great job!
              </p>
              <Button
                onClick={resetProgress}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl mb-2">
            Sentence Scramble
          </CardTitle>
          <div className="text-center text-sm text-muted-foreground mb-2">
            Progress: {completedSentenceIds.size} completed |{" "}
            {sentenceData.length} remaining
          </div>
          <p className="text-center text-3xl font-semibold my-4 p-4 bg-muted rounded-md">
            {currentSentence.japanese}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-center flex-1">
                Assemble the English sentence:
              </h3>
              {assembledWords.length > 0 && (
                <Button
                  onClick={clearAllAssembledWords}
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div
              id="assembled-words-container"
              className="min-h-[60px] p-3 border-2 border-dashed border-blue-400 rounded-md bg-blue-50 dark:bg-blue-950 flex flex-wrap justify-center items-center"
            >
              {assembledWords.length > 0 ? (
                assembledWords.map((word) => (
                  <SortableWord
                    key={word.id}
                    id={word.id}
                    text={word.text}
                    onClick={() => {
                      setWordPool((prev) => [
                        ...prev,
                        { id: word.id, text: word.text },
                      ]);
                      setAssembledWords((prev) =>
                        prev.filter((w) => w.id !== word.id),
                      );
                    }}
                  />
                ))
              ) : (
                <span className="text-muted-foreground">Drag words here</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-center">
              Available words:
            </h3>
            <div
              id="word-pool-container"
              className="min-h-[60px] p-3 border-2 border-dashed border-border rounded-md bg-muted flex flex-wrap justify-center items-center"
            >
              {wordPool.map((word) => (
                <SortableWord
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  onClick={() => {
                    setAssembledWords((prev) => [
                      ...prev,
                      { id: word.id, text: word.text },
                    ]);
                    setWordPool((prev) => prev.filter((w) => w.id !== word.id));
                  }}
                />
              ))}
            </div>
          </div>

          {feedback && (
            <p
              className={`text-center my-3 text-lg ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {feedback}
            </p>
          )}
          {currentSentence.english && (
            <div className="mb-6">
              <Dialog>
                <DialogTrigger>Show English sentence</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>English sentence</DialogTitle>
                    <DialogDescription>
                      {currentSentence.english}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button
            onClick={checkAnswer}
            disabled={assembledWords.length === 0 || isCorrect === true}
            className="w-full sm:w-auto"
          >
            Check Answer
          </Button>
          <Button
            onClick={resetCurrentSentence}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          {isCorrect && (
            <Button
              onClick={nextSentence}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
            >
              Next Sentence
            </Button>
          )}
          <Button
            onClick={resetProgress}
            variant="outline"
            className="w-full sm:w-auto text-red-600 hover:text-red-700"
          >
            Reset Progress
          </Button>
        </CardFooter>
      </Card>
      <BottomMenu />
    </div>
  );
}
