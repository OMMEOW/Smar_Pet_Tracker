import { NextResponse } from "next/server";
import { sendTelegramAlert } from "@/lib/telegram";

export async function GET() {
  try {
    console.log("[DEBUG] Triggering manual Telegram test...");
    
    const message = `✅ <b>Telegram Connection Test</b>\n\n<b>Status:</b> Success\n<b>Server Time:</b> ${new Date().toLocaleTimeString()}\n\nIf you see this, your bot is correctly configured and reaching the Telegram API.`;
    
    await sendTelegramAlert(message);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test alert dispatched. Check your Telegram bot." 
    });
  } catch (error: any) {
    console.error("[DEBUG ERROR] Test route failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
