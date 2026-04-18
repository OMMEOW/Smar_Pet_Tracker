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
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  petId: { type: String, default: "default_pet" },
  location: { type: LocationSchema },
  geofence: { type: GeofenceSchema },
  alert: { type: Boolean, default: false },
});

// Pet History Schema
const PetHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  petId: { type: String, default: "default_pet" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true, index: true },
});

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const PetStatus = models.PetStatus || model("PetStatus", PetStatusSchema);
export const PetHistory = models.PetHistory || model("PetHistory", PetHistorySchema);
export const User = models.User || model("User", UserSchema);
