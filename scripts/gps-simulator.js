const http = require('http');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split(/\r?\n/).forEach(line => {
      const match = line.trim().match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    });
  } catch (e) {
    console.log('\x1b[33mWarning: Could not load .env\x1b[0m');
  }
}

loadEnv();

const mongoose = require('mongoose');
const API_URL = 'http://localhost:3000/api/pet/location';
const INTERVAL_MS = 2000;

// Store dynamic devices
let DEVICES = [];

// Helper to send POST request
function sendLocationUpdate(device) {
  const payload = JSON.stringify({
    deviceId: device.deviceId,
    lat: device.lat,
    lng: device.lng,
    battery: Math.round(device.battery),
    timestamp: Date.now()
  });

  const url = new URL(API_URL);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[${new Date().toISOString()}] \x1b[32mSuccess\x1b[0m: Sent update for ${device.deviceId} -> [${device.lat.toFixed(6)}, ${device.lng.toFixed(6)}] Battery: ${Math.round(device.battery)}%`);
      } else {
        console.log(`[${new Date().toISOString()}] \x1b[31mError\x1b[0m: Failed for ${device.deviceId} (${res.statusCode}): ${responseData}`);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`[${new Date().toISOString()}] \x1b[31mConnection Error\x1b[0m: Ensure Next.js is running on ${API_URL}`);
  });

  req.write(payload);
  req.end();
}

function simulateMovement(device) {
  if (!device.isOnline) return;

  // Simulate dog pausing to sniff/rest
  if (device.pauseTicks > 0) {
    device.pauseTicks--;
    sendLocationUpdate(device);
    return;
  }

  // 5% chance to pause for 2-5 intervals
  if (Math.random() < 0.05) {
    device.pauseTicks = Math.floor(Math.random() * 4) + 2;
    sendLocationUpdate(device);
    return;
  }

  // More natural wandering: heading changes slightly
  device.heading += (Math.random() - 0.5) * device.wanderFactor;

  // Move
  const dLat = Math.cos(device.heading) * device.speed;
  const dLng = Math.sin(device.heading) * device.speed;

  device.lat += dLat;
  device.lng += dLng;

  // Randomize speed slightly (dog trotting vs walking)
  const speedBase = 0.00003;
  if (Math.random() < 0.1) {
    // Sprint/Troat
    device.speed = speedBase * 3;
    device.wanderFactor = 0.1; // Straighter line when running
  } else {
    device.speed = speedBase + (Math.random() * 0.00002);
    device.wanderFactor = 0.5; // More wandering when walking
  }

  device.battery -= 0.02; // Slower battery drain
  if (device.battery <= 0) device.battery = 100;

  sendLocationUpdate(device);
}

async function startSimulation() {
  console.log(`
\x1b[36m==================================================
   GUARDIAN KINETIC - ESP32 GPS SIMULATOR
==================================================\x1b[0m
  `);

  if (!process.env.MONGODB_URI) {
    console.log('\x1b[31mError: MONGODB_URI not found in .env\x1b[0m');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB to discover registered pets...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Quick schema to read pets
    const PetStatus = mongoose.models.PetStatus || mongoose.model('PetStatus', new mongoose.Schema({
      petId: String,
      location: { latitude: Number, longitude: Number },
      geofence: {
        type: { type: String },
        center: {
          lat: Number,
          lng: Number
        },
        radius: Number,
        coordinates: [[Number]]
      },
      battery: Number
    }));

    const pets = await PetStatus.find({ userId: { $exists: true, $ne: null } });

    if (pets.length === 0) {
      console.log('\x1b[33mNo pets found in database. Please register a pet in the dashboard first.\x1b[0m');
      process.exit(0);
    }

    DEVICES = pets.map(pet => {
      // Logic to start at geofence if location is missing or for demo purposes
      let startLat = pet.location?.latitude || 19.044992;
      let startLng = pet.location?.longitude || 72.871277;

      if (pet.geofence?.type === 'circle' && pet.geofence.center?.lat) {
        startLat = pet.geofence.center.lat;
        startLng = pet.geofence.center.lng;
      } else if (pet.geofence?.type === 'lasso' && pet.geofence.coordinates?.length > 0) {
        startLng = pet.geofence.coordinates[0][0];
        startLat = pet.geofence.coordinates[0][1];
      }

      return {
        deviceId: pet.petId,
        lat: startLat,
        lng: startLng,
        battery: pet.battery || 100,
        speed: 0.00002 + (Math.random() * 0.00004), // Slower, more natural wandering
        heading: Math.random() * 2 * Math.PI,
        isOnline: true,
        wanderFactor: 0.3,
        pauseTicks: 0
      };
    });

    console.log(`\x1b[32mSuccessfully mapped ${DEVICES.length} active devices.\x1b[0m`);
    console.log(`Starting simulation loop at ${INTERVAL_MS}ms intervals...`);
    console.log('Press Ctrl+C to stop.\n');

    // Start loop
    setInterval(() => {
      DEVICES.forEach(device => simulateMovement(device));
    }, INTERVAL_MS);

  } catch (err) {
    console.error('\x1b[31mFailed to start simulator:\x1b[0m', err);
    process.exit(1);
  }
}

startSimulation();
