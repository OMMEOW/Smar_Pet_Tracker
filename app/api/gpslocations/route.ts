import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { GPSLocation, PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { evaluatePetFenceStatus } from "@/lib/geofenceUtils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch the latest entry for each device from gpslocations
    // We'll use aggregation to get the most recent document per deviceId
    const latestGpsData = await GPSLocation.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$deviceId",
          latitude: { $first: "$latitude" },
          longitude: { $first: "$longitude" },
          battery: { $first: "$battery" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    // Format the response and trigger alerts
    const formattedData = [];
    for (const item of latestGpsData) {
      const lastSeen = new Date(item.timestamp);
      const isOnline = (Date.now() - lastSeen.getTime()) < 30000;

      // CRITICAL: Update the master PetStatus with these new coordinates
      // and trigger the Telegram alert engine
      await PetStatus.updateOne(
        { petId: item._id },
        { 
          $set: { 
            "location.latitude": item.latitude,
            "location.longitude": item.longitude,
            "location.timestamp": item.timestamp.getTime(),
            battery: item.battery || 100,
            isOnline: isOnline,
            lastSeen: item.timestamp
          } 
        }
      );

      // TRIGGER TELEGRAM ALERT ENGINE (Backend)
      try {
        await evaluatePetFenceStatus(item._id);
      } catch (alertError) {
        console.error(`[Alert System] Failed to evaluate status for ${item._id}:`, alertError);
      }

      formattedData.push({
        deviceId: item._id,
        latitude: item.latitude,
        longitude: item.longitude,
        battery: item.battery || 100,
        online: isOnline,
        lastSeen: item.timestamp
      });
    }

    console.log(`[GPS API] Synced ${formattedData.length} devices and processed backend alerts.`);
    
    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("GPS API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
