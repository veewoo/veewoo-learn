import { NextResponse } from "next/server";
import { generatePassages } from "@/utils/passage-generator";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: Request) {
  try {
    const result = await generatePassages();

    // Return the passages in the response
    return new NextResponse(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  catch (error) {
    console.error('Error in POST request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
