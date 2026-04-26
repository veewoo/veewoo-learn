// [Part, Reading, Meaning, Type]
export type Token = [string, string, string, string];

export type PassageData = {
  id: number;
  tokens: Token[];
  topic: string | null;
  questions: Array<{
    question: string;
    options: { [key: string]: string };
  }>;
  answers: string[];
  finished: boolean;
};

export type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  content: {
    part: string;
    reading: string;
    meaning: string;
    type: string;
  } | null;
};
