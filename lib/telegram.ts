/**
 * TELEGRAM NOTIFICATION SERVICE
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramAlert(message: string) {
  console.log(`[TELEGRAM] Sending alert...`);
  
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("[TELEGRAM ERROR] Missing BOT_TOKEN or CHAT_ID in environment variables.");
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased to 20s

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };

    console.log(`[TELEGRAM REQUEST] URL: https://api.telegram.org/bot${BOT_TOKEN.substring(0, 5)}.../sendMessage`);
    console.log(`[TELEGRAM PAYLOAD] ChatID: ${CHAT_ID}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TELEGRAM ERROR] HTTP ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`[TELEGRAM RESPONSE] Success:`, data.ok);

    if (!data.ok) {
      console.error("[TELEGRAM ERROR] API Error:", data.description);
    } else {
      console.log("[TELEGRAM SUCCESS] Message delivered successfully.");
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error("[TELEGRAM ERROR] Connection timed out (20s). Telegram API is unreachable from this server.");
      console.warn("[TELEGRAM HINT] Your ISP or Region may be blocking api.telegram.org. Try using a VPN or a Proxy.");
    } else {
      console.error("[TELEGRAM ERROR] Network/Fetch failure:", error.message || error);
    }
  }
}
