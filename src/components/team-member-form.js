"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
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
import Image from "next/image";
import { toast } from "sonner";
import axiosSecure from "@/lib/axiosSecure"; // ✅ your secure axios instance

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  designation: z.string().min(2, {
    message: "Designation must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  photoUrl: z.string().optional(),
});

export function TeamMemberForm({ teamMember }) {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState(
    teamMember?.photoUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teamMember?.name || "",
      designation: teamMember?.designation || "",
      description: teamMember?.description || "",
      photoUrl: teamMember?.photoUrl || "",
    },
  });

  // ✅ Upload to your own /api/upload route
  async function uploadPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosSecure.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.url;
  }

  async function onSubmit(values) {
    try {
      setIsSubmitting(true);

      let photoUrl = values.photoUrl;
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const payload = {
        ...values,
        photoUrl,
      };

      const url = teamMember?._id ? `/api/team/${teamMember._id}` : "/api/team";
      const method = teamMember?._id ? "put" : "post";

      await axiosSecure[method](url, payload);

      toast.success(
        `${values.name} has been ${teamMember?._id ? "updated" : "added"} successfully.`
      );

      router.push("/dashboard/team");
      router.refresh();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("❌ Failed to save team member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    form.setValue("photoUrl", "");
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={() => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center space-y-4">
                  {photoPreview ? (
                    <div className="relative">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-full border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-32 h-32 rounded-full bg-muted mb-4">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="relative">
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 w-full cursor-pointer"
                          onChange={handlePhotoChange}
                        />
                        <Button type="button" variant="outline">
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload a square image for best results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description about the team member..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a short bio or description about the team member.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/team")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {teamMember?._id ? "Update" : "Add"} Team Member
          </Button>
        </div>
      </form>
    </Form>
  );
}
