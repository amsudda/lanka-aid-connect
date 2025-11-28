import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { centersAPI } from "@/services/api";
import { EmergencyCenter } from "@/types/database";
import { MapPin, Phone, CheckCircle, AlertTriangle, BookOpen, ChevronRight, Navigation, Plus, Loader2, Target, Filter, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const disasterGuides = [
  {
    id: "flood",
    title: "Flood Safety",
    icon: "🌊",
    tips: [
      "Move to higher ground immediately",
      "Don't walk through moving water",
      "Stay away from electrical equipment",
      "Boil drinking water before use",
    ],
  },
  {
    id: "landslide",
    title: "Landslide Safety",
    icon: "⛰️",
    tips: [
      "Evacuate if advised by authorities",
      "Listen for unusual sounds like trees cracking",
      "Move away from the path of debris",
      "Stay awake and alert during heavy rain",
    ],
  },
  {
    id: "drought",
    title: "Drought Management",
    icon: "☀️",
    tips: [
      "Conserve water for essential uses",
      "Collect rainwater when possible",
      "Avoid midday outdoor activities",
      "Keep food and water stored safely",
    ],
  },
];

const districtCoordinators = [
  { district: "Colombo", name: "Asanka / Biyagam (Team APAD)", phone: "0777277747", phone2: "0758861202" },
  { district: "Ampara", name: "Chinthaka", phone: "0778308136" },
  { district: "Batticaloa", name: "Haleem", phone: "0777176652" },
  { district: "Galle", name: "Sumith", phone: "0772257855" },
  { district: "Matara", name: "District Coordinator", phone: "0718302318" },
  { district: "Kurunegala", name: "District Coordinator", phone: "0766120882" },
  { district: "Puttalam", name: "District Coordinator", phone: "0777173579" },
  { district: "Gampaha", name: "Anudatta / Roshan", phone: "0719677772", phone2: "0785444094" },
  { district: "Ratnapura", name: "District Coordinator", phone: "0714021047" },
  { district: "Badulla", name: "District Coordinator", phone: "0717000391" },
  { district: "Trincomalee", name: "District Coordinator", phone: "0778309835" },
  { district: "Jaffna", name: "Jana", phone: "0770601141" },
  { district: "Kalutara", name: "District Coordinator", phone: "0718327248" },
  { district: "Anuradhapura", name: "District Coordinator", phone: "0711502633" },
];

export default function EmergencyCenters() {
  const [centers, setCenters] = useState<EmergencyCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [addCenterOpen, setAddCenterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [centerForm, setCenterForm] = useState({
    name: "",
    address: "",
    district: "",
    phone: "",
    location_lat: "",
    location_lng: "",
    needs_list: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setSortByDistance(true);
        toast.success("Location detected! Showing nearby centers");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location");
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Get unique districts from centers
  const districts = Array.from(new Set(centers.map(c => c.district).filter(Boolean))).sort();

  // Filter and sort centers
  const filteredCenters = centers
    .filter(center => {
      // Filter by district
      if (selectedDistrict !== "all" && center.district !== selectedDistrict) {
        return false;
      }
      return true;
    })
    .map(center => {
      // Calculate distance if user location is available
      if (userLocation && center.location_lat && center.location_lng) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          center.location_lat,
          center.location_lng
        );
        return { ...center, distance };
      }
      return { ...center, distance: undefined };
    })
    .sort((a, b) => {
      // Sort by distance if enabled and both have distances
      if (sortByDistance && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const fetchCenters = async () => {
    try {
      console.log("Fetching centers from API...");
      const data = await centersAPI.getAll();
      console.log("Fetched centers data:", data);
      console.log("Data type:", typeof data);
      console.log("Is array?", Array.isArray(data));
      console.log("Centers count:", Array.isArray(data) ? data.length : 0);
      setCenters(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        toast.success(`Loaded ${data.length} emergency centers`);
      }
    } catch (error: any) {
      console.error("Error fetching centers:", error);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      setCenters([]);
      toast.error(`Failed to load centers: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("GPS Location captured:");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);
        console.log("Accuracy:", accuracy, "meters");
        console.log("Timestamp:", new Date(position.timestamp).toLocaleString());

        setCenterForm({
          ...centerForm,
          location_lat: lat.toFixed(7),
          location_lng: lng.toFixed(7),
        });

        toast.success(`Location captured! (Accuracy: ${Math.round(accuracy)}m)`, {
          duration: 3000,
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location unavailable. Try again.";
            break;
          case error.TIMEOUT:
            errorMessage += "Request timeout. Try again.";
            break;
          default:
            errorMessage += "Please enter manually.";
        }

        toast.error(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmitCenter = async () => {
    if (!centerForm.name || !centerForm.address || !centerForm.district) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const needsList = centerForm.needs_list
        ? centerForm.needs_list.split(",").map(item => item.trim()).filter(Boolean)
        : [];

      await centersAPI.create({
        name: centerForm.name,
        address: centerForm.address,
        district: centerForm.district,
        phone: centerForm.phone || undefined,
        location_lat: centerForm.location_lat ? parseFloat(centerForm.location_lat) : undefined,
        location_lng: centerForm.location_lng ? parseFloat(centerForm.location_lng) : undefined,
        needs_list: needsList.length > 0 ? needsList : undefined,
      });

      toast.success("Emergency center registered successfully! It will be verified soon.");
      setAddCenterOpen(false);
      setCenterForm({
        name: "",
        address: "",
        district: "",
        phone: "",
        location_lat: "",
        location_lng: "",
        needs_list: "",
      });
      fetchCenters();
    } catch (error: any) {
      console.error("Error registering center:", error);
      toast.error(error.message || "Failed to register center");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="Emergency Centers">
      <div className="py-6 space-y-6">
        {/* Emergency Alert Banner */}
        <div className="px-4">
          <div className="bg-gradient-to-r from-destructive/10 to-warning/10 rounded-2xl p-4 border border-destructive/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Emergency Helpline</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Disaster Management Center: <span className="font-bold text-foreground">117</span>
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* District Coordinators */}
        <section className="px-4 space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Lifeguard District Coordinators
          </h2>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-border">
                {districtCoordinators.map((coordinator, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-sm text-foreground">
                            {coordinator.district}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {coordinator.name}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <a
                          href={`tel:${coordinator.phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {coordinator.phone}
                        </a>
                        {coordinator.phone2 && (
                          <a
                            href={`tel:${coordinator.phone2}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            {coordinator.phone2}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Tap any number to call the district coordinator directly
          </p>
        </section>

        {/* Disaster Safety Guides */}
        <section className="px-4 space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Safety Guides
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {disasterGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)}
                className={cn(
                  "shrink-0 p-4 rounded-2xl border-2 transition-all text-left min-w-[140px]",
                  activeGuide === guide.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-3xl block mb-2">{guide.icon}</span>
                <span className="font-medium text-sm">{guide.title}</span>
              </button>
            ))}
          </div>

          {/* Active Guide Tips */}
          {activeGuide && (
            <div className="bg-card rounded-2xl p-4 border border-border animate-in">
              <h4 className="font-semibold mb-3">
                {disasterGuides.find(g => g.id === activeGuide)?.title} Tips
              </h4>
              <ul className="space-y-2">
                {disasterGuides.find(g => g.id === activeGuide)?.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Relief Centers */}
        <section className="space-y-3">
          <div className="px-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Relief Centers</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredCenters.length} of {centers.length}
              </Badge>
              <Dialog open={addCenterOpen} onOpenChange={setAddCenterOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Center
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] p-4 gap-2">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-base sm:text-lg">Register Emergency Center</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2.5 overflow-y-auto pr-1">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Center Name *</Label>
                      <Input
                        placeholder="Community Relief Center"
                        value={centerForm.name}
                        onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Address *</Label>
                      <Textarea
                        placeholder="Full address of the center"
                        value={centerForm.address}
                        onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                        className="rounded-xl text-sm min-h-[70px]"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">District *</Label>
                      <Input
                        placeholder="Colombo, Galle, Kandy"
                        value={centerForm.district}
                        onChange={(e) => setCenterForm({ ...centerForm, district: e.target.value })}
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+94 XX XXX XXXX"
                        value={centerForm.phone}
                        onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs font-medium">GPS Location</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                          className="h-7 text-xs px-2"
                        >
                          {gettingLocation ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Getting...
                            </>
                          ) : (
                            <>
                              <Target className="w-3 h-3 mr-1" />
                              Get GPS
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={centerForm.location_lat}
                          onChange={(e) => setCenterForm({ ...centerForm, location_lat: e.target.value })}
                          className="h-10 rounded-xl text-sm"
                        />
                        <Input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={centerForm.location_lng}
                          onChange={(e) => setCenterForm({ ...centerForm, location_lng: e.target.value })}
                          className="h-10 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Needed Items (comma-separated)</Label>
                      <Textarea
                        placeholder="Food, Water, Medicine, Clothes"
                        value={centerForm.needs_list}
                        onChange={(e) => setCenterForm({ ...centerForm, needs_list: e.target.value })}
                        className="rounded-xl text-sm min-h-[60px]"
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="hero"
                      className="w-full h-11 text-sm mt-3"
                      onClick={handleSubmitCenter}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        "Register Center"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="px-4">
            <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filter Centers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">District</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={sortByDistance ? "default" : "outline"}
                      className="flex-1 h-10 rounded-xl"
                      onClick={getUserLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting...
                        </>
                      ) : (
                        <>
                          <MapPinned className="w-4 h-4 mr-2" />
                          {sortByDistance ? "Nearby" : "Show Nearby"}
                        </>
                      )}
                    </Button>
                    {sortByDistance && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => {
                          setSortByDistance(false);
                          setUserLocation(null);
                          toast.success("Location filter cleared");
                        }}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {sortByDistance && userLocation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Showing centers sorted by distance from your location
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border/50 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="px-4">
              <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {centers.length === 0 ? "No Centers Listed" : "No Centers Found"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {centers.length === 0
                    ? "Emergency relief centers will be listed here during active disasters."
                    : "No centers match your filter criteria. Try changing the filters."}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {filteredCenters.map((center) => (
                <div
                  key={center.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (center.location_lat && center.location_lng) {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${center.location_lat},${center.location_lng}`,
                            '_blank'
                          );
                        } else {
                          toast.error("GPS location not available for this center");
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{center.name}</h3>
                            {center.is_verified && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </div>
                          {center.distance !== undefined && (
                            <Badge variant="outline" className="text-xs mt-1 bg-primary/5 text-primary border-primary/20">
                              <Navigation className="w-3 h-3 mr-1" />
                              {center.distance < 1
                                ? `${Math.round(center.distance * 1000)}m away`
                                : `${center.distance.toFixed(1)}km away`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {center.address}, {center.district}
                      </p>
                      {center.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {center.phone}
                        </p>
                      )}
                      {center.needs_list && center.needs_list.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {center.needs_list.slice(0, 3).map((need, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {need}
                            </Badge>
                          ))}
                          {center.needs_list.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{center.needs_list.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {center.location_lat && center.location_lng && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${center.location_lat},${center.location_lng}`,
                              '_blank'
                            );
                          }}
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      )}
                      {center.phone && (
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <a href={`tel:${center.phone}`}>
                            <Phone className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
