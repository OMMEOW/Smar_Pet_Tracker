# Smart Pet Tracker System

## 1. Project Summary
**Hardware Used:** ESP32 Microcontroller, GPS Module (RX/TX), Pulse Sensor (Analog), and LED.  
**System Architecture:** An Internet of Things (IoT) architecture. The ESP32 collects GPS and health data, signs it securely, and sends it via Wi-Fi (HTTP POST) to a Next.js (React) web backend. The backend uses MongoDB for data storage and NextAuth for secure user authentication. The frontend provides a real-time tracking dashboard using MapLibre.  
**Functionality:** This is a real-time smart pet tracking and health monitoring system. It fetches the pet's GPS coordinates and pulse rate, and sends them to a cloud dashboard. The owner can set a virtual "Geofence" around a location. If the pet crosses this boundary, the system alerts the owner on the dashboard and lights up an LED on the pet's collar.

---

## 2. Components Used and Their Purpose
* **ESP32 Microcontroller:** This serves as the main "brain" of the tracker. It processes data from sensors and uses its built-in Wi-Fi to send the data to our backend server.
* **GPS Module:** Used to track the real-time physical location (Latitude & Longitude) of the pet.
* **Pulse Sensor:** Used to monitor the pet's heart rate (pulse/bpm), allowing the owner to keep an eye on the pet's health.
* **LED:** A simple physical indicator on the tracker. When the pet goes outside the designated geofence (triggering an alert), this LED lights up to notify anyone nearby.

---

## 3. Detailed Hardware Connections
* **GPS Module Connections:** The RX and TX pins of the GPS module are connected to Pin 16 and Pin 17 on the ESP32. The ESP32 reads the GPS data using 'HardwareSerial 2'.
* **Pulse Sensor Connection:** The analog output pin of the pulse sensor is connected to Pin 34 on the ESP32. The ESP32 reads the analog values to detect heartbeats.
* **LED Connection:** The positive terminal of the LED is connected to Pin 2 on the ESP32, and the negative to ground. Pin 2 goes 'HIGH' when a geofence breach is detected by the server.
* **Network Connection:** The ESP32 is programmed with a Wi-Fi SSID and Password to connect to the local network. Once connected, it sends JSON data payloads via an HTTP POST request to `http://<SERVER_IP>:3000/api/device/location`.

---

## 4. Handled Security Attacks
Our system actively mitigates and protects against **three major IoT security attacks**:
1. **Man-in-the-Middle (MitM) / Data Tampering Attack:** Attackers intercepting the Wi-Fi traffic and trying to alter the GPS coordinates or health data in transit.
2. **Replay Attack:** Attackers capturing a valid past location packet (e.g., a packet stating the pet is safely inside the geofence) and repeatedly resending it to the server to fake the pet's location.
3. **GPS Spoofing / Teleportation Attack:** Attackers submitting completely fake GPS coordinates jumping miles away in a single second to bypass the tracker.

---

## 5. Security Architecture & Mitigation Strategies
To stop these attacks, our IoT architecture implements a robust cryptographic security mechanism:
* **HMAC-SHA256 Signature (MitM Protection):** Both the ESP32 and the Server share a secret key (`DEVICE_SHARED_SECRET`). Before sending data, the ESP32 hashes the payload using this key. The server verifies the hash. If an attacker changes even one digit of the GPS data, the signature breaks, and the server automatically rejects the packet.
* **Nonces & Timestamps (Replay Attack Protection):** Every request includes the current Unix Timestamp and a randomly generated "Nonce" (Number used once). The server checks that the timestamp is within 5 minutes of the server time, and it saves the Nonce to the MongoDB database. If an attacker resends the same packet, the database catches the duplicate Nonce and rejects the request with a 409 Conflict error.
* **Speed/Jump Validation (GPS Spoofing Protection):** The server calculates the distance between the last known GPS coordinate and the new one. It divides this by the time difference to find the speed. If the calculated speed exceeds 60 meters/second (an impossible speed for a pet), it flags it as a "GPS jump rejected", preventing location spoofing.

---

## 6. Full System Architecture
The complete system is divided into 3 main layers:
1. **Hardware / Edge Layer (ESP32 C++):**
   - Interfaces with physical sensors (GPS, Pulse).
   - Synchronizes internal clocks using NTP servers (`pool.ntp.org`).
   - Cryptographically signs data payloads.
   - Pushes JSON payloads via Wi-Fi HTTP requests.
2. **Backend & API Layer (Next.js Server & MongoDB):**
   - Receives POST requests at `/api/device/location`.
   - Validates cryptographic signatures, nonces, and reasonable GPS speeds.
   - Updates the current `PetStatus` and logs the data in `PetHistory` inside a NoSQL Database (MongoDB).
   - Serves data to the web frontend using authenticated Next.js API routes.
3. **Frontend Presentation Layer (React / Next.js):**
   - Authenticates the pet owner using NextAuth.
   - Polls the backend (`/api/pet`) every 5 seconds for live real-time data.
   - Displays real-time location on an interactive Map (MapLibre/Mapbox).
   - Allows users to drag and drop geofence boundary circles.
