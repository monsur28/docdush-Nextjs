"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageIcon, Loader2, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
// Remove the custom hook import if you are using sonner directly
// import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner"; // Use toast directly from sonner
import axiosSecure from "@/lib/axiosSecure";

// Zod schema for runtime validation
const siteInfoSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  metaTitle: z.string().min(5, {
    message: "Meta title must be at least 5 characters.",
  }),
  metaDescription: z.string().min(10, {
    message: "Meta description must be at least 10 characters.",
  }),
});

// Component definition
export function SiteInfoForm() {
  const [siteImage, setSiteImage] = useState(null);
  const [siteImageFile, setSiteImageFile] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(siteInfoSchema),
    defaultValues: {
      siteName: "",
      metaTitle: "",
      metaDescription: "",
    },
  });

  // Fetch existing site info on component mount
  useEffect(() => {
    async function fetchSiteInfo() {
      setIsLoading(true);
      try {
        const response = await axiosSecure.get("/api/site-info");
        const fetchedData = response.data?.data;

        if (fetchedData) {
          form.reset({
            siteName: fetchedData.siteName || "",
            metaTitle: fetchedData.metaTitle || "",
            metaDescription: fetchedData.metaDescription || "",
          });
          if (fetchedData.siteImage) setSiteImage(fetchedData.siteImage);
          if (fetchedData.favicon) setFavicon(fetchedData.favicon);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching site info:", error);
          // Use sonner's error style
          toast.error("Error loading site info", {
            description: "Could not load existing site information.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchSiteInfo();
  }, [form]); // Removed toast from dependency array

  // Function to upload a single image file
  async function uploadImage(file) {
    if (!file) return null;
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      const response = await axiosSecure.post("/api/upload", uploadFormData);
      if (response.data && response.data.url) {
        // Use sonner's success style for upload
        toast.success("Image uploaded successfully");
        return response.data.url;
      } else {
        throw new Error("API did not return an image URL after upload.");
      }
    } catch (error) {
      console.error(
        "Image upload failed:",
        error.response?.data || error.message
      );
      // Use sonner's error style for upload failure
      toast.error("Image upload failed", {
        description: error.message || "Could not upload the image.",
      });
      throw new Error("Failed to upload image."); // Re-throw for onSubmit
    }
  }

  // Function to handle form submission
  async function onSubmit(data) {
    setIsUploading(true);
    let siteImageUrl = siteImage;
    let faviconUrl = favicon;

    try {
      if (siteImageFile) {
        siteImageUrl = await uploadImage(siteImageFile);
      }
      if (faviconFile) {
        faviconUrl = await uploadImage(faviconFile);
      }

      const dataToSave = {
        ...data,
        siteImage: siteImageUrl,
        favicon: faviconUrl,
        updatedAt: new Date().toISOString(),
      };

      const response = await axiosSecure.post("/api/site-info", dataToSave);

      if (response.status !== 200 || !response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to save site information"
        );
      }

      // Use sonner's success style
      toast.success("Site information updated", {
        description: "Your site information has been successfully saved.",
      });

      setSiteImageFile(null);
      setFaviconFile(null);
      setSiteImage(siteImageUrl);
      setFavicon(faviconUrl);
    } catch (error) {
      console.error("Error submitting site info:", error);
      // Use sonner's error style
      toast.error("Update Failed", {
        description:
          error.message ||
          "Failed to update site information. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  // Handler for site image file input change
  function handleSiteImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image Too Large", {
        description: "Site image must be under 2MB.",
      });
      e.target.value = null;
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "Please select an image file.",
      });
      e.target.value = null;
      return;
    }
    setSiteImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSiteImage(imageUrl);
  }

  // Handler for favicon file input change
  function handleFaviconChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      toast.error("Favicon Too Large", {
        description: "Favicon should be under 100KB.",
      });
      e.target.value = null;
      return;
    }
    if (
      ![
        "image/x-icon",
        "image/png",
        "image/svg+xml",
        "image/vnd.microsoft.icon",
      ].includes(file.type)
    ) {
      toast.error("Invalid Favicon Type", {
        description: "Use .ico, .png, or .svg.",
      });
      e.target.value = null;
      return;
    }
    setFaviconFile(file);
    const imageUrl = URL.createObjectURL(file);
    setFavicon(imageUrl);
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Main form JSX (no changes needed here)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Site Image Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="font-medium">Site Image</div>
                <div className="text-sm text-muted-foreground">
                  This image will be used as the main image for your site.
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center gap-4">
                <div className="relative flex h-40 w-full items-center justify-center rounded-md border border-dashed">
                  {siteImage ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={siteImage}
                        alt="Site image preview"
                        fill
                        className="rounded-md object-cover"
                        onError={() => {
                          console.warn("Site image preview failed to load.");
                          setSiteImage(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <div className="text-sm">No image selected</div>
                    </div>
                  )}
                </div>
                <div className="flex w-full">
                  <Input
                    id="siteImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSiteImageChange}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("siteImage")?.click()
                    }
                    disabled={isUploading}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    {siteImage ? "Change Site Image" : "Upload Site Image"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favicon Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="font-medium">Favicon</div>
                <div className="text-sm text-muted-foreground">
                  This image will be used as the favicon for your site.
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center gap-4">
                <div className="relative flex h-40 w-full items-center justify-center rounded-md border border-dashed">
                  {favicon ? (
                    <div className="relative h-24 w-24">
                      <Image
                        src={favicon}
                        alt="Favicon preview"
                        fill
                        className="rounded-md object-contain"
                        onError={() => {
                          console.warn("Favicon preview failed to load.");
                          setFavicon(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <div className="text-sm">No favicon selected</div>
                    </div>
                  )}
                </div>
                <div className="flex w-full">
                  <Input
                    id="favicon"
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml"
                    className="hidden"
                    onChange={handleFaviconChange}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("favicon")?.click()}
                    disabled={isUploading}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    {favicon ? "Change Favicon" : "Upload Favicon"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Text Input Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="siteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Site" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your site.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Site - Home" {...field} />
                </FormControl>
                <FormDescription>
                  This will be used as the title tag for your site.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of your site for search engines and social media."
                    className="min-h-24 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be used in the meta description tag for your site.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
