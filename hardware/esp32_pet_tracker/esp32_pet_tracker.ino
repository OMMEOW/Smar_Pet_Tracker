#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include <esp_system.h>
#include <mbedtls/md.h>

#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GPS_BAUD 9600
#define LED_PIN 2
#define PULSE_PIN 34
#define PULSE_THRESHOLD 550

const char* WIFI_SSID = "Aarya";
const char* WIFI_PASSWORD = "";

// For local testing, use your computer LAN IP, not localhost.
// Example: http://192.168.1.10:3000/api/device/location
const char* SERVER_URL = "http://10.242.171.95:3000/api/device/location";
const char* DEVICE_SHARED_SECRET = "c43ca0a65e0f809a7014b3d7d2042b0346591f53f50041276576a1aa9eb36f13";
const char* DEVICE_PET_ID = "default_pet";

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

int pulseRaw = 0;
int pulseBpm = 0;
bool pulseWasHigh = false;
unsigned long lastBeatMs = 0;
unsigned long lastPulseSampleMs = 0;
bool timeSynced = false;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void syncClock() {
  if (timeSynced) return;

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing clock");

  for (int i = 0; i < 20; i++) {
    time_t now = time(nullptr);
    if (now > 1700000000) {
      timeSynced = true;
      Serial.println();
      Serial.println("Clock synced");
      return;
    }

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Clock sync failed; signed requests paused");
}

String randomNonce() {
  const char hexChars[] = "0123456789abcdef";
  String nonce = "";

  for (int i = 0; i < 16; i++) {
    uint8_t value = esp_random() & 0xff;
    nonce += hexChars[value >> 4];
    nonce += hexChars[value & 0x0f];
  }

  return nonce;
}

String hmacSha256Hex(const String& message) {
  byte hmacResult[32];
  const mbedtls_md_info_t* mdInfo = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);

  mbedtls_md_hmac(
    mdInfo,
    reinterpret_cast<const unsigned char*>(DEVICE_SHARED_SECRET),
    strlen(DEVICE_SHARED_SECRET),
    reinterpret_cast<const unsigned char*>(message.c_str()),
    message.length(),
    hmacResult
  );

  const char hexChars[] = "0123456789abcdef";
  String hex = "";
  for (int i = 0; i < 32; i++) {
    hex += hexChars[hmacResult[i] >> 4];
    hex += hexChars[hmacResult[i] & 0x0f];
  }

  return hex;
}

void updatePulseSensor() {
  if (millis() - lastPulseSampleMs < 20) return;
  lastPulseSampleMs = millis();

  pulseRaw = analogRead(PULSE_PIN);
  bool pulseIsHigh = pulseRaw > PULSE_THRESHOLD;

  if (pulseIsHigh && !pulseWasHigh) {
    unsigned long now = millis();
    unsigned long interval = now - lastBeatMs;

    if (interval > 300 && interval < 2000) {
      pulseBpm = 60000 / interval;
    }

    lastBeatMs = now;
  }

  pulseWasHigh = pulseIsHigh;
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PULSE_PIN, INPUT);
  Serial.begin(115200);
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  connectWiFi();
  syncClock();
  Serial.print("Server URL: ");
  Serial.println(SERVER_URL);
  Serial.println("GPS and pulse web tracker active");
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  updatePulseSensor();

  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 5000) {
    lastCheck = millis();
    sendLocation();
  }
}

void sendLocation() {
  if (!gps.location.isValid()) {
    Serial.println("No GPS fix yet...");
    return;
  }

  connectWiFi();
  syncClock();

  if (!timeSynced) {
    return;
  }

  double currentLat = gps.location.lat();
  double currentLon = gps.location.lng();
  int satellites = gps.satellites.isValid() ? gps.satellites.value() : 0;
  float hdop = gps.hdop.isValid() ? gps.hdop.value() / 100.0 : 0;
  int safePulseBpm = (pulseBpm >= 20 && pulseBpm <= 240) ? pulseBpm : 0;
  int safePulseRaw = constrain(pulseRaw, 0, 4095);
  unsigned long timestamp = static_cast<unsigned long>(time(nullptr));

  String payload = "{";
  payload += "\"petId\":\"" + String(DEVICE_PET_ID) + "\",";
  payload += "\"latitude\":" + String(currentLat, 6) + ",";
  payload += "\"longitude\":" + String(currentLon, 6) + ",";
  payload += "\"satellites\":" + String(satellites) + ",";
  payload += "\"hdop\":" + String(hdop, 2) + ",";
  payload += "\"pulseBpm\":" + String(safePulseBpm) + ",";
  payload += "\"pulseRaw\":" + String(safePulseRaw);
  payload += "}";

  String nonce = randomNonce();
  String timestampText = String(timestamp);
  String signature = hmacSha256Hex(timestampText + "." + nonce + "." + payload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", DEVICE_PET_ID);
  http.addHeader("x-device-timestamp", timestampText);
  http.addHeader("x-device-nonce", nonce);
  http.addHeader("x-device-signature", signature);

  int statusCode = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.println("-----------------------------");
  Serial.printf("Lat      : %.6f\n", currentLat);
  Serial.printf("Lon      : %.6f\n", currentLon);
  Serial.printf("Sats     : %d | HDOP: %.2f\n", satellites, hdop);
  Serial.printf("Pulse    : %d bpm | Raw: %d\n", safePulseBpm, safePulseRaw);
  Serial.printf("POST     : %d\n", statusCode);
  Serial.println(response);

  bool outsideGeofence = response.indexOf("\"alert\":true") >= 0;
  digitalWrite(LED_PIN, outsideGeofence ? HIGH : LOW);
}
