"use client";

import { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Video,
  Heading1,
  Heading2,
  Code,
  Undo,
  Redo,
  X,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import axiosSecure from "@/lib/axiosSecure"; // Assuming this is configured
import { toast } from "sonner"; // Assuming this is configured

/**
 * A rich text editor component using Tiptap and shadcn/ui.
 *
 * Props:
 * - value: The initial HTML content for the editor.
 * - onChange: Function called with the updated HTML content on changes.
 * - placeholder: Placeholder text for the editor.
 * - className: Additional CSS classes for the main container.
 * - id: ID attribute for the editor content area.
 * - name: Name attribute (often used with forms).
 * - disabled: Boolean to disable the editor.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  id,
  name,
  disabled = false,
}) {
  // State for managing UI elements and processes
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);

  // Ref for the hidden file input element
  // Removed <HTMLInputElement> type annotation for JS compatibility
  const fileInputRef = useRef(null);

  // Initialize Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit, // Basic text formatting (bold, italic, lists, etc.)
      Image.configure({
        // Image extension configuration
        allowBase64: true, // Allow pasting base64 images (can increase content size)
        HTMLAttributes: {
          // Add CSS classes to rendered images
          class: "rounded-md max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        // Link extension configuration
        openOnClick: false, // Don't open links when clicking in the editor
        HTMLAttributes: {
          // Style links
          class: "text-blue-600 underline",
        },
      }),
      Youtube.configure({
        // YouTube video embed configuration
        width: 640,
        height: 360,
        HTMLAttributes: {
          // Style video embeds
          class: "w-full aspect-video my-4 rounded-md overflow-hidden",
        },
      }),
      Placeholder.configure({
        // Placeholder text configuration
        placeholder,
      }),
    ],
    content: value, // Set initial content
    // Callback function triggered on editor content updates
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Pass the updated HTML to the parent
    },
    editable: !disabled, // Control if the editor can be edited
  });

  // Handle image upload logic
  const handleImageUpload = useCallback(
    async (file) => {
      if (!editor) return; // Ensure editor is available

      try {
        setIsUploading(true); // Set uploading state
        const formData = new FormData();
        formData.append("image", file); // Append file to FormData

        // Make POST request to the upload endpoint
        const response = await axiosSecure.post("/api/upload", formData);

        // Check if the response contains a URL
        if (response.data?.url) {
          // Insert the uploaded image into the editor
          editor
            .chain()
            .focus()
            .setImage({ src: response.data.url, alt: file.name })
            .run();
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error("Failed to get image URL from server");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false); // Reset uploading state
      }
    },
    [editor] // Dependency: editor instance
  );

  // Handle file selection from the input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // --- Validation ---
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should not exceed 2MB");
        return;
      }

      // Validate file type
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
          "image/webp",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type (JPG, PNG, GIF, SVG, WEBP allowed)");
        return;
      }
      // --- End Validation ---

      // Proceed with upload if validation passes
      handleImageUpload(file);
    }
    // Reset file input value to allow uploading the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle link insertion/update
  const handleInsertLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      // Basic URL validation (can be enhanced)
      try {
        // Attempt to create a URL object to check format
        new URL(linkUrl);
        // Apply the link to the selected text or cursor position
        editor
          .chain()
          .focus()
          .extendMarkRange("link") // Select text if needed
          .setLink({ href: linkUrl })
          .run();
        setLinkUrl(""); // Clear input
        setShowLinkInput(false); // Close popover
      } catch (e) {
        toast.error("Please enter a valid URL (e.g., https://example.com)");
      }
    } else {
      // If URL is empty, unset the link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false); // Close popover even if removing link
    }
  }, [editor, linkUrl]); // Dependencies: editor instance, linkUrl state

  // Handle video insertion
  const handleInsertVideo = useCallback(() => {
    if (!editor) return;

    if (videoUrl) {
      // Insert YouTube video embed
      // Note: Tiptap's YouTube extension handles URL validation internally
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
      setVideoUrl(""); // Clear input
      setShowVideoInput(false); // Close popover
    }
  }, [editor, videoUrl]); // Dependencies: editor instance, videoUrl state

  // Return null if the editor instance is not yet ready
  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden bg-white", // Base styles
        disabled && "opacity-60 cursor-not-allowed", // Disabled styles
        className // Allow custom classes
      )}
    >
      {/* Toolbar */}
      {!disabled && ( // Only show toolbar if not disabled
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50">
          {/* --- Basic Formatting Buttons --- */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("bold") && "bg-slate-200 text-slate-900"
            )}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("italic") && "bg-slate-200 text-slate-900"
            )}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 2 }) &&
                "bg-slate-200 text-slate-900"
            )}
            aria-label="Heading 2"
          >
            <Heading1 className="h-4 w-4" /> {/* Icon often represents H1/H2 */}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 3 }) &&
                "bg-slate-200 text-slate-900"
            )}
            aria-label="Heading 3"
          >
            <Heading2 className="h-4 w-4" /> {/* Icon often represents H2/H3 */}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("bulletList") && "bg-slate-200 text-slate-900"
            )}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("orderedList") && "bg-slate-200 text-slate-900"
            )}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("codeBlock") && "bg-slate-200 text-slate-900"
            )}
            aria-label="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>

          {/* --- Link Button with Popover --- */}
          <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  editor.isActive("link") && "bg-slate-200 text-slate-900"
                )}
                aria-label="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-2">
                <Label htmlFor="link-url" className="text-xs font-medium">
                  Link URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInsertLink();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleInsertLink}
                    aria-label="Apply Link"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setLinkUrl(editor.getAttributes("link").href || "");
                      setShowLinkInput(false);
                    }} // Reset URL on cancel
                    aria-label="Cancel Link Input"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* --- Image Upload Button --- */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()} // Trigger hidden input click
            className="h-8 w-8"
            disabled={isUploading} // Disable while uploading
            aria-label="Upload Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/gif, image/svg+xml, image/webp" // Specify accepted types
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* --- Video Embed Button with Popover --- */}
          <Popover open={showVideoInput} onOpenChange={setShowVideoInput}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Embed Video"
              >
                <Video className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-2">
                <Label htmlFor="video-url" className="text-xs font-medium">
                  YouTube Video URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInsertVideo();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleInsertVideo}
                    disabled={!videoUrl} // Disable if URL is empty
                    aria-label="Apply Video"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setVideoUrl("");
                      setShowVideoInput(false);
                    }} // Clear URL on cancel
                    aria-label="Cancel Video Input"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* --- Undo/Redo Buttons --- */}
          <div className="ml-auto flex items-center gap-1">
            {" "}
            {/* Push to the right */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()} // Disable if cannot undo
              className="h-8 w-8"
              aria-label="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()} // Disable if cannot redo
              className="h-8 w-8"
              aria-label="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className={cn(
          "p-4 min-h-[200px] prose prose-sm max-w-none focus:outline-none", // Tiptap styles + Tailwind prose for basic styling
          disabled && "bg-slate-100 text-muted-foreground" // Disabled appearance
        )}
        id={id} // Pass ID prop
        name={name} // Pass name prop
        // The 'disabled' prop on the outer div and editor.setEditable handles disabling
      />
    </div>
  );
}
