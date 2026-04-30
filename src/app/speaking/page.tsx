"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { Tables } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { PlayIcon } from "@radix-ui/react-icons";

type ConversationRow = Tables<"conversations">;
type ConversationTurnRow = Tables<"conversation_turns">;

interface ConversationWithTurns extends ConversationRow {
  conversation_turns: ConversationTurnRow[];
}

export default function SpeakingPage() {
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    data: conversations,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    initialData: [],
    queryFn: async () => {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.status}`);
      }

      return (await response.json()) as ConversationWithTurns[];
    },
  });

  // Update audio source when conversation changes
  useEffect(() => {
    if (conversations.length > 0 && audioRef.current) {
      const currentConversation = conversations[currentConversationIndex];
      if (currentConversation && currentConversation.audio_file_path) {
        audioRef.current.src = currentConversation.audio_file_path;
      }
    }
  }, [currentConversationIndex, conversations]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current
              .play()
              .catch((error) => console.error("Error playing audio:", error));
          } else {
            audioRef.current.pause();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Function to play specific conversation turn
  const playTurnAudio = (turn: ConversationTurnRow) => {
    if (!audioRef.current) return;

    if (turn.start_time !== null && turn.end_time !== null) {
      // Play specific segment with timing
      audioRef.current.currentTime = turn.start_time;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));

      // Stop at end_time
      const checkTime = () => {
        if (
          audioRef.current &&
          audioRef.current.currentTime >= turn.end_time!
        ) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("timeupdate", checkTime);
        }
      };
      audioRef.current.addEventListener("timeupdate", checkTime);
    } else {
      // If no timing data, play entire conversation
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  };

  const handleNextConversation = () => {
    setCurrentConversationIndex(
      (prevIndex) => (prevIndex + 1) % conversations.length,
    );
  };

  const handlePreviousConversation = () => {
    setCurrentConversationIndex((prevIndex) =>
      prevIndex === 0 ? conversations.length - 1 : prevIndex - 1,
    );
  };

  if (loading) {
    return <p className="text-center p-4">Loading conversations...</p>;
  }

  if (error) {
    return (
      <p className="text-center p-4 text-red-500">Error: {error.message}</p>
    );
  }

  if (conversations.length === 0) {
    return <p className="text-center p-4">No conversations available.</p>;
  }

  const currentConversation = conversations[currentConversationIndex];

  return (
    <div className="container mx-auto pt-4 pb-22 px-4 flex flex-col items-center space-y-6">
      {currentConversation && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {currentConversation.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {currentConversation.conversation_turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`relative p-4 rounded-lg max-w-[85%] ${
                    turn.speaker === "A"
                      ? "bg-blue-100 self-start rounded-bl-none"
                      : "bg-green-100 self-end rounded-br-none"
                  }`}
                >
                  <PlayIcon
                    className="w-4 h-4 absolute bottom-2 right-2 cursor-pointer"
                    onClick={() => playTurnAudio(turn)}
                  />
                  <p className="text-lg font-medium text-gray-800">
                    {turn.japanese}
                  </p>
                  {turn.romaji && (
                    <p className="text-sm text-gray-600 italic">
                      {turn.romaji}
                    </p>
                  )}
                  <p className="text-base text-gray-700 mt-1">{turn.english}</p>
                  {turn.start_time !== null && turn.end_time !== null && (
                    <p className="text-xs text-gray-500 mt-2">
                      ⏱️ {turn.start_time}s - {turn.end_time}s
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center items-center gap-4 w-full">
              <Button
                onClick={handlePreviousConversation}
                disabled={conversations.length <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <div className="text-lg font-medium text-gray-700 whitespace-nowrap">
                {currentConversationIndex + 1} / {conversations.length}
              </div>
              <Button
                onClick={handleNextConversation}
                disabled={conversations.length <= 1}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-4 shadow-md flex justify-between items-center z-50 gap-3">
        {process.env.NEXT_PUBLIC_EMBED_SITE_URL && (
          <iframe
            src={process.env.NEXT_PUBLIC_EMBED_SITE_URL}
            className="grow h-8 border-none"
            scrolling="no"
          />
        )}
        <audio
          ref={audioRef}
          controls
          className="grow"
          onFocus={(e) => {
            e.target.blur(); // Prevents the audio element from receiving focus
          }}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}
