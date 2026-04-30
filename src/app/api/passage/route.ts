import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch a random passage
    const { data, error } = await supabase
      .from('passages')
      .select('*')
      .eq("finished", false)
      .order('id', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching random passage:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create response with no-cache headers to prevent browser caching
    const response = NextResponse.json(data);
    
    // Set cache control headers to prevent caching, especially on Safari iOS
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Error in GET request:', error);
    const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    
    // Set cache control headers for error responses too
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    
    return response;
  }
}