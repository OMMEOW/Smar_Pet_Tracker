import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    await dbConnect();
    
    if (petId) {
      const status = await PetStatus.findOne({ userId, petId });
      return NextResponse.json(status || { error: "Pet not found" }, { status: status ? 200 : 404 });
    }

    const allPets = await PetStatus.find({ userId });
    return NextResponse.json(allPets);
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
    
    if (!data.petId || !data.name || !data.deviceId) {
      return NextResponse.json({ error: "Missing required fields (petId, name, deviceId)" }, { status: 400 });
    }

    // Check if deviceId is already assigned to another pet
    const existingBinding = await PetStatus.findOne({ deviceId: data.deviceId });
    if (existingBinding) {
      return NextResponse.json({ error: "This tracker device is already assigned to another pet." }, { status: 400 });
    }

    // Default initial setup for a new pet
    const initialSetup = {
      ...data,
      userId,
      location: {
        latitude: 19.044992,
        longitude: 72.871277,
        timestamp: Date.now(),
      },
      geofence: {
        coordinates: [] // Empty lasso coordinates by default
      },
      alert: false,
      battery: 100,
      isOnline: true,
      lastSeen: new Date(),
    };

    const status = await PetStatus.create(initialSetup);
    return NextResponse.json(status);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
