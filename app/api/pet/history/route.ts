import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { PetHistory } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const userId = (session.user as any).id;

    await dbConnect();
    
    const query: any = { userId };
    if (petId) query.petId = petId;
    
    const history = await PetHistory.find(query)
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();
    const data = await request.json();
    const petId = data.petId;
    
    if (!petId) {
      return NextResponse.json({ error: "petId is required" }, { status: 400 });
    }
    
    const entry = await PetHistory.create({
      userId,
      petId,
      ...data,
      timestamp: data.timestamp || Date.now(),
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
