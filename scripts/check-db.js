const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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
  } catch (e) {}
}

loadEnv();

async function check() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));

  const gpsHistory = await mongoose.connection.db.collection('gpshistory').find().sort({timestamp: -1}).limit(5).toArray();
  console.log("Recent gpshistory entries:", JSON.stringify(gpsHistory, null, 2));

  const petStatus = await mongoose.connection.db.collection('petstatuses').find().toArray();
  console.log("PetStatus entries:", JSON.stringify(petStatus, null, 2));

  process.exit(0);
}

check();
