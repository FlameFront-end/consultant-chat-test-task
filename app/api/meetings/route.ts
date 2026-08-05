import { NextResponse } from "next/server";

import { getMeetings } from "@/lib/meetings/get-meetings";

export async function GET() {
  const meetings = await getMeetings();

  return NextResponse.json(meetings);
}
