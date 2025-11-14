"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface MapControllerProps {
  center: LatLngExpression;
}

export default function MapController({ center }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

