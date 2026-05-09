import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { GPSHistory, PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch unique deviceIds from gpshistory (latest 30 days or all)
    const uniqueDevices = await GPSHistory.distinct("deviceId");

    // 2. Fetch already assigned deviceIds
    const assignedDevices = await PetStatus.distinct("deviceId");

    // 3. Get latest telemetry for each device to determine online/offline status
    const latestTelemetry = await GPSHistory.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$deviceId",
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    const devices = uniqueDevices.map(id => {
      const telemetry = latestTelemetry.find(t => t._id === id);
      const lastSeen = telemetry ? new Date(telemetry.timestamp) : null;
      const isOnline = lastSeen ? (Date.now() - lastSeen.getTime()) < 30000 : false;
      const isAssigned = assignedDevices.includes(id);

      return {
        deviceId: id,
        online: isOnline,
        assigned: isAssigned,
        lastSeen: lastSeen
      };
    });

    return NextResponse.json(devices);

  } catch (error: any) {
    console.error("Devices API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
