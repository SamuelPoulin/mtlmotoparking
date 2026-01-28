import { useState, useEffect } from "react";

interface GeocodeResult {
  display_name: string;
  place_id: number;
  lat: string;
  lon: string;
}

interface UseGeocodeProps {
  query: string;
  debounceTime?: number;
  limit?: number;
}

export default function useGeocode({
  query,
  debounceTime = 500,
  limit = 5,
}: UseGeocodeProps) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const handler = setTimeout(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          const params = new URLSearchParams({
            q: query,
            format: "json",
            limit: limit.toString(),
            addressdetails: "1",
            countrycodes: "ca",
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params}`,
            {
              headers: {
                "Accept-Language": "en", // Set preferred language
              },
            },
          );

          if (!response.ok) throw new Error("Geocoding failed");

          const data: GeocodeResult[] = await response.json();
          setResults(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setResults([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [query, debounceTime, limit]);

  return { results, loading, error };
}
