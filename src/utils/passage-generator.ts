import { google } from "@ai-sdk/google";
import { generateText } from 'ai';
import { createClient } from "./supabase/server";

// Topics for variety
export const topics = [
  "日常生活 (daily life)",
  "学校生活 (school life)",
  "趣味 (hobbies)",
  "食べ物 (food)",
  "旅行 (travel)",
  "仕事 (work)",
  "天気 (weather)",
  "買い物 (shopping)",
  "家族 (family)",
  "季節 (seasons)",
  "文化 (culture)",
  "スポーツ (sports)",
  "音楽 (music)",
  "映画 (movies)",
  "友達 (friends)",
  "健康 (health)",
  "環境 (environment)",
  "技術 (technology)",
  "歴史 (history)",
  "アート (art)",
  "文学 (literature)",
  "社会 (society)",
  "経済 (economy)",
  "政治 (politics)",
  "教育 (education)"
];

export const LEVEL = {
  N5: "N5",
  N4: "N4",
  N3: "N3",
  N2: "N2",
  N1: "N1",
}

export const SENTENCES = {
  8: 8,
}

export async function generatePassages() {
  try {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const timestamp = new Date().toISOString();

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `
Create 3 NEW, UNIQUE Japanese reading passages about ${randomTopic}. This is request timestamp: ${timestamp} - use this to ensure you create new content.

I'm a Japanese learner at the N3 level. Provide a short passage (8 sentences) for me to read, along with 5 multiple-choice questions (A, B, C, D options). The passage should use N3-level grammar and vocabulary.

CRITICAL: The passage MUST be tokenized — instead of a plain text string, output the passage as an array of arrays. Each inner array has exactly 4 columns: [Part, Reading, Meaning, Type].

- "Part" is the Japanese word/particle/punctuation as it appears in the passage.
- "Reading" is the hiragana reading (leave empty string for punctuation).
- "Meaning" is the English meaning (leave empty string for punctuation).
- "Type" is the grammatical type (e.g. noun, verb, particle, adjective, adverb, etc. Leave empty string for punctuation).

Requirements:
- Create a COMPLETELY NEW passage (do not copy the example)
- Topic: ${randomTopic}
- 8 sentences with simple grammar (N3 level)
- Tokenize EVERY word, particle, and punctuation mark — no skipping
- 5 multiple-choice questions with A, B, C, D options
- Format the response as JSON

Example format (DO NOT COPY THIS CONTENT, JUST USE THE FORMAT):
[
  {
    "tokens": [
      ["私たち", "わたしたち", "we / us", "pronoun"],
      ["の", "の", "possessive (\\"of\\")", "particle"],
      ["地球", "ちきゅう", "Earth", "noun"],
      ["の", "の", "possessive", "particle"],
      ["環境", "かんきょう", "environment", "noun"],
      ["は", "は", "topic marker", "particle"],
      ["、", "", "", ""],
      ["今", "いま", "now", "noun (adverbial use)"],
      ["、", "", "", ""],
      ["とても", "とても", "very", "adverb"],
      ["大切な", "たいせつな", "important", "な-adjective"],
      ["時期", "じき", "period / stage", "noun"],
      ["を", "を", "object marker", "particle"],
      ["迎えています", "むかえています", "is reaching / is facing", "verb (ている form)"],
      ["。", "", "", ""]
    ],
    "questions": [
      {
        "question": "Question 1 about the new passage?",
        "options": {
          "A": "Option A",
          "B": "Option B",
          "C": "Option C",
          "D": "Option D"
        }
      }
    ],
    "answers": ["A", "B", "C", "D", "A"]
  }
]
      `,
    });

    let passages;
    try {
      passages =
        JSON.parse(
          (result.text as string)
            .replaceAll("```json", "")
            .replaceAll("```", "")
        );
    } catch (error) {
      console.error('Error parsing JSON from AI response:', error);
      throw new Error('Invalid JSON response from AI');
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertPromises = passages.map(async (passage: any) => {
      const { data, error } = await supabase
        .from('passages')
        .insert({
          tokens: passage.tokens,
          topic: randomTopic,
          questions: passage.questions,
          answers: passage.answers,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error inserting tokenized passage:', error);
        throw error;
      }

      return data;
    });

    await Promise.all(insertPromises);

    return {
      message: 'Passages created and saved successfully',
      passages
    };
  }
  catch (error) {
    console.error('Error generating passages:', error);
    throw error;
  }
}