"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  onOpenMazii,
  onOpenGoogleTranslate,
  onOpenGoogleSearch,
  getSelectedText,
}: BottomMenuProps) {
  const [selectedText, setSelectedText] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<"MICROSOFT_TRANSLATOR" | null>(
    null
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 pt-4 pb-8 shadow-md flex items-center z-50 gap-3">
      <iframe
        src="https://veewootimer.vercel.app?embed=true&taskId=1"
        className="w-[170px] h-8 ml-[-10px] border-none"
        title="Veewoo Timer"
        scrolling="no"
      />
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
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png?20210729021049"
              />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-none w-screen min-h-[500px] m-0 rounded-none">
            <DialogHeader className="hidden">
              <DialogTitle />
            </DialogHeader>
            <iframe
              src={`https://www.bing.com/translator?from=ja&to=en&text=${encodeURIComponent(
                selectedText
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
            src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg"
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
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
          />
        </Button>
      )}
      {/* {onOpenMazii && (
        <Button
          size="icon"
          variant="outline"
          onClick={onOpenMazii}
          className="w-10 h-10"
        >
          <Image
            src="https://mazii.net/assets/images/logo/ic_mazii.png"
            alt="Mazii"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </Button>
      )} */}
    </div>
  );
}
