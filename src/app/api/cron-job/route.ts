import { NextResponse } from "next/server";
import { generatePassages } from "@/utils/passage-generator";

export async function GET() {
    try {
        for (let i = 0; i < 10; i++) {
            await generatePassages();
        }
        return new NextResponse();
    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
