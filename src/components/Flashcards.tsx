"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ReloadIcon,
  GridIcon,
  ViewVerticalIcon,
  SpeakerLoudIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckIcon,
  CrossCircledIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { useWebSpeech } from "@/hooks/useWebSpeech";
import { BottomMenu } from "./BottomMenu";
import { Badge } from "./ui/badge";

interface CardData {
  word: string;
  reading: string;
  meaning: string;
  sentence?: string;
}

// Define props for the component
interface FlashcardsProps {
  cards: CardData[];
  isLoading: boolean;
  error: Error | null;
}

export default function Flashcards({
  cards,
  isLoading,
  error,
}: FlashcardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledKanji, setShuffledKanji] = useState<CardData[]>([]);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  // New state for tracking known cards
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Web Speech API hook
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported } =
    useWebSpeech({
      defaultRate: 0.5, // Slower for kanji pronunciation
    });

  // Shuffle the kanji list when passageData changes
  useEffect(() => {
    if (cards) {
      setShuffledKanji(cards.sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setKnownCards(new Set());
      setUnknownCards(new Set());
      setShowCompletionScreen(false);
    } else {
      // Reset state if passageData is null or has no kanji_list, and not in loading state
      setShuffledKanji([]);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setKnownCards(new Set());
      setUnknownCards(new Set());
      setShowCompletionScreen(false);
    }
  }, [cards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewMode === "single") {
        switch (event.key) {
          case "ArrowRight":
            if (currentCardIndex < shuffledKanji.length - 1) {
              setCurrentCardIndex(currentCardIndex + 1);
              setShowAnswer(false);
            }
            break;
          case "ArrowLeft":
            if (currentCardIndex > 0) {
              setCurrentCardIndex(currentCardIndex - 1);
              setShowAnswer(false);
            }
            break;
          case " ": // Space key
            setShowAnswer(!showAnswer);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCardIndex, shuffledKanji.length, showAnswer, viewMode]);

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKnown = () => {
    const newKnown = new Set(knownCards);
    const newUnknown = new Set(unknownCards);

    newKnown.add(currentCardIndex);
    newUnknown.delete(currentCardIndex);

    setKnownCards(newKnown);
    setUnknownCards(newUnknown);

    // Move to next card or show completion
    moveToNextCardOrComplete();
  };

  const handleUnknown = () => {
    const newKnown = new Set(knownCards);
    const newUnknown = new Set(unknownCards);

    newUnknown.add(currentCardIndex);
    newKnown.delete(currentCardIndex);

    setKnownCards(newKnown);
    setUnknownCards(newUnknown);

    // Move to next card or show completion
    moveToNextCardOrComplete();
  };

  const moveToNextCardOrComplete = () => {
    if (currentCardIndex < shuffledKanji.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Check if all cards have been categorized
      const totalCategorized = knownCards.size + unknownCards.size + 1; // +1 for current card
      if (totalCategorized >= shuffledKanji.length) {
        setShowCompletionScreen(true);
      }
    }
  };

  const continueWithKnown = () => {
    const knownIndices = Array.from(knownCards);
    const knownKanji = knownIndices.map((index) => shuffledKanji[index]);
    setShuffledKanji(knownKanji);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setShowCompletionScreen(false);
  };

  const continueWithUnknown = () => {
    const unknownIndices = Array.from(unknownCards);
    const unknownKanji = unknownIndices.map((index) => shuffledKanji[index]);
    setShuffledKanji(unknownKanji);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setShowCompletionScreen(false);
  };

  const continueWithAllWords = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setShowCompletionScreen(false);
  };

  const handleShuffleCards = () => {
    setShuffledKanji([...shuffledKanji].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setShowCompletionScreen(false);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "single" ? "grid" : "single");
    setShowAnswer(false);
  };

  const handleSpeakKanji = (kanji: string) => {
    if (!isSupported) return;

    // Speak both kanji and reading
    const textToSpeak = `${kanji}`;
    speak(textToSpeak);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      // Speak current card
      if (shuffledKanji.length > 0 && shuffledKanji[currentCardIndex]) {
        const current = shuffledKanji[currentCardIndex];
        handleSpeakKanji(current.word);
      }
    }
  };

  const stopSpeech = () => {
    cancel();
  };

  function handleOpenMazii(): void {
    navigator.clipboard
      .writeText(shuffledKanji[currentCardIndex]?.word || "")
      .then(() => {
        window.location.href = "mazii://";
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        // Fallback or error handling if needed,
        // still navigate to mazii
        window.location.href = "mazii://";
      });
  }

  function handleOpenGoogleSearch(): void {
    const word = shuffledKanji[currentCardIndex]?.word || "";
    const meaning = shuffledKanji[currentCardIndex]?.meaning || "";
    const searchQuery = `${word} (${meaning})`;
    const searchUrl = `https://www.google.co.jp/search?q=${encodeURIComponent(
      searchQuery
    )}`;
    window.open(searchUrl, "_blank");
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="shadow-lg">
        {isLoading ? (
          <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <ReloadIcon className="h-4 w-4 animate-spin" />
              <p>Loading flashcards...</p>
            </div>
          </CardContent>
        ) : error ? (
          <CardContent className="pt-6 text-red-500">
            <p>Error: {(error as Error).message}</p>
          </CardContent>
        ) : !cards || shuffledKanji.length === 0 ? (
          <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
            <p className="mb-4">
              {cards === null && !isLoading
                ? "No data loaded."
                : "No cards available."}
            </p>
          </CardContent>
        ) : showCompletionScreen ? (
          <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="max-w-md">
              <h3 className="text-2xl font-bold mb-4">Session Complete!</h3>
              <div className="mb-6 text-sm text-gray-600">
                <p>Known: {knownCards.size} cards</p>
                <p>Unknown: {unknownCards.size} cards</p>
              </div>
              <div className="flex flex-col gap-3">
                {knownCards.size > 0 && (
                  <Button
                    onClick={continueWithKnown}
                    className="w-full bg-green-500"
                  >
                    Continue with Known Words ({knownCards.size})
                  </Button>
                )}
                {unknownCards.size > 0 && (
                  <Button
                    onClick={continueWithUnknown}
                    className="w-full bg-red-500"
                  >
                    Continue with Unknown Words ({unknownCards.size})
                  </Button>
                )}
                <Button
                  onClick={continueWithAllWords}
                  variant="outline"
                  className="w-full"
                >
                  Continue with All Words ({shuffledKanji.length})
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="pt-4 pb-4 flex flex-col items-center">
              <div className="flex justify-between w-full max-w-md mb-2">
                <span className="text-sm text-gray-500">
                  {viewMode === "single"
                    ? `Card ${currentCardIndex + 1} of ${shuffledKanji.length}`
                    : `${shuffledKanji.length} Kanji Cards`}
                </span>
                {viewMode === "single" && (
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className="text-green-600">✓ {knownCards.size}</span>
                    <span className="text-red-600">✗ {unknownCards.size}</span>
                  </div>
                )}
                <Button
                  onClick={toggleViewMode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {viewMode === "single" ? (
                    <>
                      <GridIcon className="h-4 w-4" />
                      <span>Grid View</span>
                    </>
                  ) : (
                    <>
                      <ViewVerticalIcon className="h-4 w-4" />
                      <span>Card View</span>
                    </>
                  )}
                </Button>
              </div>

              {viewMode === "single" && (
                <>
                  {/* Progress bar */}
                  <div className="w-full max-w-md mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      {/* Background for current position */}
                      <div
                        className="bg-blue-300 h-3 rounded-full absolute left-0"
                        style={{
                          width: `${
                            ((currentCardIndex + 1) / shuffledKanji.length) *
                            100
                          }%`,
                          transition: "width 0.3s ease-in-out",
                        }}
                      ></div>
                      {/* Green bar for known cards */}
                      <div className="absolute inset-0 flex">
                        {Array.from(
                          { length: shuffledKanji.length },
                          (_, index) => {
                            const isKnown = knownCards.has(index);
                            const isUnknown = unknownCards.has(index);
                            const isCurrent = index === currentCardIndex;

                            return (
                              <div
                                key={index}
                                className={`flex-1 h-3 border-r border-white border-opacity-20 ${
                                  isCurrent
                                    ? "bg-blue-500"
                                    : isKnown
                                    ? "bg-green-500"
                                    : isUnknown
                                    ? "bg-red-500"
                                    : "bg-transparent"
                                }`}
                                style={{
                                  transition:
                                    "background-color 0.3s ease-in-out",
                                }}
                              />
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Progress</span>
                      <span>
                        {knownCards.size + unknownCards.size} /{" "}
                        {shuffledKanji.length} categorized
                      </span>
                    </div>
                  </div>

                  {/* Single Flashcard */}
                  <Card
                    className="w-full max-w-md min-h-[320px]"
                    onClick={handleFlipCard}
                  >
                    <CardContent className="grow flex flex-col">
                      {/* Status indicator */}
                      {(knownCards.has(currentCardIndex) ||
                        unknownCards.has(currentCardIndex)) && (
                        <Badge
                          className={
                            knownCards.has(currentCardIndex)
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {knownCards.has(currentCardIndex)
                            ? "Known"
                            : "Unknown"}
                        </Badge>
                      )}
                      <div className="grow flex flex-col items-center justify-center">
                        {showAnswer ? (
                          <>
                            <p className="text-2xl font-semibold mb-2 text-center">
                              {shuffledKanji[currentCardIndex]?.meaning}
                            </p>
                            <p className="text-2xl font-semibold mb-2 text-center">
                              {shuffledKanji[currentCardIndex]?.reading}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-7xl font-bold mb-4 text-center">
                              {shuffledKanji[currentCardIndex]?.word}
                            </p>
                            {shuffledKanji[currentCardIndex]?.sentence && (
                              <p className="text-2xl font-semibold mb-2 text-center">
                                {shuffledKanji[currentCardIndex]?.sentence}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation buttons */}
                  <div className="flex flex-col items-center w-full max-w-md mt-4 gap-4">
                    {/* Remember/Not Remember buttons - shown only when answer is visible */}
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={handleUnknown}
                        variant="outline"
                        className="flex-1 flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <CrossCircledIcon className="h-4 w-4" />
                        Unknown
                      </Button>
                      <Button
                        onClick={handleKnown}
                        className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Known
                      </Button>
                    </div>

                    {/* Speech controls */}
                    <div className="flex gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handlePreviousCard}
                        disabled={currentCardIndex === 0}
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                      </Button>
                      {isSupported && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={toggleSpeech}
                            disabled={!shuffledKanji[currentCardIndex]}
                          >
                            {isSpeaking ? (
                              isPaused ? (
                                <PlayIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <PauseIcon className="h-4 w-4 mr-1" />
                              )
                            ) : (
                              <SpeakerLoudIcon className="h-4 w-4 mr-1" />
                            )}
                          </Button>
                          {isSpeaking && (
                            <Button
                              onClick={stopSpeech}
                              variant="outline"
                              size="sm"
                            >
                              <StopIcon className="h-4 w-4 mr-1" />
                              Stop
                            </Button>
                          )}
                        </>
                      )}
                      {viewMode === "single" && (
                        <Button
                          size="icon"
                          variant="outline"
                          title="Search on Google"
                          onClick={handleOpenGoogleSearch}
                        >
                          <Image
                            src="https://www.svgrepo.com/show/380993/google-logo-search-new.svg"
                            alt="Google Search"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {viewMode === "grid" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                  {shuffledKanji.map((kanjiItem, index) => {
                    const isKnown = knownCards.has(index);
                    const isUnknown = unknownCards.has(index);

                    return (
                      <div
                        key={index}
                        className={`h-40 cursor-pointer hover:shadow-lg transition-all border rounded-lg bg-white relative ${
                          isKnown
                            ? "border-green-300 bg-green-50"
                            : isUnknown
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => {
                          setCurrentCardIndex(index);
                          setViewMode("single");
                        }}
                      >
                        {/* Status indicator for grid view */}
                        {(isKnown || isUnknown) && (
                          <div
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              isKnown ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {isKnown ? "✓" : "✗"}
                          </div>
                        )}

                        <div className="p-4 flex flex-col items-center justify-center h-full">
                          <div className="text-4xl font-bold mb-2">
                            {kanjiItem.word}
                          </div>
                          <div className="text-sm text-gray-500">
                            {kanjiItem.reading}
                          </div>
                        </div>
                        {isSupported && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeakKanji(kanjiItem.word);
                            }}
                            variant="ghost"
                            size="sm"
                            className="absolute bottom-1 right-1 h-6 w-6 p-0"
                          >
                            <SpeakerLoudIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between py-6">
              {viewMode === "single" ? (
                <Button onClick={handleShuffleCards}>Shuffle</Button>
              ) : (
                <Button onClick={handleShuffleCards} variant="outline">
                  Shuffle Order
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </Card>
      <BottomMenu onOpenMazii={handleOpenMazii} />
    </div>
  );
}
