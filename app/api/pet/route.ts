import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PetStatus } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    let status = await PetStatus.findOne({ petId: "default_pet" });
    
    // If no status exists, create a default one
    if (!status) {
      status = await PetStatus.create({
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
    await dbConnect();
    const data = await request.json();
    
    const status = await PetStatus.findOneAndUpdate(
      { petId: "default_pet" },
      { $set: data },
      { new: true, upsert: true }
    );

    return NextResponse.json(status);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
