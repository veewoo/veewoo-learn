"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Veewoo Learn</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/reading" passHref>
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl">Reading Practice</CardTitle>
              <CardDescription>Improve your reading comprehension and speed.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/speaking" passHref>
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl">Speaking Practice</CardTitle>
              <CardDescription>Enhance your pronunciation and fluency.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/sentence-scramble" passHref>
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl">Sentence Scramble</CardTitle>
              <CardDescription>Practice sentence structure by assembling words in the correct order.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/flashcards" passHref>
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl">Flashcards</CardTitle>
              <CardDescription>Practice your vocabulary with flashcards.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
