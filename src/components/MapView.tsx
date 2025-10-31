import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RoutePoint } from "../types";
import "./MapView.css";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  routePoints: RoutePoint[];
  currentPosition: { lat: number; lng: number };
  progressPercent?: number;
}

export const MapView = ({
  routePoints,
  currentPosition,
  progressPercent = 0,
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const completedRouteRef = useRef<L.Polyline | null>(null);
  const remainingRouteRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on Sri Lanka
    mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || routePoints.length === 0) return;

    // Remove existing route layers if any
    if (completedRouteRef.current) {
      completedRouteRef.current.remove();
    }
    if (remainingRouteRef.current) {
      remainingRouteRef.current.remove();
    }

    // Convert route points to Leaflet LatLng format
    const latLngs: L.LatLngExpression[] = routePoints.map((point) => [
      point.latitude,
      point.longitude,
    ]);

    // Calculate the split point based on progress percentage
    const splitIndex = Math.floor((progressPercent / 100) * routePoints.length);

    if (splitIndex > 0) {
      // Completed portion (green)
      const completedLatLngs = latLngs.slice(0, splitIndex + 1);
      completedRouteRef.current = L.polyline(completedLatLngs, {
        color: "#48bb78", // Green for completed
        weight: 5,
        opacity: 0.9,
      }).addTo(mapInstance.current);
    }

    if (splitIndex < routePoints.length - 1) {
      // Remaining portion (gray)
      const remainingLatLngs = latLngs.slice(splitIndex);
      remainingRouteRef.current = L.polyline(remainingLatLngs, {
        color: "blue", // Gray for remaining
        weight: 4,
        opacity: 0.6,
      }).addTo(mapInstance.current);
    }

    // Add Start/Finish marker at Matara (first and last point)
    if (routePoints.length > 0) {
      const startPoint = routePoints[0];

      // Create custom icon for start/finish
      const startFinishIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              font-size: 32px;
              text-align: center;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            ">🏁</div>
          </div>
        `,
        className: "start-finish-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      L.marker([startPoint.latitude, startPoint.longitude], {
        icon: startFinishIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup(
          `<div style="text-align: center; padding: 5px;">
            <strong style="font-size: 16px;">🏁 Start/Finish</strong><br/>
            <span style="color: #667eea; font-weight: 600;">Matara</span><br/>
            <span style="font-size: 12px; color: #718096;">Complete the loop!</span>
          </div>`
        );
    }

    // Fit map to route bounds (use completed route if exists, otherwise remaining)
    const boundsLayer = completedRouteRef.current || remainingRouteRef.current;
    if (boundsLayer) {
      mapInstance.current.fitBounds(boundsLayer.getBounds(), {
        padding: [50, 50],
      });
    }
  }, [routePoints, progressPercent]);

  useEffect(() => {
    if (!mapInstance.current || routePoints.length === 0) return;

    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Calculate the exact position on the route based on progress percentage
    const routeIndex = Math.floor((progressPercent / 100) * routePoints.length);
    const clampedIndex = Math.min(routeIndex, routePoints.length - 1);
    const exactPosition = routePoints[clampedIndex];

    // If we have a next point, interpolate between current and next for smoother positioning
    let lat = exactPosition.latitude;
    let lng = exactPosition.longitude;

    if (clampedIndex < routePoints.length - 1) {
      const nextPoint = routePoints[clampedIndex + 1];
      const segmentProgress =
        (progressPercent / 100) * routePoints.length - clampedIndex;

      // Linear interpolation between current point and next point
      lat =
        exactPosition.latitude +
        (nextPoint.latitude - exactPosition.latitude) * segmentProgress;
      lng =
        exactPosition.longitude +
        (nextPoint.longitude - exactPosition.longitude) * segmentProgress;
    }

    // Create custom cyclist icon
    const cyclistIcon = L.divIcon({
      className: "cyclist-marker",
      html: '<div class="cyclist-icon">🚴</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add marker at the calculated position
    markerRef.current = L.marker([lat, lng], {
      icon: cyclistIcon,
    }).addTo(mapInstance.current);

    // Add popup with current location
    markerRef.current.bindPopup(
      `<strong>Your Current Position</strong><br/>Progress: ${progressPercent.toFixed(
        2
      )}%<br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`
    );

    // Pan to current position
    mapInstance.current.panTo([lat, lng]);
  }, [routePoints, progressPercent, currentPosition]);

  return <div ref={mapRef} className="map-container" />;
};
