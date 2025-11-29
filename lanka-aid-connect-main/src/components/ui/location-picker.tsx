import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { LatLng, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Fix Leaflet default marker icon issue with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map when coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  onLocationSelect,
  initialLat = 7.8731, // Center of Sri Lanka
  initialLng = 80.7718,
  className
}: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [tempPosition, setTempPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (initialLat && initialLng) {
      setMarkerPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setTempPosition([lat, lng]);
  };

  const confirmLocation = () => {
    if (tempPosition) {
      setMarkerPosition(tempPosition);
      onLocationSelect(tempPosition[0], tempPosition[1]);
      setShowMap(false);
      setTempPosition(null);
      toast.success("Location selected successfully!");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setTempPosition([lat, lng]);
        toast.success("Current location loaded!");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get current location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const displayPosition = tempPosition || markerPosition;

  return (
    <div className={cn("space-y-3", className)}>
      {!showMap ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-xl"
          onClick={() => setShowMap(true)}
        >
          <MapPin className="w-5 h-5 mr-2" />
          {initialLat && initialLng ? "Change Location on Map" : "Pick Location on Map"}
        </Button>
      ) : (
        <div className="border-2 border-border rounded-xl overflow-hidden">
          {/* Map Header */}
          <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-semibold text-sm">Select Your Location</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setShowMap(false);
                setTempPosition(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="relative h-[300px] w-full">
            <MapContainer
              center={displayPosition}
              zoom={13}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              <Marker position={displayPosition} />
              <RecenterMap lat={displayPosition[0]} lng={displayPosition[1]} />
            </MapContainer>

            {/* Floating GPS Button */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 z-[1000] shadow-lg h-10 w-10 rounded-full"
              onClick={getCurrentLocation}
            >
              <Navigation className="w-5 h-5" />
            </Button>
          </div>

          {/* Map Footer */}
          <div className="bg-card px-4 py-3 border-t border-border space-y-3">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">
                {tempPosition ? "📍 New location selected:" : "📍 Current location:"}
              </p>
              <p className="font-mono">
                Lat: {displayPosition[0].toFixed(6)}, Lng: {displayPosition[1].toFixed(6)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowMap(false);
                  setTempPosition(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={confirmLocation}
                disabled={!tempPosition}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Confirm Location
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Tap anywhere on the map to select a location
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
