"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Upload, X, FileImage, FileText } from "lucide-react";

interface ReceiptUploadProps {
  expenseId?: string;
  onUploadComplete: (data: { filePath: string; fileName: string }) => void;
}

export function ReceiptUpload({ expenseId, onUploadComplete }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadMutation = trpc.expenses.uploadReceipt.useMutation({
    onSuccess: (data) => {
      toast.success("Receipt uploaded successfully");
      setUploading(false);
      setUploadProgress(0);
      onUploadComplete(data);
      setFile(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload receipt");
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPG, PNG, WebP, and PDF files are supported");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !expenseId) return;

    setUploading(true);
    setUploadProgress(10);

    try {
      await uploadMutation.mutate({ expenseId, file });

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      setTimeout(() => clearInterval(progressInterval), 2000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getPreviewContent = () => {
    if (!file) return null;

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    }

    if (file.type === "application/pdf") {
      return (
        <div className="flex items-center justify-center h-full">
          <FileText className="h-16 w-16 text-muted-foreground" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="receipt">Receipt</Label>
        <Input
          id="receipt"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {file && (
        <div className="flex items-start justify-between">
          <div className="flex-1 overflow-hidden rounded-lg border">
            {uploading ? (
              <div className="flex items-center justify-center h-24 bg-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="h-24 w-full">
                {getPreviewContent()}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 ml-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground truncate max-w-32">
                {file.name}
              </p>
              {uploading && (
                <span className="text-sm font-medium">{uploadProgress}%</span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {expenseId && file && !uploading && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Receipt
        </Button>
      )}
    </div>
  );
}
