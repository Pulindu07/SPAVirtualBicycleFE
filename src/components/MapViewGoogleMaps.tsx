import { useEffect, useRef, useState } from "react";
import type { RoutePoint } from "../types";
import "./MapViewGoogleMaps.css";

interface MapViewGoogleMapsProps {
  routePoints: RoutePoint[];
  progressPercent?: number;
  coveredDistanceKm: number;
}

export const MapViewGoogleMaps = ({
  routePoints,
  progressPercent = 0,
  coveredDistanceKm,
}: MapViewGoogleMapsProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const completedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const startFinishMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const endMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (mapInstance.current) return;

      // Ensure AdvancedMarkerElement library is loaded
      await google.maps.importLibrary("marker");

      mapInstance.current = new window.google.maps.Map(mapRef.current!, {
        center: { lat: 7.8731, lng: 80.7718 }, // Center on Sri Lanka
        zoom: 8,
        mapId: "USER_PROGRESS_MAP_ID",
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMapLoaded(true);
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, [routePoints]);

  // Draw route polylines
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || routePoints.length === 0) return;

    const path = routePoints.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }));

    // Remove existing polylines
    if (routePolylineRef.current) routePolylineRef.current.setMap(null);
    if (completedPolylineRef.current) completedPolylineRef.current.setMap(null);

    // Calculate cumulative distances to find the correct split point
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Calculate cumulative distances for each point
    const cumulativeDistances = [0];
    let totalDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const dist = calculateDistance(
        routePoints[i].latitude,
        routePoints[i].longitude,
        routePoints[i + 1].latitude,
        routePoints[i + 1].longitude
      );
      totalDistance += dist;
      cumulativeDistances.push(totalDistance);
    }

    // --- POSITION & PATH CALCULATION ---
    const targetDistance = Math.min(coveredDistanceKm, totalDistance);

    // Find the segment where the cyclist is currently located
    let segmentIndex = 0;
    for (let i = 0; i < cumulativeDistances.length - 1; i++) {
      if (
        targetDistance >= cumulativeDistances[i] &&
        targetDistance <= cumulativeDistances[i + 1]
      ) {
        segmentIndex = i;
        break;
      }
    }

    // Interpolate the exact position within the segment
    const segmentStartDist = cumulativeDistances[segmentIndex];
    const segmentLength =
      cumulativeDistances[segmentIndex + 1] - segmentStartDist;
    const distanceIntoSegment = targetDistance - segmentStartDist;

    const fractionIntoSegment =
      segmentLength > 0 ? distanceIntoSegment / segmentLength : 0;

    const startOfSegment = routePoints[segmentIndex];
    const endOfSegment = routePoints[segmentIndex + 1];

    const interpolatedLat =
      startOfSegment.latitude +
      (endOfSegment.latitude - startOfSegment.latitude) * fractionIntoSegment;
    const interpolatedLng =
      startOfSegment.longitude +
      (endOfSegment.longitude - startOfSegment.longitude) * fractionIntoSegment;

    const calculatedPosition = { lat: interpolatedLat, lng: interpolatedLng };
    // --- END CALCULATION ---

    // Draw completed portion (green)
    if (segmentIndex >= 0) {
      const completedPath = [
        ...path.slice(0, segmentIndex + 1),
        calculatedPosition,
      ];

      completedPolylineRef.current = new window.google.maps.Polyline({
        path: completedPath,
        geodesic: true,
        strokeColor: "#48bb78", // Green for completed
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: mapInstance.current,
      });
    }

    // Draw remaining portion (blue)
    if (segmentIndex < path.length - 1) {
      const remainingPath = [
        calculatedPosition,
        ...path.slice(segmentIndex + 1),
      ];

      routePolylineRef.current = new window.google.maps.Polyline({
        path: remainingPath,
        geodesic: true,
        strokeColor: "#667eea", // Blue for remaining
        strokeOpacity: 0.6,
        strokeWeight: 4,
        map: mapInstance.current,
      });
    }

    // Add Start marker at first point (Dondra)
    if (routePoints.length > 0) {
      const startPoint = routePoints[0];
      if (startFinishMarkerRef.current) {
        startFinishMarkerRef.current.map = null;
      }

      const startPinElement = document.createElement("div");
      startPinElement.innerHTML = "📍";
      startPinElement.style.fontSize = "30px";
      startPinElement.style.textAlign = "center";

      startFinishMarkerRef.current =
        new google.maps.marker.AdvancedMarkerElement({
          position: { lat: startPoint.latitude, lng: startPoint.longitude },
          map: mapInstance.current,
          content: startPinElement,
          title: "Start: Dondra Head",
        });

      // Add info window on click
      const startInfoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <strong style="color: #10B981; font-size: 18px;">🚩 START</strong><br/>
          <strong>Dondra Head</strong><br/>
          Southernmost tip of Sri Lanka<br/>
          Lat: ${startPoint.latitude.toFixed(4)}<br/>
          Lng: ${startPoint.longitude.toFixed(4)}
        </div>`,
      });

      startPinElement.addEventListener("click", () => {
        startInfoWindow.open(mapInstance.current, startFinishMarkerRef.current);
        mapInstance.current?.setCenter(
          startFinishMarkerRef.current!.position as google.maps.LatLng
        );
        mapInstance.current?.setZoom(12);
      });
    }

    // Add End marker at last point (Point Pedro)
    if (routePoints.length > 1) {
      const endPoint = routePoints[routePoints.length - 1];
      if (endMarkerRef.current) {
        endMarkerRef.current.map = null;
      }

      const endPinElement = document.createElement("div");
      endPinElement.innerHTML = "🏁";
      endPinElement.style.fontSize = "30px";
      endPinElement.style.textAlign = "center";

      endMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: endPoint.latitude, lng: endPoint.longitude },
        map: mapInstance.current,
        content: endPinElement,
        title: "Finish: Point Pedro",
      });

      // Add info window on click
      const endInfoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <strong style="color: #EF4444; font-size: 18px;">🏁 FINISH</strong><br/>
          <strong>Point Pedro</strong><br/>
          Northernmost tip of Sri Lanka<br/>
          Lat: ${endPoint.latitude.toFixed(4)}<br/>
          Lng: ${endPoint.longitude.toFixed(4)}
        </div>`,
      });

      endPinElement.addEventListener("click", () => {
        endInfoWindow.open(mapInstance.current, endMarkerRef.current);
        mapInstance.current?.setCenter(
          endMarkerRef.current!.position as google.maps.LatLng
        );
        mapInstance.current?.setZoom(12);
      });
    }

    // Fit map to route bounds
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((coord) => bounds.extend(coord));
    mapInstance.current.fitBounds(bounds, {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    });
  }, [mapLoaded, routePoints, coveredDistanceKm]);

  // Update cyclist marker position
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || routePoints.length === 0) return;

    // --- RECALCULATE POSITION for marker ---
    // This logic is duplicated to ensure the marker useEffect is self-contained
    // and only runs when needed.
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const cumulativeDistances = [0];
    let totalDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const dist = calculateDistance(
        routePoints[i].latitude,
        routePoints[i].longitude,
        routePoints[i + 1].latitude,
        routePoints[i + 1].longitude
      );
      totalDistance += dist;
      cumulativeDistances.push(totalDistance);
    }

    const targetDistance = Math.min(coveredDistanceKm, totalDistance);
    let segmentIndex = 0;
    for (let i = 0; i < cumulativeDistances.length - 1; i++) {
      if (
        targetDistance >= cumulativeDistances[i] &&
        targetDistance <= cumulativeDistances[i + 1]
      ) {
        segmentIndex = i;
        break;
      }
    }

    const segmentStartDist = cumulativeDistances[segmentIndex];
    const segmentLength =
      cumulativeDistances[segmentIndex + 1] - segmentStartDist;
    const distanceIntoSegment = targetDistance - segmentStartDist;
    const fractionIntoSegment =
      segmentLength > 0 ? distanceIntoSegment / segmentLength : 0;
    const startOfSegment = routePoints[segmentIndex];
    const endOfSegment = routePoints[segmentIndex + 1];
    const interpolatedLat =
      startOfSegment.latitude +
      (endOfSegment.latitude - startOfSegment.latitude) * fractionIntoSegment;
    const interpolatedLng =
      startOfSegment.longitude +
      (endOfSegment.longitude - startOfSegment.longitude) * fractionIntoSegment;
    const calculatedPosition = { lat: interpolatedLat, lng: interpolatedLng };
    // --- END RECALCULATION ---

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    // Create cyclist marker at the accurately calculated position
    const cyclistPinElement = document.createElement("div");
    cyclistPinElement.innerHTML = "🚴";
    cyclistPinElement.style.fontSize = "30px";
    cyclistPinElement.style.textAlign = "center";
    cyclistPinElement.style.lineHeight = "1";

    markerRef.current = new google.maps.marker.AdvancedMarkerElement({
      position: calculatedPosition,
      map: mapInstance.current,
      content: cyclistPinElement,
      title: "Your Current Position",
    });

    // Add info window with progress details
    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="padding: 8px;">
        <strong style="color: #667eea; font-size: 16px;">🚴 Your Current Position</strong><br/>
        Progress: <strong>${progressPercent.toFixed(2)}%</strong><br/>
        Lat: ${calculatedPosition.lat.toFixed(4)}<br/>
        Lng: ${calculatedPosition.lng.toFixed(4)}
      </div>`,
    });

    cyclistPinElement.addEventListener("click", () => {
      infoWindow.open(mapInstance.current, markerRef.current);
    });

    // Pan to current position smoothly if it's in view
    const bounds = mapInstance.current.getBounds();
    if (bounds && !bounds.contains(calculatedPosition)) {
      mapInstance.current.panTo(calculatedPosition);
    }
  }, [mapLoaded, routePoints, coveredDistanceKm, progressPercent]);

  return (
    <div className="map-container-google">
      <div ref={mapRef} className="google-map" />
      {!mapLoaded && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};
