"use client";

import { ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tw";

interface ScrollToNearestQuestionButtonProps {
  onClick: () => void;
  className?: string;
}

export function ScrollToNearestQuestionButton({
  onClick,
  className,
}: ScrollToNearestQuestionButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Scroll to nearest question"
      onClick={onClick}
      className={cn("h-10 w-10 shadow-md", className)}
    >
      <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
