"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BottomMenu } from "../../components/BottomMenu";
import { PassageData, TooltipState, Token } from "@/types/passage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Flashcards from "@/components/Flashcards";
import { openMazii } from "@/utils/mazii";
import { useGetPassage } from "@/hooks/useGetPassage";
import { useFinishPassage } from "@/hooks/useFinishPassage";

function isPunctuation(token: Token) {
  return token[1] === "" && token[2] === "" && token[3] === "";
}

export default function ReadingPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectedTextRef = useRef<string>("");
  const tabValueRef = useRef<string>("reading");

  const [selectedOptions, setSelectedOptions] = useState<{
    [questionIdx: number]: string;
  }>({});
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const [hasCheckedAnswers, setHasCheckedAnswers] = useState(false);
  const [answerResults, setAnswerResults] = useState<{
    [questionIdx: number]: boolean;
  }>({});

  const { isFetching, error, data, refetch } = useGetPassage();
  const finishMutation = useFinishPassage(data?.id);

  const handleClick = () => {
    refetch();
    setSelectedOptions({});
    setHasCheckedAnswers(false);
    setAnswerResults({});
  };

  const checkAnswers = () => {
    if (!data?.answers) return;

    const results: { [questionIdx: number]: boolean } = {};
    data.answers.forEach((correctAnswer, index) => {
      results[index] = selectedOptions[index] === correctAnswer;
    });

    setAnswerResults(results);
    setHasCheckedAnswers(true);
    finishMutation.mutate();
  };

  const handleTokenClick = (e: React.MouseEvent, token: Token) => {
    if (isPunctuation(token)) return;

    e.preventDefault();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const tooltipWidth = 220;

    let xPos = rect.left;
    if (rect.left + tooltipWidth > windowWidth) {
      xPos = rect.right - tooltipWidth;
    }

    const yPos = rect.bottom + window.scrollY + 5;

    setTooltip({
      visible: true,
      x: xPos,
      y: yPos,
      content: {
        part: token[0],
        reading: token[1],
        meaning: token[2],
        type: token[3],
      },
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleCloseTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleOpenMazii = () => {
    const selectedTextToCopy = lastSelectedTextRef.current.trim();
    openMazii(selectedTextToCopy);
  };

  const handleOpenGoogleTranslate = () => {
    const selectedText = lastSelectedTextRef.current.trim();
    window.location.href = `googletranslate://?sl=ja&tl=en&text=${encodeURIComponent(selectedText)}`;
  };

  const handleOpenGoogleSearch = () => {
    const selectedText = lastSelectedTextRef.current.trim();
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
      isMobile() ? "_system" : "_blank",
    );
  };

  const renderTokenizedPassage = () => {
    if (!data?.tokens || data.tokens.length === 0) {
      return null;
    }

    return (
      <div className="text-3xl leading-snug">
        {data.tokens.map((token, idx) => {
          if (isPunctuation(token)) {
            return <span key={idx}>{token[0]}</span>;
          }

          return (
            <span
              key={idx}
              className="token-highlight cursor-pointer hover:bg-yellow-100 rounded transition-colors"
              onClick={(e) => handleTokenClick(e, token)}
            >
              {token[0]}
            </span>
          );
        })}
      </div>
    );
  };

  const flashcardCards =
    data?.tokens
      .filter((token) => !isPunctuation(token))
      .map((token) => ({
        word: token[0],
        reading: token[1],
        meaning: token[2],
      })) || [];

  const seen = new Set<string>();
  const uniqueFlashcardCards = flashcardCards.filter((card) => {
    if (seen.has(card.word)) return false;
    seen.add(card.word);
    return true;
  });

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      lastSelectedTextRef.current = selection ? selection.toString() : "";
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <Tabs
      defaultValue="reading"
      onValueChange={(value) => {
        tabValueRef.current = value;
      }}
      className="container mx-auto pt-4 pb-24 max-w-3xl"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="reading">Reading</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
      </TabsList>
      <TabsContent value="reading">
        <Card className="shadow-lg pt-0">
          {isFetching ? (
            <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <ReloadIcon className="h-4 w-4 animate-spin" />
                <p>Loading passage...</p>
              </div>
            </CardContent>
          ) : error ? (
            <CardContent className="pt-6 text-red-500">
              <p>Error: {(error as Error).message}</p>
            </CardContent>
          ) : !data ? (
            <CardContent className="pt-6 text-center min-h-[400px] flex flex-col items-center justify-center">
              <p className="mb-4">No passage loaded.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Passage
              </button>
            </CardContent>
          ) : (
            <>
              <CardContent className="p-4">
                {renderTokenizedPassage()}
                {data.questions && data.questions.length > 0 && (
                  <div className="mt-6">
                    {data.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="mb-4 p-4 border rounded-lg text-lg"
                      >
                        <p className="text-2xl mb-2">{q.question}</p>
                        <RadioGroup
                          value={selectedOptions[qIdx]}
                          onValueChange={(value) =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [qIdx]: value,
                            }))
                          }
                        >
                          {Object.entries(q.options).map(
                            ([optionKey, optionValue], oIdx) => (
                              <div
                                key={oIdx}
                                className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                                  hasCheckedAnswers
                                    ? answerResults[qIdx] &&
                                      selectedOptions[qIdx] === optionKey
                                      ? "bg-green-100 border-green-500"
                                      : !answerResults[qIdx] &&
                                          selectedOptions[qIdx] === optionKey
                                        ? "bg-red-100 border-red-500"
                                        : data.answers &&
                                            data.answers[qIdx] === optionKey
                                          ? "bg-green-50 border-green-300"
                                          : "border-transparent"
                                    : "border-transparent hover:bg-gray-50"
                                }`}
                              >
                                <RadioGroupItem
                                  value={optionKey}
                                  id={`q${qIdx}-o${oIdx}`}
                                  disabled={hasCheckedAnswers}
                                />
                                <label
                                  htmlFor={`q${qIdx}-o${oIdx}`}
                                  className="cursor-pointer flex-1 text-2xl"
                                >
                                  {optionValue}
                                </label>
                              </div>
                            ),
                          )}
                        </RadioGroup>
                        {hasCheckedAnswers && (
                          <p
                            className={`mt-2 text-sm font-medium ${
                              answerResults[qIdx]
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {answerResults[qIdx]
                              ? "Correct!"
                              : `Incorrect. Correct answer: ${data.answers?.[qIdx]}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                {!hasCheckedAnswers && (
                  <button
                    onClick={checkAnswers}
                    disabled={
                      Object.keys(selectedOptions).length !==
                      data.questions.length
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Check Answers
                  </button>
                )}
                <button
                  onClick={handleClick}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Next Passage
                </button>
              </CardFooter>
            </>
          )}
        </Card>
        {tooltip.visible && tooltip.content && (
          <div
            className="absolute bg-white border shadow-lg rounded-md p-4 z-10"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseTooltip}
              className="absolute top-0 right-0 text-gray-500 font-bold hover:cursor-pointer p-1"
            >
              &times;
            </button>
            <h4 className="font-bold text-3xl mb-1">{tooltip.content.part}</h4>
            <p className="font-bold text-base text-gray-600 mb-1">
              {tooltip.content.reading}
            </p>
            <p className="font-bold text-base text-gray-600 mb-1">
              {tooltip.content.meaning}
            </p>
            <p className="text-sm text-gray-400 italic">
              {tooltip.content.type}
            </p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="flashcards">
        <Flashcards
          cards={uniqueFlashcardCards}
          isLoading={isFetching}
          error={error as Error | null}
        />
      </TabsContent>
      <BottomMenu
        onOpenMazii={handleOpenMazii}
        onOpenGoogleSearch={handleOpenGoogleSearch}
        onOpenGoogleTranslate={handleOpenGoogleTranslate}
        getSelectedText={() => lastSelectedTextRef.current.trim()}
      />
    </Tabs>
  );
}

function isMobile() {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || "";
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent,
  );
}
