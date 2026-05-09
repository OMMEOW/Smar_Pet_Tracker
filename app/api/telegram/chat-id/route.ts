import { NextResponse } from "next/server";

export async function GET() {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured in .env" }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: "Telegram API Error", details: data }, { status: 500 });
    }

    // Extract potential chat IDs from recent messages
    const updates = data.result;
    if (!updates || updates.length === 0) {
      return NextResponse.json({ 
        message: "No recent messages found. Please send a message to your bot on Telegram first, then refresh this page.",
        hint: "Send any message (like 'hello') to your bot."
      });
    }

    const chats = updates.map((u: any) => ({
      id: u.message?.chat?.id || u.my_chat_member?.chat?.id,
      name: u.message?.chat?.first_name || u.message?.chat?.title || "Unknown",
      username: u.message?.chat?.username || "N/A",
      text: u.message?.text || "[No Text]"
    })).filter((c: any) => c.id);

    return NextResponse.json({ 
      success: true, 
      message: "Recent chat IDs found below. Copy the ID of your chat into TELEGRAM_CHAT_ID in .env",
      chats: chats 
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
