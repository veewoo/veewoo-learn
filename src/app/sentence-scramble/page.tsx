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
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
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
    new Set()
  );

  const [wordPool, setWordPool] = useState<WordToken[]>([]); // Words available to pick
  const [assembledWords, setAssembledWords] = useState<WordToken[]>([]); // Words user has picked

  const [feedback, setFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Load completed sentence IDs from localStorage on component mount
  useEffect(() => {
    const savedCompletedIds = localStorage.getItem(
      "sentence-scramble-completed"
    );
    if (savedCompletedIds) {
      try {
        const parsedIds = JSON.parse(savedCompletedIds) as number[];
        const completedSet = new Set(parsedIds);
        setCompletedSentenceIds(completedSet);

        // Filter out completed sentences
        const availableSentences = initialSentenceData.filter(
          (sentence) => !completedSet.has(sentence.id)
        );
        setSentenceData(availableSentences);
      } catch (error) {
        console.error(
          "Error parsing completed sentence IDs from localStorage:",
          error
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
      (sentence) => !completedSentenceIds.has(sentence.id)
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
      }))
    );
    setAssembledWords([]);
    setFeedback("");
    setIsCorrect(null);
  }, [currentSentence]);

  useEffect(() => {
    initializeSentence();
  }, [currentSentenceIndex, initializeSentence]);

  // function handleDragEnd(event: DragEndEvent) {
  //   const { active, over } = event;

  //   if (!over) return;

  //   // Get the container/context IDs
  //   const activeContainer = active.data.current?.sortable?.containerId;
  //   const overContainer = over.data.current?.sortable?.containerId;

  //   console.log("activeContainer", activeContainer);
  //   console.log("overContainer", overContainer);

  //   if (active.id !== over.id) {
  //     // setAssembledWords((items) => {
  //     //   const oldIndex = items.findIndex((item) => item.id === active.id);
  //     //   const newIndex = items.findIndex((item) => item.id === over.id);
  //     //   return arrayMove(items, oldIndex, newIndex);
  //     // });
  //     //       setAssembledWords((items) => {
  //     //         const oldIndex = items.findIndex((item) => item.id === activeId);
  //     //         const newIndex = items.findIndex((item) => item.id === overId);
  //     //         if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
  //     //           return arrayMove(items, oldIndex, newIndex);
  //     //         }
  //     //         return items;
  //     //       });
  //   }
  // }

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over, delta } = event;

  //   console.log("active", active);
  //   console.log("over", over);
  //   console.log("delta", delta);

  //   if (!over) return;

  //   const activeId = active.id as string;
  //   const overId = over.id as string; // This can be an item ID, SortableContext ID, or DOM element ID

  //   const activeContainer = active.data.current?.sortable.containerId;
  //   let overContainerLogicId: string | undefined;

  //   console.log("activeId", activeId);
  //   console.log("activeContainer", activeContainer);

  //   // Determine the logical container ID of the drop target
  //   if (over.data.current?.sortable?.containerId) {
  //     // Case 1: Dropped directly onto a sortable item.
  //     // The item's data tells us its container.
  //     overContainerLogicId = over.data.current.sortable.containerId;
  //   } else {
  //     // Case 2: Not dropped onto a specific sortable item.
  //     // Check if over.id matches known SortableContext IDs or their wrapper DIV IDs.
  //     if (
  //       overId === "assembled-words-sortable" ||
  //       overId === "assembled-words-container"
  //     ) {
  //       overContainerLogicId = "assembled-words-sortable";
  //     } else if (
  //       overId === "word-pool-sortable" ||
  //       overId === "word-pool-container"
  //     ) {
  //       overContainerLogicId = "word-pool-sortable";
  //     }
  //   }

  //   if (!activeContainer || !overContainerLogicId) {
  //     console.warn("Could not determine valid D&D logical containers:", {
  //       activeId,
  //       activeContainer,
  //       overId,
  //       overData: over.data.current,
  //       resolvedOverContainerLogicId: overContainerLogicId,
  //     });
  //     return;
  //   }

  //   const itemToMove = [...wordPool, ...assembledWords].find(
  //     (item) => item.id === activeId
  //   );
  //   console.log("itemToMove", itemToMove);
  //   if (!itemToMove) return;

  //   if (activeContainer === overContainerLogicId) {
  //     // Reordering within the same list
  //     if (activeContainer === "assembled-words-sortable") {
  //       console.log("case 1");
  //       setAssembledWords((items) => {
  //         const oldIndex = items.findIndex((item) => item.id === activeId);
  //         const newIndex = items.findIndex((item) => item.id === overId);
  //         if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
  //           return arrayMove(items, oldIndex, newIndex);
  //         }
  //         return items;
  //       });
  //     } else if (activeContainer === "word-pool-sortable") {
  //       console.log("case 2");
  //       setWordPool((items) => {
  //         const oldIndex = items.findIndex((item) => item.id === activeId);
  //         const newIndex = items.findIndex((item) => item.id === overId);
  //         if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
  //           return arrayMove(items, oldIndex, newIndex);
  //         }
  //         return items;
  //       });
  //     }
  //   } else {
  //     // Moving between lists
  //     // Remove from the source list
  //     if (activeContainer === "word-pool-sortable") {
  //       console.log("case 3");
  //       setWordPool((prev) => prev.filter((item) => item.id !== activeId));
  //     } else if (activeContainer === "assembled-words-sortable") {
  //       console.log("case 4");
  //       setAssembledWords((prev) =>
  //         prev.filter((item) => item.id !== activeId)
  //       );
  //     }

  //     // Add to the destination list
  //     if (overContainerLogicId === "assembled-words-sortable") {
  //       console.log("case 5");
  //       setAssembledWords((prev) => {
  //         const targetItemIndex = prev.findIndex((item) => item.id === overId);
  //         const newAssembled = [...prev];
  //         if (targetItemIndex !== -1) {
  //           // Dropped on an existing item in the destination list
  //           newAssembled.splice(targetItemIndex, 0, itemToMove);
  //         } else {
  //           // Dropped on the container/empty space, or overId didn't match any item ID
  //           newAssembled.push(itemToMove);
  //         }
  //         return newAssembled;
  //       });
  //     } else if (overContainerLogicId === "word-pool-sortable") {
  //       console.log("case 6");
  //       setWordPool((prev) => {
  //         const targetItemIndex = prev.findIndex((item) => item.id === overId);
  //         const newPool = [...prev];
  //         if (targetItemIndex !== -1) {
  //           newPool.splice(targetItemIndex, 0, itemToMove);
  //         } else {
  //           newPool.push(itemToMove);
  //         }
  //         return newPool;
  //       });
  //     }
  //   }
  // };

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
        JSON.stringify(Array.from(newCompletedIds))
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
              <p className="text-lg text-gray-600 mb-6">
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
          <div className="text-center text-sm text-gray-500 mb-2">
            Progress: {completedSentenceIds.size} completed |{" "}
            {sentenceData.length} remaining
          </div>
          <p className="text-center text-3xl font-semibold my-4 p-4 bg-gray-100 rounded-md">
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
              className="min-h-[60px] p-3 border-2 border-dashed border-blue-400 rounded-md bg-blue-50 flex flex-wrap justify-center items-center"
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
                        prev.filter((w) => w.id !== word.id)
                      );
                    }}
                  />
                ))
              ) : (
                <span className="text-gray-400">Drag words here</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-center">
              Available words:
            </h3>
            <div
              id="word-pool-container"
              className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-wrap justify-center items-center"
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
