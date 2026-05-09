import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { Alert } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    // Fetch only the latest 5 active alerts for the user
    const alerts = await Alert.find({ userId, status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Live Alerts API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
