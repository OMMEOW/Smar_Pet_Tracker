import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { PetStatus } from "@/lib/models";
import { evaluatePetFenceStatus } from "@/lib/geofenceUtils";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { coordinates } = body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    await dbConnect();

    // Update specific pet's dedicated geofence
    const updatedPet = await PetStatus.findOneAndUpdate(
      { userId, petId: id },
      { $set: { "geofence.coordinates": coordinates } },
      { returnDocument: 'after' }
    );

    if (!updatedPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Trigger immediate alert recalculation
    await evaluatePetFenceStatus(id);

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error("Geofence API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
