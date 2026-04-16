import mongoose, { Schema, model, models } from "mongoose";

// Geofence Schema
const GeofenceSchema = new Schema({
  lat: { type: Number, required: true, default: 19.123456 },
  lng: { type: Number, required: true, default: 72.987654 },
  radius: { type: Number, required: true, default: 100 },
});

// Location Schema (Current)
const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

// Pet Status Schema
const PetStatusSchema = new Schema({
  petId: { type: String, default: "default_pet" },
  location: { type: LocationSchema },
  geofence: { type: GeofenceSchema },
  alert: { type: Boolean, default: false },
});

// Pet History Schema
const PetHistorySchema = new Schema({
  petId: { type: String, default: "default_pet" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true, index: true },
});

export const PetStatus = models.PetStatus || model("PetStatus", PetStatusSchema);
export const PetHistory = models.PetHistory || model("PetHistory", PetHistorySchema);
