"use client";
import React, { useEffect, useRef, useState } from "react";
import { Compass, ExternalLink, MapPin, Navigation, RefreshCw } from "lucide-react";

interface PropertyMapProps {
  city: string;
  locality: string;
  address?: string;
  title?: string;
  price?: number;
  formattedPrice?: string;
}

// Preset coordinates for major Indian cities and hubs
const CITY_COORDINATES: Record<string, [number, number]> = {
  delhi: [28.6139, 77.209],
  "new delhi": [28.6139, 77.209],
  dwarka: [28.5921, 77.046],
  noida: [28.5355, 77.391],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  mumbai: [19.076, 72.8777],
  andheri: [19.1136, 72.8697],
  bandra: [19.0596, 72.8295],
  thane: [19.2183, 72.9781],
  "navi mumbai": [19.033, 73.0297],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  whitefield: [12.9698, 77.7499],
  koramangala: [12.9352, 77.6245],
  pune: [18.5204, 73.8567],
  kharadi: [18.5516, 73.9352],
  wakad: [18.5987, 73.7686],
  hyderabad: [17.385, 78.4867],
  gachibowli: [17.4401, 78.3489],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
};

function getCoordinates(city: string, locality: string): [number, number] {
  const normLoc = (locality || "").toLowerCase().trim();
  const normCity = (city || "").toLowerCase().trim();

  // Check locality first
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normLoc.includes(key)) return coords;
  }

  // Check city
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normCity.includes(key)) return coords;
  }

  // Default fallback: New Delhi (matching the design screenshot)
  return [28.6139, 77.209];
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function PropertyMap({
  city,
  locality,
  address,
  title,
  price,
  formattedPrice,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const propertyCoords = getCoordinates(city, locality);
  const fullAddress = [address, locality, city].filter(Boolean).join(", ");
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress || `${locality}, ${city}`
  )}`;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Initialize Leaflet Map
        const map = L.map(mapContainerRef.current, {
          center: propertyCoords,
          zoom: 14,
          scrollWheelZoom: false,
        });

        // Add OpenStreetMap Tile Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Custom styled SVG pin for the property
        const propertyPinIcon = L.divIcon({
          className: "custom-property-pin",
          html: `
            <div style="position: relative; transform: translate(-50%, -100%);">
              <div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; border: 1.5px solid white;">
                <span>${formattedPrice || "Verified"}</span>
              </div>
              <div style="width: 14px; height: 14px; background: #059669; transform: rotate(45deg); margin: -7px auto 0 auto; border-right: 1.5px solid white; border-bottom: 1.5px solid white;"></div>
              <div style="width: 8px; height: 8px; background: rgba(5,150,105,0.4); border-radius: 50%; margin: 2px auto 0 auto; filter: blur(1px);"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          popupAnchor: [0, -32],
        });

        // Property Marker
        const marker = L.marker(propertyCoords, { icon: propertyPinIcon }).addTo(map);

        // Popup with property details
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 160px; padding: 4px;">
            <p style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">${title || locality || "Property"}</p>
            <p style="margin: 0 0 4px 0; color: #059669; font-weight: bold; font-size: 12px;">${formattedPrice ? formattedPrice : ""}</p>
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">${fullAddress}</p>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #059669; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px;">Open in Google Maps &rarr;</a>
          </div>
        `);

        // Add a gentle circle radius highlighting the area
        L.circle(propertyCoords, {
          color: "#059669",
          fillColor: "#10b981",
          fillOpacity: 0.12,
          radius: 500,
        }).addTo(map);

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (err) {
        console.error("Leaflet map initialization failed:", err);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, locality]);

  // Handle Geolocation Access (User's location)
  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationStatus("Locating your device...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const [propLat, propLon] = propertyCoords;

        const dist = calculateDistanceKm(userLat, userLon, propLat, propLon);
        setDistanceKm(dist);
        setLocationStatus(`You are ~${dist} km from this property.`);
        setLocating(false);

        const L = (await import("leaflet")).default;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Remove old user marker if present
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        // Add User Location Marker
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div style="position: relative; transform: translate(-50%, -50%);">
              <div style="width: 18px; height: 18px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.6);"></div>
              <div style="position: absolute; top: -7px; left: -7px; width: 32px; height: 32px; background: rgba(37,99,235,0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const userMarker = L.marker([userLat, userLon], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>Your Current Location</b>")
          .openPopup();

        userMarkerRef.current = userMarker;

        // Fit map bounds to show both user and property
        const bounds = L.latLngBounds([
          [userLat, userLon],
          [propLat, propLon],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      },
      (err) => {
        setLocating(false);
        setLocationStatus("Could not access location. Please allow location permissions.");
        console.warn("Geolocation error:", err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* SECTION HEADER: | Location */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-5 bg-green-700 rounded-full inline-block" />
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Location</h2>
      </div>

      {/* LOCATION INFO BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{locality || city}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {address ? `${address}, ` : ""}
              {locality}, {city}
            </p>
          </div>
        </div>

        {/* EXTERNAL MAPS LINK & LOCATION ACCESS CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-green-700 hover:border-green-300 text-xs font-semibold shadow-sm transition disabled:opacity-60"
            title="Check distance from your current location"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${locating ? "animate-spin" : ""}`} />
            <span>{locating ? "Locating..." : "My Location"}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-xs font-semibold shadow-sm transition"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* DISTANCE BADGE IF GEOLOCATION ACCESSED */}
      {distanceKm !== null && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center justify-between">
          <span>{locationStatus}</span>
          <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md text-[11px]">
            {distanceKm} km away
          </span>
        </div>
      )}

      {/* INTERACTIVE LEAFLET MAP CONTAINER */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {loading && (
          <div className="absolute inset-0 z-10 bg-slate-100 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            <span className="text-xs font-medium">Loading interactive Leaflet map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Powered by OpenStreetMap &amp; Leaflet API</span>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(propertyCoords, 14);
            }
          }}
          className="text-green-700 hover:underline font-medium"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
