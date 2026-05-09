import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { Alert } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active' or 'resolved'
    const petId = searchParams.get('petId');

    const query: any = { userId };
    if (status) query.status = status;
    if (petId) query.petId = petId;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Alerts API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
