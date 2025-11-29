import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Flag } from "lucide-react";

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam', emoji: '📢' },
  { value: 'scam', label: 'Scam / Fraud', emoji: '⚠️' },
  { value: 'fake', label: 'Fake Request', emoji: '❌' },
  { value: 'harassment', label: 'Harassment', emoji: '🚫' },
  { value: 'inappropriate', label: 'Inappropriate Content', emoji: '⛔' },
  { value: 'other', label: 'Other', emoji: '🔍' },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function ReportModal({ isOpen, onClose, postId, postTitle }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
        body: JSON.stringify({
          reason: selectedReason,
          details: details || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      toast.success(data.message || 'Report submitted successfully. Thank you for helping keep our community safe.');

      // Reset form and close
      setSelectedReason('');
      setDetails('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setDetails('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg">Report Post</DialogTitle>
              <DialogDescription className="text-sm">
                Help us keep the community safe
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {postTitle}
            </p>
          </div>

          {/* Reason selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Why are you reporting this post? <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => (
                <Button
                  key={reason.value}
                  type="button"
                  variant={selectedReason === reason.value ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col items-center gap-1 text-left"
                  onClick={() => setSelectedReason(reason.value)}
                >
                  <span className="text-xl">{reason.emoji}</span>
                  <span className="text-xs font-medium">{reason.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional information that might help us review this report..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning message */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> False reports may result in action against your account.
              Please only report content that violates our community guidelines.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            <Flag className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
