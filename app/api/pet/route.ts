import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { PetStatus } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function clampRadius(radius: unknown) {
  const value = Number(radius);
  if (!Number.isFinite(value)) return 100;
  return Math.min(Math.max(value, 30), 300);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId") || "default_pet";

    await dbConnect();
    let status = await PetStatus.findOne({ userId, petId });

    // If no status exists, create a default one for this user
    if (!status) {
      status = await PetStatus.create({
        userId,
        petId,
        geofence: {
          type: "circle",
          lat: 18.989899,
          lng: 73.109232,
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
    const petId = data.petId || "default_pet";
    const update = { ...data, userId, petId };

    if (update.geofence?.type === "circle") {
      update.geofence = {
        ...update.geofence,
        radius: clampRadius(update.geofence.radius),
      };
    }

    const status = await PetStatus.findOneAndUpdate(
      { userId, petId },
      { $set: update },
      { new: true, upsert: true }
    );

    return NextResponse.json(status);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
