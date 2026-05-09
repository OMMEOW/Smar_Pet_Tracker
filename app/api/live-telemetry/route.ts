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

    const userId = (session.user as any).id;
    await dbConnect();

    // Get user's pet device IDs
    const userPets = await PetStatus.find({ userId }).select("deviceId");
    const deviceIds = userPets.map(p => p.deviceId);

    if (deviceIds.length === 0) return NextResponse.json([]);

    // Fetch the latest entry for each deviceId from gpshistory
    // Using aggregation with $match first to limit data
    const latestTelemetry = await GPSHistory.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
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

    const formattedData = latestTelemetry.map(item => {
      let lat = item.latitude;
      let lng = item.longitude;

      // DIAGNOSTIC FIX: Detect and correct +50 degree offset bug
      if (lat > 60 && lat < 80 && lng > 110 && lng < 140) {
        lat -= 50;
        lng -= 50;
      }

      const lastSeen = new Date(item.timestamp);
      const isOnline = (Date.now() - lastSeen.getTime()) < 30000;

      return {
        deviceId: item._id,
        latitude: lat,
        longitude: lng,
        pulseBpm: item.pulseBpm || 0,
        pulseRaw: item.pulseRaw || 0,
        timestamp: item.timestamp,
        online: isOnline
      };
    });

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error("Live Telemetry API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
