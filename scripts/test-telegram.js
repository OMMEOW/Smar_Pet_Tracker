const BOT_TOKEN = "8696132001:AAG_EdJ0rH4dAEg3mGGvnk63UkEwfMI5ojU";
const CHAT_ID = "6068224534";

async function testTelegram() {
  console.log("Testing Telegram Bot...");
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "🔔 <b>TEST ALERT</b>\n\nYour pet tracking system is now connected to Telegram.",
        parse_mode: "HTML"
      })
    });
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testTelegram();
