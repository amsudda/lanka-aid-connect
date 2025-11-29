import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { postsAPI, donationsAPI, authAPI } from "@/services/api";
import { NeedPost, Donation, CATEGORY_LABELS, CATEGORY_ICONS, NeedCategory } from "@/types/database";
import {
  MapPin, Phone, MessageCircle, Clock, Flag, ChevronLeft,
  Heart, User, Loader2, Navigation, Camera, Image as ImageIcon, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryBadgeClasses: Record<NeedCategory, string> = {
  food: "badge-food",
  dry_rations: "badge-dry-rations",
  baby_items: "badge-baby",
  medical: "badge-medical",
  clothes: "badge-clothes",
  other: "badge-other",
};

export default function NeedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<NeedPost | null>(null);
  const [images, setImages] = useState<{ image_url: string }[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donateForm, setDonateForm] = useState({
    quantity: 1,
    message: "",
    donor_phone: "",
    item_description: "",
    delivery_date: ""
  });
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [proofPreviews, setProofPreviews] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchDonations();
    }
    // Check if user is authenticated
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData.user);
    } catch (error) {
      setUser(null);
    }
  };

  const fetchPost = async () => {
    try {
      const postData = await postsAPI.getById(id!);
      setPost(postData);

      // Images are included in the post data from the backend
      if (postData.images && postData.images.length > 0) {
        setImages(postData.images.map(img => ({ image_url: img.image_url })));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Post not found");
      navigate("/");
    }
  };

  const fetchDonations = async () => {
    try {
      const data = await donationsAPI.getByPost(id!);
      setDonations(data);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + proofImages.length > 3) {
      toast.error("Maximum 3 proof images allowed");
      return;
    }

    const newImages = [...proofImages, ...files].slice(0, 3);
    setProofImages(newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setProofPreviews(newPreviews);
  };

  const removeProofImage = (index: number) => {
    const newImages = proofImages.filter((_, i) => i !== index);
    const newPreviews = proofPreviews.filter((_, i) => i !== index);
    setProofImages(newImages);
    setProofPreviews(newPreviews);
  };

  const handleDonate = async () => {
    if (!user) {
      toast.error("Please sign in to donate");
      navigate("/profile");
      return;
    }

    // Validation
    if (!donateForm.donor_phone.trim()) {
      toast.error("Please provide your phone number for verification");
      return;
    }

    if (!donateForm.item_description.trim()) {
      toast.error("Please describe what you're donating");
      return;
    }

    if (proofImages.length === 0) {
      toast.error("Please upload at least one photo as proof of donation");
      return;
    }

    if (!post) return;

    setDonating(true);

    try {
      // Create donation using backend API with proof images
      await donationsAPI.create(post.id, {
        donor_name: user.full_name || "Anonymous",
        quantity: donateForm.quantity,
        message: donateForm.message || undefined,
        donor_phone: donateForm.donor_phone,
        item_description: donateForm.item_description,
        delivery_date: donateForm.delivery_date || undefined,
        proof_images: proofImages.length > 0 ? proofImages : undefined,
      });

      toast.success("Thank you for your donation! 🙏 Your donation is pending verification.");
      setDonateOpen(false);
      setDonateForm({
        quantity: 1,
        message: "",
        donor_phone: "",
        item_description: "",
        delivery_date: ""
      });
      setProofImages([]);
      setProofPreviews([]);

      // Refresh post and donations
      fetchPost();
      fetchDonations();
    } catch (error: any) {
      console.error("Error donating:", error);
      toast.error(error.message || "Failed to process donation");
    } finally {
      setDonating(false);
    }
  };

  if (loading || !post) {
    return (
      <PageLayout showHeader={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const progress = Math.min((post.quantity_donated / post.quantity_needed) * 100, 100);
  const isComplete = progress >= 100;
  const whatsappLink = post.whatsapp_link || `https://wa.me/${post.phone_number.replace(/\D/g, '')}`;

  return (
    <PageLayout showHeader={false}>
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-muted">
          <img
            src={
              images[activeImage]?.image_url
                ? images[activeImage].image_url.startsWith('http')
                  ? images[activeImage].image_url
                  : `${window.location.origin}${images[activeImage].image_url}`
                : "/placeholder.svg"
            }
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === activeImage ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Category badge */}
        <Badge
          className={cn(
            "absolute top-4 right-4",
            categoryBadgeClasses[post.category]
          )}
        >
          {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category]}
        </Badge>

        {isComplete && (
          <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex items-center justify-center">
            <Badge className="bg-success text-success-foreground text-xl px-6 py-3">
              ✓ Fulfilled
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 -mt-6 relative bg-background rounded-t-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.victim_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {(() => {
                try {
                  const date = new Date(post.created_at);
                  if (isNaN(date.getTime())) {
                    return "Recently";
                  }
                  return formatDistanceToNow(date, { addSuffix: true });
                } catch {
                  return "Recently";
                }
              })()}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Donation Progress</span>
            <span className={cn(
              "font-bold",
              isComplete ? "text-success" : progress < 25 ? "text-destructive" : "text-warning"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isComplete ? "progress-complete" : progress < 25 ? "progress-urgent" : "progress-partial"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-foreground">
              {post.quantity_donated} / {post.quantity_needed}
            </span>
            <span className="text-sm text-muted-foreground">items received</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {post.location_city ? `${post.location_city}, ` : ""}{post.location_district}
                </p>
                <p className="text-sm text-muted-foreground">Sri Lanka</p>
                {post.location_lat && post.location_lng && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📍 GPS: {Number(post.location_lat).toFixed(6)}, {Number(post.location_lng).toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            {post.location_lat && post.location_lng && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://www.google.com/maps?q=${post.location_lat},${post.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </a>
              </Button>
            )}
          </div>
          {(post.location_landmark || post.location_description) && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
              {post.location_landmark && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Landmark</p>
                  <p className="text-sm text-foreground">{post.location_landmark}</p>
                </div>
              )}
              {post.location_description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Directions</p>
                  <p className="text-sm text-foreground">{post.location_description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{post.description}</p>
        </div>

        {/* Donors */}
        {donations.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Donors ({donations.length})
            </h3>
            <div className="space-y-2">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{donation.donor_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Donated {donation.quantity} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" className="flex-1" disabled={isComplete}>
                <Heart className="w-5 h-5 mr-2" />
                {isComplete ? "Fulfilled" : "Donate Items"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-h-[85vh] max-sm:overflow-y-auto max-sm:flex max-sm:flex-col">
              <DialogHeader className="max-sm:space-y-1 max-sm:shrink-0">
                <DialogTitle className="max-sm:text-base">Confirm Your Donation</DialogTitle>
                <p className="text-xs text-muted-foreground max-sm:hidden">Please provide details and proof to help prevent spam</p>
              </DialogHeader>
              <div className="space-y-3 py-3 max-sm:space-y-2 max-sm:py-2 max-sm:overflow-y-auto max-sm:flex-1">
                {/* Proof of Donation Images */}
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-sm max-sm:text-xs">
                    <Camera className="w-3 h-3 max-sm:w-3 max-sm:h-3" />
                    Proof of Donation * (1-3 photos)
                  </Label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {proofPreviews.map((url, index) => (
                      <div key={index} className="relative shrink-0">
                        <img
                          src={url}
                          alt={`Proof ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeProofImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {proofImages.length < 3 && (
                      <>
                        <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Camera className="w-5 h-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground text-center px-1">Take Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleProofImageUpload}
                          />
                        </label>
                        <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground text-center px-1">From Gallery</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleProofImageUpload}
                          />
                        </label>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-sm:hidden">Upload photos showing the items you're donating</p>
                </div>

                {/* Donor Phone */}
                <div className="space-y-1">
                  <Label htmlFor="donor_phone" className="text-sm max-sm:text-xs">Your Contact Number *</Label>
                  <Input
                    id="donor_phone"
                    type="tel"
                    placeholder="+94 XX XXX XXXX"
                    value={donateForm.donor_phone}
                    onChange={(e) => setDonateForm({ ...donateForm, donor_phone: e.target.value })}
                    className="h-10 rounded-xl max-sm:h-9 max-sm:text-sm"
                    required
                  />
                </div>

                {/* Item Description */}
                <div className="space-y-1">
                  <Label htmlFor="item_description" className="text-sm max-sm:text-xs">What are you donating? *</Label>
                  <Textarea
                    id="item_description"
                    placeholder="e.g., 5kg rice, 2 bottles oil..."
                    value={donateForm.item_description}
                    onChange={(e) => setDonateForm({ ...donateForm, item_description: e.target.value })}
                    className="rounded-xl min-h-[60px] max-sm:min-h-[50px] max-sm:text-sm"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <Label htmlFor="quantity" className="text-sm max-sm:text-xs">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={post.quantity_needed - post.quantity_donated}
                    value={donateForm.quantity}
                    onChange={(e) => setDonateForm({ ...donateForm, quantity: parseInt(e.target.value) || 1 })}
                    className="h-10 rounded-xl max-sm:h-9 max-sm:text-sm"
                  />
                </div>

                {/* Delivery Date */}
                <div className="space-y-1">
                  <Label htmlFor="delivery_date" className="text-sm max-sm:text-xs">Delivery Date (optional)</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={donateForm.delivery_date}
                    onChange={(e) => setDonateForm({ ...donateForm, delivery_date: e.target.value })}
                    className="h-10 rounded-xl max-sm:h-9 max-sm:text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <Label htmlFor="message" className="text-sm max-sm:text-xs">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a message..."
                    value={donateForm.message}
                    onChange={(e) => setDonateForm({ ...donateForm, message: e.target.value })}
                    className="rounded-xl min-h-[50px] max-sm:min-h-[40px] max-sm:text-sm"
                  />
                </div>
              </div>

              <div className="max-sm:shrink-0 max-sm:border-t max-sm:border-border max-sm:pt-3 max-sm:-mb-2">
                <Button
                  variant="hero"
                  className="w-full max-sm:h-10 max-sm:text-sm"
                  onClick={handleDonate}
                  disabled={donating}
                >
                  {donating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 max-sm:w-3 max-sm:h-3" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Donation"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground max-sm:hidden mt-2">
                  Your donation will be verified before being confirmed
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="lg" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 text-success" />
            </a>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <a href={`tel:${post.phone_number}`}>
              <Phone className="w-5 h-5" />
            </a>
          </Button>
        </div>

        {/* Flag */}
        <Button variant="ghost" className="w-full text-muted-foreground">
          <Flag className="w-4 h-4 mr-2" />
          Report this post
        </Button>
      </div>
    </PageLayout>
  );
}
