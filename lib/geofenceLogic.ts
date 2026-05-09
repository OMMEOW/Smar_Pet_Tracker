import * as turf from "@turf/turf";

export interface Geofence {
  coordinates: [number, number][];
}

/**
 * PRODUCTION-READY LASSO-ONLY VALIDATION ENGINE
 */

export function isInsidePolygonFence(latitude: number, longitude: number, coordinates: [number, number][]): boolean {
  if (!latitude || !longitude || !coordinates || coordinates.length < 3) return true;
  
  try {
    const point = turf.point([longitude, latitude]);
    const coords = [...coordinates];
    
    // Close the polygon if needed for Turf.js
    if (
      coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1]
    ) {
      coords.push(coords[0]);
    }
    
    const polygon = turf.polygon([coords]);
    return turf.booleanPointInPolygon(point, polygon);
  } catch (error) {
    console.error("[Geofence Engine Error]", error);
    return true; // Default to safe if calculation fails
  }
}

/**
 * Reusable wrapper for polygon geofence
 */
export function isPointInsideGeofence(
  latitude: number,
  longitude: number,
  geofence: Geofence
): boolean {
  if (!latitude || !longitude || !geofence || !geofence.coordinates || geofence.coordinates.length < 3) return true;
  return isInsidePolygonFence(latitude, longitude, geofence.coordinates);
}
