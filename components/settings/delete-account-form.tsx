"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescription2,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogTitle2,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DeleteAccountForm() {
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isConfirmed = confirmationText === "delete my account";

  const handleDeleteClick = () => {
    if (isConfirmed) {
      setShowConfirmDialog(true);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Account deleted successfully");
      window.location.href = "/auth/signin";
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl shadow-md border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                This will permanently delete:
              </p>
              <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
                <li>Your account and profile</li>
                <li>All expenses and transactions</li>
                <li>All categories</li>
                <li>All recurring transactions</li>
                <li>All account settings</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-mono bg-muted px-2 py-1 rounded">delete my account</span> to confirm
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="delete my account"
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={!isConfirmed || isSubmitting}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isSubmitting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle2 className="text-destructive">Confirm Account Deletion</DialogTitle2>
            <DialogDescription2>
              Are you sure you want to delete your account? All your data will be permanently lost.
            </DialogDescription2>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Yes, Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
