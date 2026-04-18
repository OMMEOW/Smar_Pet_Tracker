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
    let status = await PetStatus.findOne({ userId, petId: "default_pet" });

    // If no status exists, create a default one for this user
    if (!status) {
      status = await PetStatus.create({
        userId,
        petId: "default_pet",
        location: {
          latitude: 19.044992,
          longitude: 72.871277,
          timestamp: Date.now(),
        },
        geofence: {
          lat: 19.123456,
          lng: 72.987654,
          radius: 100,
        },
        alert: false,
      });
    }

    return NextResponse.json(status);
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

    const status = await PetStatus.findOneAndUpdate(
      { userId, petId: "default_pet" },
      { $set: { ...data, userId } },
      { new: true, upsert: true }
    );

    return NextResponse.json(status);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
