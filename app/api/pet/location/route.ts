import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PetStatus, PetHistory } from "@/lib/models";
import { evaluatePetFenceStatus } from "@/lib/geofenceUtils";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { deviceId, lat, lng, battery, timestamp } = data;

    if (!deviceId || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing deviceId or coordinates" }, { status: 400 });
    }

    await dbConnect();

    // Find the pet by deviceId (petId)
    const pet = await PetStatus.findOne({ petId: deviceId });
    if (!pet) {
      return NextResponse.json({ error: "Device not registered" }, { status: 404 });
    }

    // Update the pet status without triggering strict schema validation on legacy docs
    await PetStatus.updateOne(
      { _id: pet._id },
      {
        $set: {
          location: {
            latitude: lat,
            longitude: lng,
            timestamp: timestamp || Date.now()
          },
          ...(battery !== undefined ? { battery } : {}),
          lastSeen: Date.now(),
          isOnline: true
        }
      }
    );

    // Log the location in history if userId is valid
    if (pet.userId) {
      await PetHistory.create({
        userId: pet.userId,
        petId: deviceId,
        latitude: lat,
        longitude: lng,
        timestamp: timestamp || Date.now()
      });

      // TRIGGER CENTRALIZED GEOFENCE BREACH DETECTION
      await evaluatePetFenceStatus(deviceId);
    }

    return NextResponse.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("API Error (Location Update):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error", stack: error.stack }, { status: 500 });
  }
}
