import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postsAPI } from "@/services/api";
import { DISTRICTS, CATEGORY_LABELS, CATEGORY_ICONS, NeedCategory } from "@/types/database";
import { Camera, MapPin, Phone, User, FileText, Package, Loader2, Navigation, Image, Mic, Users, Baby } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { LocationPicker } from "@/components/ui/location-picker";

const categories: NeedCategory[] = ['food', 'dry_rations', 'baby_items', 'medical', 'clothes', 'other'];

export default function PostNeed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<NeedCategory[]>([]);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);

  useEffect(() => {
    // Check if there's a token in the URL (from Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('userType');

    if (token) {
      // Store the token
      localStorage.setItem('auth_token', token);
      // Store user type
      if (userType) {
        localStorage.setItem('user_type', userType);
      }
      // Remove params from URL
      window.history.replaceState({}, document.title, '/post');
      // Show welcome message for new requesters
      if (userType === 'requester') {
        toast.success("Welcome! Please share your need with the community.", {
          duration: 4000,
        });
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    victim_name: "",
    phone_number: "",
    location_district: "",
    location_city: "",
    location_landmark: "",
    location_description: "",
    location_lat: undefined as number | undefined,
    location_lng: undefined as number | undefined,
    title: "",
    description: "",
    quantity_needed: 1,
    num_adults: 1,
    num_children: 0,
    num_infants: 0,
    infant_ages: [] as number[],
    is_group_request: false,
    group_size: undefined as number | undefined,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const toggleCategory = (cat: NeedCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
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

        setFormData(prev => ({
          ...prev,
          location_lat: parseFloat(lat.toFixed(7)),
          location_lng: parseFloat(lng.toFixed(7)),
        }));

        toast.success(`Location captured! (Accuracy: ${Math.round(accuracy)}m)`, {
          duration: 3000,
        });
        setLoadingLocation(false);
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
            errorMessage += "Please enable location services.";
        }

        toast.error(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleVoiceRecordingComplete = (blob: Blob) => {
    setVoiceNote(blob);
  };

  const handleVoiceRecordingDelete = () => {
    setVoiceNote(null);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location_lat: parseFloat(lat.toFixed(7)),
      location_lng: parseFloat(lng.toFixed(7)),
    }));
  };

  const handleInfantCountChange = (count: number) => {
    const newCount = Math.max(0, count);
    setFormData(prev => {
      const currentAges = prev.infant_ages;
      const newAges = Array(newCount).fill(0).map((_, i) => currentAges[i] || 1);
      return {
        ...prev,
        num_infants: newCount,
        infant_ages: newAges
      };
    });
  };

  const handleInfantAgeChange = (index: number, age: number) => {
    setFormData(prev => {
      const newAges = [...prev.infant_ages];
      newAges[index] = age;
      return {
        ...prev,
        infant_ages: newAges
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.victim_name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.phone_number.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!formData.location_district) {
      toast.error("Please select your district");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setLoading(true);

    try {
      // Create the post using the backend API
      // Note: Since backend supports single category, we'll use the first selected category
      const post = await postsAPI.create({
        victim_name: formData.victim_name,
        phone_number: formData.phone_number,
        location_district: formData.location_district,
        location_city: formData.location_city || undefined,
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        category: selectedCategories[0],
        title: formData.title,
        description: formData.description,
        quantity_needed: formData.quantity_needed,
        num_adults: formData.num_adults,
        num_children: formData.num_children,
        num_infants: formData.num_infants,
        infant_ages: formData.infant_ages.length > 0 ? formData.infant_ages : undefined,
        is_group_request: formData.is_group_request,
        group_size: formData.group_size,
        images: images.length > 0 ? images : undefined,
        voiceNote: voiceNote || undefined,
      });

      toast.success("Post created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Post a Need">
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Voice Note */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Message (Optional)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Record a voice message to explain your situation (max 2 minutes)
          </p>
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onRecordingDelete={handleVoiceRecordingDelete}
            maxDuration={120}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Photos (up to 5)</Label>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative shrink-0">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <>
                <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground text-center px-1">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture
                    className="hidden"
                    onChange={handleCameraCapture}
                  />
                </label>
                <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Image className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground text-center px-1">From Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.victim_name}
              onChange={(e) => setFormData({ ...formData, victim_name: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+94 XX XXX XXXX"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className="h-12 rounded-xl pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">This will be used for WhatsApp contact</p>
          </div>
        </div>

        {/* Family Composition */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Family Composition
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                value={formData.num_adults}
                onChange={(e) => setFormData({ ...formData, num_adults: parseInt(e.target.value) || 1 })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min={0}
                value={formData.num_children}
                onChange={(e) => setFormData({ ...formData, num_children: parseInt(e.target.value) || 0 })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="infants">Infants</Label>
              <Input
                id="infants"
                type="number"
                min={0}
                value={formData.num_infants}
                onChange={(e) => handleInfantCountChange(parseInt(e.target.value) || 0)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {formData.num_infants > 0 && (
            <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Baby className="w-4 h-4" />
                Infant Ages (in months)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {formData.infant_ages.map((age, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`infant-age-${index}`} className="text-xs text-muted-foreground">
                      Infant {index + 1} Age
                    </Label>
                    <Select
                      value={age.toString()}
                      onValueChange={(value) => handleInfantAgeChange(index, parseInt(value))}
                    >
                      <SelectTrigger id={`infant-age-${index}`} className="h-10 rounded-lg">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 36 }, (_, i) => i + 1).map((months) => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} {months === 1 ? 'month' : 'months'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-xl border border-border">
              <input
                type="checkbox"
                id="group-request"
                checked={formData.is_group_request}
                onChange={(e) => setFormData({
                  ...formData,
                  is_group_request: e.target.checked,
                  group_size: e.target.checked ? formData.group_size : undefined
                })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="group-request" className="text-sm font-medium cursor-pointer flex-1">
                This is a group request (asking help for multiple families)
              </Label>
            </div>

            {formData.is_group_request && (
              <div className="space-y-2 pl-8">
                <Label htmlFor="group-size" className="text-sm">
                  Number of families in the group
                </Label>
                <Input
                  id="group-size"
                  type="number"
                  min={2}
                  placeholder="e.g., 5"
                  value={formData.group_size || ''}
                  onChange={(e) => setFormData({ ...formData, group_size: parseInt(e.target.value) || undefined })}
                  className="h-12 rounded-xl max-w-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="rounded-xl"
            >
              {loadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Get Location
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>District *</Label>
              <Select
                value={formData.location_district}
                onValueChange={(value) => setFormData({ ...formData, location_district: value })}
                required
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City/Town</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={formData.location_city}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLat={formData.location_lat}
            initialLng={formData.location_lng}
          />

          {formData.location_lat && formData.location_lng && (
            <div className="text-xs text-muted-foreground bg-success/10 border border-success/20 p-3 rounded-xl">
              <p className="flex items-center gap-1 text-success font-medium">
                <MapPin className="w-3 h-3" />
                Location set: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="landmark">Nearby Landmark</Label>
            <Input
              id="landmark"
              placeholder="e.g., Near Central Bus Stand, Behind Post Office"
              value={formData.location_landmark}
              onChange={(e) => setFormData({ ...formData, location_landmark: e.target.value })}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Help people find you easily</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_desc">Location Details</Label>
            <Textarea
              id="location_desc"
              placeholder="Additional directions to reach your location..."
              value={formData.location_description}
              onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
              className="min-h-[80px] rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Provide detailed directions or address</p>
          </div>
        </div>

        {/* Need Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> What Do You Need?
          </h3>

          <div className="space-y-2">
            <Label>Categories * (Select all that apply)</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    selectedCategories.includes(cat)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl block mb-1">{CATEGORY_ICONS[cat]}</span>
                  <span className="text-xs font-medium">{CATEGORY_LABELS[cat]}</span>
                </button>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedCategories.map(cat => CATEGORY_LABELS[cat]).join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Need rice and lentils for family of 5"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your situation and what you need..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-[100px] rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Quantity Needed
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={formData.quantity_needed}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                setFormData({ ...formData, quantity_needed: value });
              }}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Post...
              </>
            ) : (
              "Post My Need"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Your post will be shared with the community
          </p>
        </div>
      </form>
    </PageLayout>
  );
}
