import mongoose, { Schema, model, models } from "mongoose";

const GeofenceSchema = new Schema({
  type: { type: String, enum: ["circle", "lasso"], default: "circle" },
  lat: { type: Number, default: 18.989899 },
  lng: { type: Number, default: 73.109232 },
  radius: { type: Number, default: 100 },
  coordinates: { type: [[Number]], default: undefined },
});

const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  satellites: { type: Number },
  hdop: { type: Number },
  distance: { type: Number },
  pulseBpm: { type: Number },
  pulseRaw: { type: Number },
});

const PetStatusSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  petId: { type: String, required: true },
  name: { type: String, default: "Apollo" },
  species: { type: String, default: "Canine" },
  breed: { type: String, default: "Golden Retriever" },
  age: { type: String, default: "4 Years" },
  weight: { type: String, default: "32 kg" },
  imageUrl: { type: String },
  location: { type: LocationSchema },
  geofence: { type: GeofenceSchema },
  alert: { type: Boolean, default: false },
  deviceStatus: { type: String, enum: ["inside", "outside", "unknown"], default: "unknown" },
});

const PetHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  petId: { type: String, default: "default_pet" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true, index: true },
  satellites: { type: Number },
  hdop: { type: Number },
  distance: { type: Number },
  pulseBpm: { type: Number },
  pulseRaw: { type: Number },
  alert: { type: Boolean, default: false },
});

const DeviceNonceSchema = new Schema({
  nonce: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String, required: false },
  resetTokenExpiry: { type: Date, required: false },
});
export const PetStatus = models.PetStatus || model("PetStatus", PetStatusSchema);
export const PetHistory = models.PetHistory || model("PetHistory", PetHistorySchema);
export const DeviceNonce = models.DeviceNonce || model("DeviceNonce", DeviceNonceSchema);
export const User = models.User || model("User", UserSchema);
