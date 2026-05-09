import mongoose, { Schema, model, models } from "mongoose";

// Simplified Geofence (Lasso only)
const GeofenceSchema = new Schema({
  coordinates: { type: [[Number]], default: [] }, // Array of points [lng, lat]
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
  petId: { type: String, required: true, unique: true, index: true },
  deviceId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "Apollo" },
  species: { type: String, default: "Canine" },
  breed: { type: String, default: "Golden Retriever" },
  age: { type: String, default: "4 Years" },
  weight: { type: String, default: "32 kg" },
  imageUrl: { type: String },
  location: { type: LocationSchema },
  geofence: { type: GeofenceSchema, default: () => ({ coordinates: [] }) },
  alert: { type: Boolean, default: false },
  battery: { type: Number, default: 100 },
  isOnline: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now, index: true }
});

const PetHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  petId: { type: String, required: true },
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
  name: { type: String, required: false }, // Legacy field
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, // Legacy field
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetToken: { type: String, required: false },
  resetTokenExpiry: { type: Date, required: false },
  preferredTheme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
  
  // New Profile Fields
  fullName: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  address: {
    house: { type: String, default: "" },
    locality: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pinCode: { type: String, default: "" }
  },
  profileImage: { type: String, default: "" },

  // Comprehensive Settings
  notificationSettings: {
    telegram: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    heartRate: { type: Boolean, default: true },
    offline: { type: Boolean, default: true },
  },
  trackingSettings: {
    telemetryInterval: { type: Number, default: 3 }, // in seconds
    autoFollow: { type: Boolean, default: true },
  },
  appearanceSettings: {
    animationEnabled: { type: Boolean, default: true },
    compactMode: { type: Boolean, default: false },
  },
  primaryDeviceId: { type: String, default: "" },
});

// Alert Schema
const AlertSchema = new Schema({
  petId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'GEOFENCE_BREACH' },
  message: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  lastNotifiedAt: { type: Date }
});

export const PetStatus = models.PetStatus || model("PetStatus", PetStatusSchema);
export const PetHistory = models.PetHistory || model("PetHistory", PetHistorySchema);
export const DeviceNonce = models.DeviceNonce || model("DeviceNonce", DeviceNonceSchema);
export const User = models.User || model("User", UserSchema);
export const Alert = models.Alert || model("Alert", AlertSchema);

// Mapping to the live GPS + Pulse history collection
const GPSHistorySchema = new Schema({
  deviceId: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  pulseBpm: { type: Number },
  pulseRaw: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true }
}, { collection: 'gpshistory' });

export const GPSHistory = models.GPSHistory || model("GPSHistory", GPSHistorySchema);
