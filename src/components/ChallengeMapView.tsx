import { useEffect, useRef, useState } from "react";
import type { RoutePoint, LeaderboardEntry, ChallengeGroup } from "../types";
import "./MapViewGoogleMaps.css";

interface ChallengeMapViewProps {
  routePoints: RoutePoint[];
  leaderboardEntries: LeaderboardEntry[];
  challengeRouteId?: number;
  groupRankings?: ChallengeGroup[]; // For inter-group challenges
}

export const ChallengeMapView = ({
  routePoints,
  leaderboardEntries,
  groupRankings,
}: ChallengeMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const startFinishMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const endMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (mapInstance.current) return;

      // Ensure AdvancedMarkerElement library is loaded
      await google.maps.importLibrary("marker");

      mapInstance.current = new window.google.maps.Map(mapRef.current!, {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 8,
        mapId: "CHALLENGE_MAP_ID",
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

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  // Draw route polylines
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || routePoints.length === 0) return;

    const path = routePoints.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }));

    // Remove existing polylines
    if (routePolylineRef.current) routePolylineRef.current.setMap(null);

    // Draw full route (blue)
    routePolylineRef.current = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#667eea",
      strokeOpacity: 0.6,
      strokeWeight: 4,
      map: mapInstance.current,
    });

    // Add Start marker
    if (routePoints.length > 0) {
      const startPoint = routePoints[0];
      if (startFinishMarkerRef.current) {
        startFinishMarkerRef.current.map = null;
      }

      const startPinElement = document.createElement("div");
      startPinElement.innerHTML = "📍";
      startPinElement.style.fontSize = "30px";
      startPinElement.style.textAlign = "center";

      startFinishMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: startPoint.latitude, lng: startPoint.longitude },
        map: mapInstance.current,
        content: startPinElement,
        title: "Start",
      });
    }

    // Add End marker
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
        title: "Finish",
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
  }, [mapLoaded, routePoints]);

  // Update participant/group markers
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || routePoints.length === 0) return;
    
    // For inter-group challenges, check groupRankings; for others, check leaderboardEntries
    if (!groupRankings && leaderboardEntries.length === 0) return;
    if (groupRankings && groupRankings.length === 0) return;

    // Calculate cumulative distances for interpolation
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371;
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

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();

    // If groupRankings is provided, show group markers (for inter-group challenges)
    if (groupRankings && groupRankings.length > 0) {
      console.log(`Displaying ${groupRankings.length} groups on map:`, groupRankings.map(g => ({
        name: g.groupName,
        distance: g.totalDistanceCovered,
        position: g.currentPositionLat && g.currentPositionLng ? `${g.currentPositionLat}, ${g.currentPositionLng}` : 'MISSING'
      })));
      
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidMarkers = false;

      groupRankings.forEach((group) => {
        if (!group.currentPositionLat || !group.currentPositionLng) {
          console.warn(`Group ${group.groupName} (ID: ${group.groupId}) missing position data. Total distance: ${group.totalDistanceCovered.toFixed(2)} km`);
          return;
        }

        const position = {
          lat: group.currentPositionLat,
          lng: group.currentPositionLng,
        };

        bounds.extend(position);
        hasValidMarkers = true;

        const pinElement = document.createElement("div");
        pinElement.style.display = "flex";
        pinElement.style.flexDirection = "column";
        pinElement.style.alignItems = "center";
        pinElement.style.gap = "2px";

        const emoji = document.createElement("div");
        emoji.innerHTML = "👥";
        emoji.style.fontSize = "28px";
        emoji.style.lineHeight = "1";

        const label = document.createElement("div");
        label.textContent = `#${group.rank}`;
        label.style.fontSize = "11px";
        label.style.fontWeight = "bold";
        label.style.color = "#667eea";
        label.style.backgroundColor = "white";
        label.style.padding = "3px 6px";
        label.style.borderRadius = "4px";
        label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        pinElement.appendChild(emoji);
        pinElement.appendChild(label);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: mapInstance.current,
          content: pinElement,
          title: `${group.groupName} - ${group.totalDistanceCovered.toFixed(2)} km`,
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;">
            <strong style="color: #667eea; font-size: 16px;">
              👥 Group #${group.rank}
            </strong><br/>
            <strong>${group.groupName}</strong><br/>
            Total Distance: <strong>${group.totalDistanceCovered.toFixed(2)} km</strong><br/>
            Progress: <strong>${Math.min(group.progressPercentage, 100).toFixed(1)}%</strong><br/>
            Members: <strong>${group.memberCount}</strong><br/>
            Lat: ${position.lat.toFixed(4)}<br/>
            Lng: ${position.lng.toFixed(4)}
          </div>`,
        });

        pinElement.addEventListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.set(group.groupId, marker);
      });

      // Fit map bounds to show all groups and route
      if (hasValidMarkers) {
        // Include route points in bounds
        routePoints.forEach((point) => {
          bounds.extend({ lat: point.latitude, lng: point.longitude });
        });
        
        mapInstance.current.fitBounds(bounds, {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        });
      }
    } else {
      // Create markers for each participant (for individual/group challenges)
      leaderboardEntries.forEach((entry) => {
        if (!entry.currentPositionLat || !entry.currentPositionLng) return;

        const position = {
          lat: entry.currentPositionLat,
          lng: entry.currentPositionLng,
        };

        const pinElement = document.createElement("div");
        pinElement.style.display = "flex";
        pinElement.style.flexDirection = "column";
        pinElement.style.alignItems = "center";
        pinElement.style.gap = "2px";

        const emoji = document.createElement("div");
        emoji.innerHTML = entry.isCurrentUser ? "🚴" : "👤";
        emoji.style.fontSize = "24px";
        emoji.style.lineHeight = "1";

        const label = document.createElement("div");
        label.textContent = `#${entry.rank}`;
        label.style.fontSize = "10px";
        label.style.fontWeight = "bold";
        label.style.color = entry.isCurrentUser ? "#667eea" : "#666";
        label.style.backgroundColor = "white";
        label.style.padding = "2px 4px";
        label.style.borderRadius = "3px";
        label.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";

        pinElement.appendChild(emoji);
        pinElement.appendChild(label);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: mapInstance.current,
          content: pinElement,
          title: `${entry.firstName} ${entry.lastName} - ${entry.distanceCoveredKm.toFixed(2)} km`,
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;">
            <strong style="color: ${entry.isCurrentUser ? "#667eea" : "#333"}; font-size: 16px;">
              ${entry.isCurrentUser ? "🚴 You" : "👤"} #${entry.rank}
            </strong><br/>
            <strong>${entry.firstName} ${entry.lastName}</strong><br/>
            Distance: <strong>${entry.distanceCoveredKm.toFixed(2)} km</strong><br/>
            Progress: <strong>${entry.progressPercentage.toFixed(1)}%</strong><br/>
            Lat: ${position.lat.toFixed(4)}<br/>
            Lng: ${position.lng.toFixed(4)}
          </div>`,
        });

        pinElement.addEventListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.set(entry.userId, marker);
      });
    }
  }, [mapLoaded, routePoints, leaderboardEntries, groupRankings]);

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

