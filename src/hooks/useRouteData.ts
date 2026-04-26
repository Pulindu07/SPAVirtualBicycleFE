import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { RoutePoint } from "../types";

interface UseRouteDataOptions {
  // When false and routeId is missing, do not fetch and return an empty state.
  // Default true preserves the global-default fallback used by Dashboard.
  allowDefaultFallback?: boolean;
}

export const useRouteData = (
  routeId?: number,
  options: UseRouteDataOptions = {}
) => {
  const { allowDefaultFallback = true } = options;
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeLength, setRouteLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId && !allowDefaultFallback) {
      setRoutePoints([]);
      setRouteLength(0);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchRouteData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [points, length] = await Promise.all([
          api.getRoutePoints(routeId, controller.signal),
          api.getRouteLength(routeId, controller.signal),
        ]);
        if (cancelled) return;
        setRoutePoints(points);
        setRouteLength(length);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError("Failed to fetch route data");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRouteData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routeId, allowDefaultFallback]);

  return { routePoints, routeLength, loading, error };
};
