import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { GPSHistory, PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { evaluatePetFenceStatus } from "@/lib/geofenceUtils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch the latest entry for each deviceId from gpshistory
    const latestTelemetry = await GPSHistory.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$deviceId",
          latitude: { $first: "$latitude" },
          longitude: { $first: "$longitude" },
          pulseBpm: { $first: "$pulseBpm" },
          pulseRaw: { $first: "$pulseRaw" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    const formattedData = [];
    for (const item of latestTelemetry) {
      const lastSeen = new Date(item.timestamp);
      const isOnline = (Date.now() - lastSeen.getTime()) < 30000;

      // Sync with PetStatus to keep metadata up to date
      await PetStatus.updateOne(
        { petId: item._id },
        { 
          $set: { 
            "location.latitude": item.latitude,
            "location.longitude": item.longitude,
            "location.timestamp": lastSeen.getTime(),
            isOnline: isOnline,
            lastSeen: lastSeen,
            // Custom fields can be stored in metadata if needed, 
            // but for now we just pass them to the frontend
          } 
        }
      );

      // Trigger Alert Engine
      try {
        await evaluatePetFenceStatus(item._id);
      } catch (err) {}

      formattedData.push({
        deviceId: item._id,
        latitude: item.latitude,
        longitude: item.longitude,
        pulseBpm: item.pulseBpm || 0,
        pulseRaw: item.pulseRaw || 0,
        timestamp: item.timestamp,
        online: isOnline
      });
    }

    console.log(`[Live Telemetry] Synced ${formattedData.length} devices from gpshistory.`);
    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error("Live Data API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
