"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tw";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export function ScrollToTopButton({
  threshold = 200,
  className,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Scroll to top"
      onClick={handleScrollToTop}
      className={cn("h-10 w-10 shadow-md", className)}
    >
      <ArrowUpIcon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
