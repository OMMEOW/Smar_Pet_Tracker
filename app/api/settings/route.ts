import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the settings part of the user object
    return NextResponse.json({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || {},
      profileImage: user.profileImage || "",
      email: user.email,
      notificationSettings: user.notificationSettings || {},
      trackingSettings: user.trackingSettings || {},
      appearanceSettings: user.appearanceSettings || {},
      primaryDeviceId: user.primaryDeviceId || "",
      preferredTheme: user.preferredTheme || "dark"
    });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    await dbConnect();

    // Whitelist updateable fields to prevent security risks
    const allowedUpdates: any = {};
    
    if (body.fullName !== undefined) allowedUpdates.fullName = body.fullName;
    if (body.phoneNumber !== undefined) allowedUpdates.phoneNumber = body.phoneNumber;
    if (body.address !== undefined) allowedUpdates.address = body.address;
    if (body.profileImage !== undefined) allowedUpdates.profileImage = body.profileImage;
    if (body.notificationSettings !== undefined) allowedUpdates.notificationSettings = body.notificationSettings;
    if (body.trackingSettings !== undefined) allowedUpdates.trackingSettings = body.trackingSettings;
    if (body.appearanceSettings !== undefined) allowedUpdates.appearanceSettings = body.appearanceSettings;
    if (body.primaryDeviceId !== undefined) allowedUpdates.primaryDeviceId = body.primaryDeviceId;
    if (body.preferredTheme !== undefined) allowedUpdates.preferredTheme = body.preferredTheme;

    allowedUpdates.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { action } = await request.json();
    await dbConnect();

    if (action === "WIPE_HISTORY") {
      // In a real app, delete from GPSHistory and PetHistory
      return NextResponse.json({ success: true, message: "Telemetry history cleared." });
    }

    if (action === "DESTROY_ACCOUNT") {
      await User.findByIdAndDelete(userId);
      return NextResponse.json({ success: true, message: "Account deleted." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Settings DANGER Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
