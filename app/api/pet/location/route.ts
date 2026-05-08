import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PetStatus, PetHistory } from "@/lib/models";
import { evaluatePetFenceStatus } from "@/lib/geofenceUtils";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data = await request.json();

    const {
      deviceId,
      lat,
      lng,
      battery,
      timestamp
    } = data;

    // Validate required fields
    if (!deviceId || lat == null || lng == null) {
      return NextResponse.json(
        {
          error: "Missing deviceId or coordinates"
        },
        {
          status: 400
        }
      );
    }

    // Find pet linked to device
    const pet = await PetStatus.findOne({
      petId: deviceId
    });

    if (!pet) {
      return NextResponse.json(
        {
          error: "Device not registered"
        },
        {
          status: 404
        }
      );
    }

    // Update live pet status
    await PetStatus.updateOne(
      {
        _id: pet._id
      },
      {
        $set: {
          location: {
            latitude: lat,
            longitude: lng,
            timestamp: timestamp || Date.now()
          },

          ...(battery !== undefined
            ? {
              battery
            }
            : {}),

          lastSeen: Date.now(),
          isOnline: true
        }
      }
    );

    // Store GPS history
    if (pet.userId) {
      await PetHistory.create({
        userId: pet.userId,
        petId: deviceId,
        latitude: lat,
        longitude: lng,
        timestamp: timestamp || Date.now()
      });
    }

    // Run geofence evaluation
    await evaluatePetFenceStatus(deviceId);

    return NextResponse.json({
      success: true,
      message: "Location updated successfully"
    });

  } catch (error: any) {
    console.error(
      "API Error (Location Update):",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal Server Error",

        stack: error?.stack
      },
      {
        status: 500
      }
    );
  }
}