import { NextResponse } from "next/server";

export async function GET() {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
  }

  const results: any = {
    config: {
      bot_token_present: !!BOT_TOKEN,
      chat_id_present: !!CHAT_ID,
      chat_id_value: CHAT_ID,
    },
    telegram_connectivity: null,
    recent_updates: null,
  };

  try {
    // 1. Test basic connectivity
    console.log("[Telegram Debug] Testing getMe...");
    const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    results.telegram_connectivity = await meRes.json();

    // 2. Fetch updates
    console.log("[Telegram Debug] Fetching updates...");
    const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const updatesData = await updatesRes.json();
    results.recent_updates = updatesData;

    if (updatesData.ok && updatesData.result) {
      results.detected_chats = updatesData.result.map((u: any) => {
        const msg = u.message || u.edited_message || u.channel_post;
        if (!msg) return null;
        return {
          chat_id: msg.chat.id,
          username: msg.from?.username || "N/A",
          name: `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim(),
          text: msg.text || "N/A",
          date: new Date(msg.date * 1000).toLocaleString()
        };
      }).filter(Boolean);

      if (results.detected_chats.length === 0) {
        results.hint = "No recent messages found. You MUST open your bot and click /start or send a message first.";
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ 
      ...results,
      error: "Connectivity Failure", 
      message: error.message,
      hint: "Your server/network might be blocked from reaching api.telegram.org." 
    }, { status: 500 });
  }
}
