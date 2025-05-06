"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Paperclip, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PublicTicketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);

      // Remove any empty files
      const fileList = formData.getAll("files");
      formData.delete("files");

      // Add only non-empty files back to formData
      fileList.forEach((file) => {
        if (file instanceof File && file.size > 0) {
          formData.append("files", file);
        }
      });

      const response = await fetch("/api/tickets/anonymous", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      const data = await response.json();

      toast.success(
        "Support ticket created successfully! Check your email for details."
      );

      // Redirect to a success page
      router.push("/support/ticket-submitted");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Support Request</CardTitle>
        <CardDescription>
          Fill out the form below to create a support ticket. You'll receive a
          secure link to track your ticket via email.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Add spam warning alert */}
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Please check your spam/junk folder for
              the ticket confirmation email if you don't see it in your inbox.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                name="userName"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="Your project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID (if known)</Label>
              <Input
                id="projectId"
                name="projectId"
                placeholder="Optional project identifier"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Please describe your issue in detail"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Attachments (optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Paperclip className="h-4 w-4" />
                Select Files
              </Button>
              <Input
                id="files"
                name="files"
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <span className="text-sm text-muted-foreground">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "No files selected"}
              </span>
            </div>
            {files.length > 0 && (
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="truncate">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Ticket
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
