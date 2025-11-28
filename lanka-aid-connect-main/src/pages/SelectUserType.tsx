import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, HandHelping } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SelectUserType() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"donor" | "requester" | null>(null);

  const handleContinue = () => {
    if (!selectedType) return;

    // Store the user type selection
    localStorage.setItem("selected_user_type", selectedType);

    // Redirect to Google auth with user type
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    window.location.href = `${backendUrl}/auth/google?userType=${selectedType}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Lanka Aid Connect</h1>
          <p className="text-muted-foreground">Choose how you'd like to help</p>
        </div>

        {/* User Type Cards */}
        <div className="space-y-4">
          {/* Donor Card */}
          <button
            onClick={() => setSelectedType("donor")}
            className={cn(
              "w-full p-6 rounded-2xl border-2 transition-all text-left",
              selectedType === "donor"
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                selectedType === "donor" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              )}>
                <Heart className="w-8 h-8" fill="currentColor" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">I Want to Donate</h3>
                <p className="text-sm text-muted-foreground">
                  Help those in need by providing supplies, funds, or volunteer assistance
                </p>
              </div>
            </div>
          </button>

          {/* Requester Card */}
          <button
            onClick={() => setSelectedType("requester")}
            className={cn(
              "w-full p-6 rounded-2xl border-2 transition-all text-left",
              selectedType === "requester"
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                selectedType === "requester" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              )}>
                <HandHelping className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">I Need Help</h3>
                <p className="text-sm text-muted-foreground">
                  Request essential supplies and assistance during times of need
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full h-12"
          onClick={handleContinue}
          disabled={!selectedType}
        >
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
