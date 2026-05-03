"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import bingTranslatorLogo from "@/assets/bing-translator-logo-64x64.png";
import googleTranslateLogo from "@/assets/google-translate-logo-64x64.png";
import googleSearchLogo from "@/assets/google-search-logo-64x64.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface BottomMenuProps {
  onOpenMazii?: () => void;
  onOpenGoogleTranslate?: () => void;
  onOpenGoogleSearch?: () => void;
  getSelectedText?: () => string;
}

export function BottomMenu({
  onOpenGoogleTranslate,
  onOpenGoogleSearch,
  getSelectedText,
}: BottomMenuProps) {
  const [selectedText, setSelectedText] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<"MICROSOFT_TRANSLATOR" | null>(
    null,
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 pt-4 pb-8 shadow-md flex items-center z-50 gap-3">
      {process.env.NEXT_PUBLIC_EMBED_SITE_URL && (
        <iframe
          src={process.env.NEXT_PUBLIC_EMBED_SITE_URL}
          className="w-[170px] h-8 border-none"
          scrolling="no"
        />
      )}
      {getSelectedText && (
        <Dialog
          open={dialogOpen === "MICROSOFT_TRANSLATOR"}
          onOpenChange={(open) => {
            const text = getSelectedText() || "";
            setSelectedText(text);
            setDialogOpen(open && text ? "MICROSOFT_TRANSLATOR" : null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="w-10 h-10 ml-auto">
              <Image
                alt="Microsoft Translator"
                width={24}
                height={24}
                className="w-6 h-6"
                src={bingTranslatorLogo}
              />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-none w-screen min-h-[500px] m-0 rounded-none">
            <DialogHeader className="hidden">
              <DialogTitle />
            </DialogHeader>
            <iframe
              src={`https://www.bing.com/translator?from=ja&to=en&text=${encodeURIComponent(
                selectedText,
              )}`}
              className="w-full h-full border-none mt-4"
              title="Bing Translator"
            />
          </DialogContent>
        </Dialog>
      )}
      {onOpenGoogleTranslate && (
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10"
          onClick={onOpenGoogleTranslate}
        >
          <Image
            alt="Google Translate"
            width={24}
            height={24}
            className="w-6 h-6"
            src={googleTranslateLogo}
          />
        </Button>
      )}
      {onOpenGoogleSearch && (
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10"
          onClick={onOpenGoogleSearch}
        >
          <Image
            alt="Google Search"
            width={24}
            height={24}
            className="w-6 h-6"
            src={googleSearchLogo}
          />
        </Button>
      )}
    </div>
  );
}
