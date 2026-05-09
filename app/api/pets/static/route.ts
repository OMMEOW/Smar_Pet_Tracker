import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    // Fetch static pet data: name, species, breed, age, weight, imageUrl, geofence
    // Exclude live telemetry fields if possible, or just send the whole document once
    const pets = await PetStatus.find({ userId }).select("-location -pulseBpm -pulseRaw -isOnline -lastSeen");
    
    return NextResponse.json(pets);
  } catch (error) {
    console.error("Static Pet Data API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
