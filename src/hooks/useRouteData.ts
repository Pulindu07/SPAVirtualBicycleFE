import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { RoutePoint } from "../types";

export const useRouteData = () => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeLength, setRouteLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [points, length] = await Promise.all([
          api.getRoutePoints(),
          api.getRouteLength(),
        ]);
        setRoutePoints(points);
        setRouteLength(length);
      } catch (err) {
        setError("Failed to fetch route data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();
  }, []);

  return { routePoints, routeLength, loading, error };
};
