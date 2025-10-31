import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint } from '../types';
import './MapView.css';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  routePoints: RoutePoint[];
  currentPosition: { lat: number; lng: number };
}

export const MapView = ({ routePoints, currentPosition }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on Sri Lanka
    mapInstance.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
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

    // Remove existing route layer if any
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

    // Convert route points to Leaflet LatLng format
    const latLngs: L.LatLngExpression[] = routePoints.map(point => [
      point.latitude,
      point.longitude,
    ]);

    // Add route polyline
    routeLayerRef.current = L.polyline(latLngs, {
      color: '#667eea',
      weight: 4,
      opacity: 0.7,
    }).addTo(mapInstance.current);

    // Fit map to route bounds
    mapInstance.current.fitBounds(routeLayerRef.current.getBounds(), {
      padding: [50, 50],
    });
  }, [routePoints]);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom cyclist icon
    const cyclistIcon = L.divIcon({
      className: 'cyclist-marker',
      html: '<div class="cyclist-icon">🚴</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add marker for current position
    markerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
      icon: cyclistIcon,
    }).addTo(mapInstance.current);

    // Add popup with current location
    markerRef.current.bindPopup(
      `<strong>Your Current Position</strong><br/>Lat: ${currentPosition.lat.toFixed(
        4
      )}<br/>Lng: ${currentPosition.lng.toFixed(4)}`
    );

    // Pan to current position
    mapInstance.current.panTo([currentPosition.lat, currentPosition.lng]);
  }, [currentPosition]);

  return <div ref={mapRef} className="map-container" />;
};

