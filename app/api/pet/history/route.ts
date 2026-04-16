import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PetHistory } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    const history = await PetHistory.find({ petId: "default_pet" })
      .sort({ timestamp: -1 })
      .limit(50);
    return NextResponse.json(history);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const entry = await PetHistory.create({
      petId: "default_pet",
      ...data,
      timestamp: data.timestamp || Date.now(),
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
