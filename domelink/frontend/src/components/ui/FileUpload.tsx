import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, File, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  scope?: "architect" | "portfolio" | "consultation" | "inspiration" | "project" | "deliverable";
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  scope = "project",
  maxSizeMB = 5,
  accept = "image/*,application/pdf",
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadFile(file, scope);
      toast.success("File uploaded perfectly.");
      onUploadSuccess(res.url || res.uploaded?.secure_url || res.asset?.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <motion.div
      className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-300 ${isDragging ? "border-foreground bg-secondary/30" : "border-border bg-card"} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0"
        onChange={handleChange}
        accept={accept}
        disabled={isUploading}
      />
      
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-foreground" />
            <span className="text-body-sm">Optimizing & Uploading...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-body font-medium text-foreground mb-1">
              Drag & drop to upload
            </p>
            <p className="text-caption">
              Upload inspiration boards or site PDFs (Max {maxSizeMB}MB)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default FileUpload;
