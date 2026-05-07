import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import dbConnect from "@/lib/mongodb";
import { DeviceNonce, PetHistory, PetStatus, User } from "@/lib/models";

const MIN_GEOFENCE_RADIUS_METERS = 30;
const MAX_GEOFENCE_RADIUS_METERS = 300;
const DEFAULT_GEOFENCE_RADIUS_METERS = 100;
const REQUEST_MAX_AGE_MS = 5 * 60 * 1000;
const MAX_REASONABLE_SPEED_MPS = 60;

function distanceBetweenMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isValidHmac(secret: string, message: string, signature: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", secret).update(message).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function isFiniteInRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export async function POST(request: Request) {
  try {
    const configuredKey = process.env.DEVICE_API_KEY;
    const ownerEmail = process.env.DEVICE_OWNER_EMAIL;
    const deviceId = request.headers.get("x-device-id") || "";
    const timestampHeader = request.headers.get("x-device-timestamp") || "";
    const nonce = request.headers.get("x-device-nonce") || "";
    const signature = request.headers.get("x-device-signature") || "";

    if (!configuredKey || !ownerEmail) {
      return NextResponse.json(
        { error: "DEVICE_API_KEY and DEVICE_OWNER_EMAIL must be configured" },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const timestamp = Number(timestampHeader);
    const requestAgeMs = Math.abs(Date.now() - timestamp * 1000);

    if (!deviceId || !timestamp || !nonce || !signature) {
      return NextResponse.json({ error: "Missing signed device headers" }, { status: 401 });
    }

    if (requestAgeMs > REQUEST_MAX_AGE_MS) {
      return NextResponse.json({ error: "Stale device request" }, { status: 401 });
    }

    if (!/^[A-Za-z0-9_-]{8,64}$/.test(nonce)) {
      return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
    }

    const signedMessage = `${timestampHeader}.${nonce}.${rawBody}`;
    if (!isValidHmac(configuredKey, signedMessage, signature)) {
      return NextResponse.json({ error: "Invalid device signature" }, { status: 401 });
    }

    await dbConnect();

    try {
      await DeviceNonce.create({ deviceId, nonce });
    } catch {
      return NextResponse.json({ error: "Replay detected" }, { status: 409 });
    }

    const body = JSON.parse(rawBody);
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!isFiniteInRange(latitude, -90, 90) || !isFiniteInRange(longitude, -180, 180)) {
      return NextResponse.json(
        { error: "latitude and longitude must be valid coordinates" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: ownerEmail });
    if (!user) {
      return NextResponse.json(
        { error: `No user found for DEVICE_OWNER_EMAIL=${ownerEmail}` },
        { status: 404 }
      );
    }

    const petId = body.petId || "default_pet";
    const locationTimestamp = timestamp * 1000;
    const satellitesValue = Number(body.satellites);
    const hdopValue = Number(body.hdop);
    const pulseBpmValue = Number(body.pulseBpm);
    const pulseRawValue = Number(body.pulseRaw);
    const satellites = isFiniteInRange(satellitesValue, 0, 80) ? satellitesValue : undefined;
    const hdop = isFiniteInRange(hdopValue, 0, 99) ? hdopValue : undefined;
    const pulseBpm = isFiniteInRange(pulseBpmValue, 20, 240) ? pulseBpmValue : undefined;
    const pulseRaw = isFiniteInRange(pulseRawValue, 0, 4095) ? pulseRawValue : undefined;
    const existingStatus = await PetStatus.findOne({ userId: user._id, petId });

    if (existingStatus?.location?.timestamp) {
      const previous = existingStatus.location;
      const secondsSincePrevious = Math.max((locationTimestamp - previous.timestamp) / 1000, 1);
      const jumpMeters = distanceBetweenMeters(
        previous.latitude,
        previous.longitude,
        latitude,
        longitude
      );
      const speedMps = jumpMeters / secondsSincePrevious;

      if (speedMps > MAX_REASONABLE_SPEED_MPS) {
        return NextResponse.json(
          {
            error: "GPS jump rejected",
            jumpMeters: Number(jumpMeters.toFixed(1)),
            speedMps: Number(speedMps.toFixed(1)),
          },
          { status: 422 }
        );
      }
    }

    const configuredRadius = Number(existingStatus?.geofence?.radius);
    const geofence = {
      type: "circle",
      lat: latitude,
      lng: longitude,
      radius: isFiniteInRange(configuredRadius, MIN_GEOFENCE_RADIUS_METERS, MAX_GEOFENCE_RADIUS_METERS)
        ? configuredRadius
        : DEFAULT_GEOFENCE_RADIUS_METERS,
    };

    const distance =
      geofence?.type === "circle" && Number.isFinite(geofence.lat) && Number.isFinite(geofence.lng)
        ? distanceBetweenMeters(latitude, longitude, geofence.lat, geofence.lng)
        : Number(body.distance);
    const alert =
      geofence?.type === "circle" && Number.isFinite(distance)
        ? distance > Number(geofence.radius || 20)
        : Boolean(body.alert);

    const location = {
      latitude,
      longitude,
      timestamp: locationTimestamp,
      satellites,
      hdop,
      pulseBpm,
      pulseRaw,
      distance: Number.isFinite(distance) ? distance : undefined,
    };

    const status = await PetStatus.findOneAndUpdate(
      { userId: user._id, petId },
      {
        $set: {
          userId: user._id,
          petId,
          location,
          geofence,
          alert,
          deviceStatus: alert ? "outside" : "inside",
        },
      },
      { new: true, upsert: true }
    );

    await PetHistory.create({
      userId: user._id,
      petId,
      latitude,
      longitude,
      timestamp: locationTimestamp,
      satellites,
      hdop,
      pulseBpm,
      pulseRaw,
      distance: Number.isFinite(distance) ? distance : undefined,
      alert,
    });

    return NextResponse.json({
      ok: true,
      alert,
      distance: Number.isFinite(distance) ? Number(distance.toFixed(1)) : null,
      pulseBpm,
      pulseRaw,
      radius: geofence?.radius,
      status,
    });
  } catch (error) {
    console.error("Device API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
