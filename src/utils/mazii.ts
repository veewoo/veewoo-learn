"use client";

export function openMazii(text: string): void {
  if (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        window.location.href = "mazii://";
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        window.location.href = "mazii://";
      });
  }
  else {
    window.location.href = "mazii://";
  }
}