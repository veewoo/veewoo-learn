import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const setIndex = parseInt(searchParams.get("setIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Fetch total count for pagination
  const { count } = await supabase
    .from("n3_words")
    .select("id", { count: "exact", head: true });

  // Fetch the words for the current set
  const { data, error } = await supabase
    .from("n3_words")
    .select("id, expression, reading, meaning, sentence")
    .order("id", { ascending: true })
    .range(setIndex * pageSize, setIndex * pageSize + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    totalCount: count ?? null,
  });
} 