"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Loader2 } from "lucide-react";
import axiosSecure from "@/lib/axiosSecure";

export function ImageUploadDialog({
  onImageSelected,
  buttonLabel = "Add Image",
  dialogTitle = "Add Image",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = (useState < File) | (null > null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError("");
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosSecure.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.url) {
        onImageSelected(response.data.url);
        setIsOpen(false);
        setFile(null);
      } else {
        throw new Error("Upload failed: No URL returned");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl) {
      onImageSelected(imageUrl);
      setIsOpen(false);
      setImageUrl("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Upload size={14} /> {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="gap-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleUrlChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUrlSubmit} disabled={!imageUrl}>
                Add Image
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
