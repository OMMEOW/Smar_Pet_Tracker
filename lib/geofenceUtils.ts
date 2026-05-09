import { isPointInsideGeofence } from "./geofenceLogic";
import { PetStatus, Alert } from "./models";
import dbConnect from "./mongodb";
import { sendTelegramAlert } from "./telegram";

/**
 * Synchronize alert state in DB for a specific pet.
 * Every pet has its own dedicated fence.
 */
export async function evaluatePetFenceStatus(petId: string) {
  await dbConnect();

  const pet = await PetStatus.findOne({ petId });
  if (!pet || !pet.location) return null;

  const geofence = pet.geofence;

  if (!geofence || !geofence.coordinates || geofence.coordinates.length < 3) {
    // If no geofence, ensure no active alerts
    await Alert.updateMany(
      { petId, userId: pet.userId, status: "ACTIVE" },
      { $set: { status: "RESOLVED", resolvedAt: new Date() } }
    );
    await PetStatus.updateOne({ petId }, { $set: { alert: false } });
    return { isInside: true, alert: false };
  }

  const isInside = isPointInsideGeofence(
    pet.location.latitude,
    pet.location.longitude,
    geofence
  );

  const existingAlert = await Alert.findOne({
    petId,
    userId: pet.userId,
    status: "ACTIVE",
  });

    if (!isInside) {
    let alertDoc = existingAlert;

    if (!alertDoc) {
      // NEW BREACH DETECTED - Create Alert in DB
      alertDoc = await Alert.create({
        petId,
        userId: pet.userId,
        type: "GEOFENCE_BREACH",
        message: `${pet.name || "Your pet"} has left the designated safe zone.`,
        status: "ACTIVE",
      });
      console.log(`[Alert System] Created ACTIVE alert for ${pet.name}`);
    }

    // TELEGRAM NOTIFICATION: Send if never notified OR cooldown (60s) passed
    const now = Date.now();
    const lastNotified = alertDoc.lastNotifiedAt ? new Date(alertDoc.lastNotifiedAt).getTime() : 0;
    const cooldownMs = 60000; // 60 seconds cooldown

    if (!alertDoc.lastNotifiedAt || (now - lastNotified > cooldownMs)) {
      console.log(`[Alert System] Sending/Re-sending Telegram notification for ${pet.name}...`);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const googleMapsUrl = `https://maps.google.com/?q=${pet.location.latitude},${pet.location.longitude}`;

      const telegramMessage = `🚨 <b>BREACH DETECTED</b>\n\n` +
        `<b>Pet:</b> ${pet.name || 'Unknown'}\n` +
        `<b>Status:</b> Outside Safe Zone\n` +
        `<b>Time:</b> ${timeStr}\n\n` +
        `<b>Location:</b>\n${googleMapsUrl}`;

      try {
        await sendTelegramAlert(telegramMessage);
        // Mark as notified so we don't spam
        await Alert.updateOne({ _id: alertDoc._id }, { $set: { lastNotifiedAt: new Date() } });
      } catch (err) {
        console.error(`[Alert System] Telegram delivery failed for ${pet.name}:`, err);
      }
    }

    await PetStatus.updateOne({ petId }, { $set: { alert: true } });
  } else {
    if (existingAlert) {
      // PET RETURNED - Send Telegram Notification and Resolve
      console.log(`[Alert System] Pet ${pet.name} returned. Resolving alert.`);

      await Alert.updateOne(
        { _id: existingAlert._id },
        { $set: { status: "RESOLVED", resolvedAt: new Date() } }
      );

      const telegramMessage = `<b>PET RETURNED</b>\n\n` +
        `<b>Pet:</b> ${pet.name || 'Unknown'}\n` +
        `<b>Status:</b> Back Inside Safe Zone`;

      try {
        await sendTelegramAlert(telegramMessage);
      } catch (err) {
        console.error(`[Alert System] Telegram resolution message failed:`, err);
      }
    }
    await PetStatus.updateOne({ petId }, { $set: { alert: false } });
  }

  console.log(`[Geofence Engine] Pet ${pet.name} (${petId}): isInside=${isInside}, alert=${!isInside}`);

  return { isInside, alert: !isInside };
}
