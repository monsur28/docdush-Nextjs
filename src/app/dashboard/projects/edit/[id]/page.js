"use client";

import { useState, useEffect, use } from "react"; // Removed 'use' as it's experimental/not standard for this case
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Box,
  Monitor,
  Server,
  Database,
  Lock,
  Coffee,
  Loader2,
  LinkIcon,
  Info,
  GripVertical, // Assuming you might want reordering later
  BookOpen,
  ImageIcon,
  Video,
  HelpCircle,
  Code as CodeIcon,
  Keyboard, // Icon for Markdown toggle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch"; // Keep Switch for Markdown toggle
import DashboardLayout from "@/components/DashboardLayout";
import { Toaster } from "@/components/ui/sonner"; // Ensure Toaster is present
import { toast } from "sonner";
import axiosSecure from "@/lib/axiosSecure";
import { RichTextEditor } from "@/components/rich-text-editor"; // Assuming path is correct
import { MarkdownGuidePopover } from "@/components/markdown-guide-popover"; // Assuming path is correct
import { MarkdownCodeHelper } from "@/components/markdown-code-helper"; // Assuming path is correct

// --- Icon Mapping (Reused from NewProjectPage) ---
const sectionIcons = {
  FileText: <FileText className="h-5 w-5" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  Server: <Server className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Lock: <Lock className="h-5 w-5" />,
  Coffee: <Coffee className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  // Add other icons if needed for custom sections
};
const getSectionIcon = (iconName) => {
  return sectionIcons[iconName] || sectionIcons.BookOpen; // Default icon
};

// --- Category Options (Reused from NewProjectPage) ---
const categoryOptions = [
  "Full Stack App",
  "Frontend App",
  "Backend API",
  "E-commerce",
  "Media Platform",
  "SaaS",
  "Portfolio",
  "Blog",
  "Utility Tool",
  "Game",
  "Other",
];

// Helper function to generate unique IDs for NEW sections
const generateId = () =>
  `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Helper function to validate URL (Keep as is)
const isValidUrl = (string) => {
  if (!string) return true; // Optional field is valid if empty
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Helper to add temporary IDs for form state management (Keep as is)
const addTempIds = (items = [], startingId = 1) => {
  let counter = startingId;
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({ ...item, id: item.id || counter++ })); // Prefer existing ID if available
};

export default function EditProjectPage({ params }) {
  const resolvedParams = use(params);
  const { id: projectId } = resolvedParams; // Destructure ID directly from props.params
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // --- Form Data State (Refactored) ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    otherCategory: "", // For custom category input
    image: null,
    version: "1.0.0",
    author: "Envato Elite Author",
    demoUrl: "",
    frontendDependencies: [],
    backendDependencies: [],
    documentationSections: [], // <-- Now an array
    faqEntries: [],
    featured: false, // Add if you have this feature
    status: "Draft", // Add if you have this feature
  });

  const [errors, setErrors] = useState({});
  const [nextDependencyId, setNextDependencyId] = useState(1); // Temporary ID counter
  const [nextFaqId, setNextFaqId] = useState(1); // Temporary ID counter
  const [imagePreview, setImagePreview] = useState(null); // Start with null
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Fetch Existing Project Data (Refactored) ---
  useEffect(() => {
    if (!projectId) {
      toast.error("Project ID is missing.");
      setIsLoadingData(false);
      router.push("/dashboard/projects");
      return;
    }

    const fetchProjectData = async () => {
      setIsLoadingData(true);
      setErrors({});
      try {
        const response = await axiosSecure.get(`/api/projects/${projectId}`);
        const project = response.data; // Assuming API returns the project object directly
        if (!project)
          throw new Error("Project not found (API returned null/undefined)");

        const feDeps = project.packageRequirements?.frontend || [];
        const beDeps = project.packageRequirements?.backend || [];
        const faqData = project.faqs || [];
        const fetchedDocSections = project.documentationSections || [];

        // Add client-side state fields to documentation sections
        const processedDocSections = fetchedDocSections.map(
          (section, index) => ({
            id: section.id || `Workspaceed-${index}-${generateId()}`, // Use existing ID or generate fallback
            title: section.title || "Untitled Section",
            icon: section.icon || "BookOpen", // Default icon if missing
            content: section.content || "<p></p>", // Default empty paragraph for RTE
            markdownContent: "", // Initialize empty for helper
            showMarkdown: false, // Initialize hidden
            isDeletable:
              section.isDeletable !== undefined ? section.isDeletable : true, // Default to deletable unless specified
            isCustom:
              section.isCustom !== undefined
                ? section.isCustom
                : !sectionIcons[section.icon], // Assume non-standard icon means custom
          })
        );

        const transformedFaqs = addTempIds(faqData, 1);
        const transformedFeDeps = addTempIds(feDeps, 1);
        const transformedBeDeps = addTempIds(
          beDeps,
          transformedFeDeps.length + 1 // Start IDs after FE deps
        );

        // Check if the fetched category is one of the standard options
        const isOtherCategory = !categoryOptions.includes(
          project.category || ""
        );
        const displayCategory = isOtherCategory
          ? "Other"
          : project.category || "";
        const otherCategoryValue = isOtherCategory
          ? project.category || ""
          : "";

        setFormData({
          title: project.title || "",
          description: project.description || "",
          category: displayCategory, // Set to 'Other' if custom
          otherCategory: otherCategoryValue, // Populate if custom
          image: project.image || null, // Use null if no image
          version: project.version || "1.0.0",
          author: project.author || "Envato Elite Author",
          demoUrl: project.demoUrl || "",
          frontendDependencies: transformedFeDeps,
          backendDependencies: transformedBeDeps,
          documentationSections: processedDocSections, // <-- Set the processed array
          faqEntries: transformedFaqs,
          featured: project.featured ?? false, // Use nullish coalescing
          status: project.status || "Draft",
        });

        setImagePreview(project.image || null); // Set initial preview
        setNextDependencyId(
          transformedFeDeps.length + transformedBeDeps.length + 1
        );
        setNextFaqId(transformedFaqs.length + 1);
      } catch (error) {
        console.error("Error fetching project data:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Please check the ID or API.";
        toast.error("Failed to load project data", { description: errorMsg });
        if (error.response?.status === 404 || error.message.includes("404")) {
          router.push("/dashboard/projects"); // Redirect if not found
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]); // Dependency array includes projectId and router

  // --- Handlers (Many reused from NewProjectPage) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear associated error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear otherCategory if a standard category is selected
      ...(name === "category" && value !== "Other" && { otherCategory: "" }),
    }));
    // Clear associated errors
    if (errors[name] || errors.otherCategory) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.otherCategory; // Clear otherCategory error too
        return newErrors;
      });
    }
  };

  const handleOtherCategoryChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, otherCategory: value }));
    if (errors.otherCategory) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.otherCategory;
        return newErrors;
      });
    }
  };

  // --- Documentation Section Handlers (Reused from NewProjectPage) ---
  const handleSectionTitleChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === id ? { ...section, title: value } : section
      ),
    }));
    const errorKey = `doc_title_${id}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleMarkdownVisibilityToggle = (sectionId, show) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId ? { ...section, showMarkdown: show } : section
      ),
    }));
  };

  const handleRichTextChange = (sectionId, value) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId ? { ...section, content: value } : section
      ),
    }));
    const errorKey = `doc_content_${sectionId}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleMarkdownChange = (sectionId, value) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId
          ? { ...section, markdownContent: value }
          : section
      ),
    }));
    // Note: Markdown content itself usually isn't validated directly for submission
  };

  const handleInsertMarkdown = (sectionId, markdownToInsert) => {
    setFormData((prev) => {
      const updatedSections = prev.documentationSections.map((section) => {
        if (section.id === sectionId) {
          const currentMarkdown = section.markdownContent || "";
          const newMarkdownContent =
            currentMarkdown + (currentMarkdown ? "\n" : "") + markdownToInsert;
          return { ...section, markdownContent: newMarkdownContent };
        }
        return section;
      });
      return { ...prev, documentationSections: updatedSections };
    });
    // Focus and move cursor in the markdown textarea
    const textarea = document.getElementById(`markdown-${sectionId}`);
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      }, 0);
    }
  };

  const handleAddSection = () => {
    const newSection = {
      id: generateId(), // Generate a unique client-side ID
      title: "New Section",
      icon: "BookOpen", // Default icon
      content: "<p></p>", // Default empty paragraph for RTE
      markdownContent: "",
      showMarkdown: false, // Start with markdown hidden
      isDeletable: true, // New sections are always deletable
      isCustom: true, // Mark as custom
    };
    setFormData((prev) => ({
      ...prev,
      documentationSections: [...prev.documentationSections, newSection],
    }));
    // Scroll to and focus the new section
    setTimeout(() => {
      const element = document.getElementById(newSection.id);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      const titleInput = document.getElementById(`title-${newSection.id}`);
      titleInput?.focus();
    }, 100); // Timeout allows element to render first
  };

  const handleRemoveSection = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.filter(
        (section) => section.id !== idToRemove
      ),
    }));
    // Clear errors associated with the removed section
    const titleErrorKey = `doc_title_${idToRemove}`;
    const contentErrorKey = `doc_content_${idToRemove}`;
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[titleErrorKey];
      delete newErrors[contentErrorKey];
      return newErrors;
    });
  };

  // --- Image Handler (Now uses /api/upload) ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    const currentImageOnError = formData.image; // Store the last *successfully saved* image URL

    // Clear previous image-related errors
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.image;
      return ne;
    });

    if (!file) {
      // If user cancels file selection, revert preview to the last known good URL
      setImagePreview(currentImageOnError);
      return;
    }

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      // 2MB Limit
      setErrors((prev) => ({
        ...prev,
        image: "Image size should not exceed 2MB",
      }));
      return; // Keep old preview/image
    }
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/webp",
      ].includes(file.type)
    ) {
      setErrors((prev) => ({
        ...prev,
        image: "Invalid file type (JPG, PNG, GIF, SVG, WEBP allowed)",
      }));
      return; // Keep old preview/image
    }

    // Generate local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImagePreview(reader.result.toString());
      } else {
        setImagePreview(currentImageOnError); // Fallback if reading fails
      }
    };
    reader.onerror = () => {
      console.error("Error reading file for preview.");
      setImagePreview(currentImageOnError);
      setErrors((prev) => ({
        ...prev,
        image: "Could not preview the selected file.",
      }));
    };
    reader.readAsDataURL(file);

    // Start the actual upload process
    setIsUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      // Call your backend API endpoint which handles the ImgBB upload & verification
      const response = await axiosSecure.post("/api/upload", uploadFormData); // Use your secured axios instance

      if (response.status === 200 && response.data.url) {
        const uploadedUrl = response.data.url;
        setFormData((prev) => ({ ...prev, image: uploadedUrl })); // IMPORTANT: Update formData with the *new* URL
        setImagePreview(uploadedUrl); // Ensure preview also shows the final URL
        toast.success("Image uploaded!");
      } else {
        // Handle potential errors returned from your API endpoint
        throw new Error(
          response.data?.error || "Image upload API did not return a valid URL."
        );
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      // Get error message from your API response or fallback
      const apiErrorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unknown error occurred during upload.";
      setErrors((prev) => ({
        ...prev,
        image: `Upload failed: ${apiErrorMessage}. Please try again.`,
      }));
      setImagePreview(currentImageOnError); // Revert preview to last good URL
      setFormData((prev) => ({ ...prev, image: currentImageOnError })); // Revert formData state
      toast.error(`Image upload failed: ${apiErrorMessage}`);
    } finally {
      setIsUploadingImage(false);
      // Clear the file input value to allow re-uploading the same file if needed
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // --- Dependency & FAQ Handlers (Can be reused as is) ---
  const handleAddDependency = (type) => {
    const newDependency = { id: nextDependencyId, name: "", version: "" };
    setNextDependencyId(nextDependencyId + 1);
    const key =
      type === "frontend" ? "frontendDependencies" : "backendDependencies";
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], newDependency] }));
  };

  const handleRemoveDependency = (type, id) => {
    const key =
      type === "frontend" ? "frontendDependencies" : "backendDependencies";
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((dep) => dep.id !== id),
    }));
    // Clear potential errors associated with this dependency
    const nameErrorKey = `${type.slice(0, 2)}_dep_name_${id}`;
    const versionErrorKey = `${type.slice(0, 2)}_dep_version_${id}`;
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[nameErrorKey];
      delete newErrors[versionErrorKey];
      return newErrors;
    });
  };

  const handleDependencyChange = (type, id, field, value) => {
    const key =
      type === "frontend" ? "frontendDependencies" : "backendDependencies";
    // Clear associated error when user types
    const errorKey = `${type.slice(0, 2)}_dep_${field}_${id}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].map((dep) =>
        dep.id === id ? { ...dep, [field]: value } : dep
      ),
    }));
  };

  const handleAddFaqEntry = () => {
    const newFaq = { id: nextFaqId, question: "", answer: "" };
    setNextFaqId(nextFaqId + 1);
    setFormData((prev) => ({
      ...prev,
      faqEntries: [...prev.faqEntries, newFaq],
    }));
  };

  const handleRemoveFaqEntry = (id) => {
    setFormData((prev) => ({
      ...prev,
      faqEntries: prev.faqEntries.filter((faq) => faq.id !== id),
    }));
    // Clear potential errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`faq_q_${id}`];
      delete newErrors[`faq_a_${id}`];
      return newErrors;
    });
  };

  const handleFaqChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      faqEntries: prev.faqEntries.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq
      ),
    }));
    // Clear associated error
    const errorKey = `faq_${field.slice(0, 1)}_${id}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // --- Step Navigation (Reused) ---
  const nextStep = () => {
    const { isValid, stepErrors } = runValidationForStep(currentStep);
    // Clear errors only for the fields belonging to the current step
    const currentFields = getCurrentStepFields(currentStep);
    const clearedErrors = { ...errors };
    currentFields.forEach((fieldKey) => {
      if (fieldKey.includes("*")) {
        // Handle wildcard patterns
        const prefix = fieldKey.split("*")[0];
        Object.keys(clearedErrors).forEach((key) => {
          if (key.startsWith(prefix)) {
            delete clearedErrors[key];
          }
        });
      } else {
        delete clearedErrors[fieldKey];
      }
    });

    setErrors({ ...clearedErrors, ...stepErrors });

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0); // Scroll to top to make errors visible
      // Optional: focus the first field with an error
      const firstErrorKey = Object.keys(stepErrors)[0];
      if (firstErrorKey) {
        // Attempt to find and focus the element associated with the error
        let elementId = firstErrorKey;
        // Adjust ID based on error key pattern (adapt from NewProjectPage if needed)
        if (firstErrorKey.startsWith("doc_"))
          elementId = firstErrorKey.split("_")[2];
        if (
          firstErrorKey.startsWith("fe_dep") ||
          firstErrorKey.startsWith("be_dep")
        )
          elementId = firstErrorKey.substring(
            0,
            firstErrorKey.lastIndexOf("_")
          );
        if (firstErrorKey.startsWith("faq_"))
          elementId = `faq_q_${firstErrorKey.split("_")[2]}`;

        const errorElement = document.getElementById(elementId);
        errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focusing might be tricky with complex components like RTE
        // if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
        //     errorElement.focus({ preventScroll: true });
        // }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Helper to get fields relevant to the current validation step (Refactored)
  const getCurrentStepFields = (step) => {
    if (step === 1) {
      return [
        "title",
        "description",
        "category",
        "otherCategory", // Added
        "image",
        "demoUrl",
      ];
    }
    if (step === 2) {
      // Use wildcard notation for dynamic fields
      return [
        "version",
        "fe_dep_name_*", // Matches fe_dep_name_1, fe_dep_name_2 etc.
        "fe_dep_version_*",
        "be_dep_name_*",
        "be_dep_version_*",
      ];
    }
    if (step === 3) {
      // Use wildcard notation for dynamic fields
      return [
        "doc_title_*", // Matches doc_title_introduction, doc_title_customId etc.
        "doc_content_*",
        "faq_q_*", // Matches faq_q_1, faq_q_2 etc.
        "faq_a_*",
      ];
    }
    return [];
  };

  // --- Validation Logic (Refactored Step 3) ---
  const runValidationForStep = (step) => {
    const stepErrors = {};
    let isValid = true;
    // Step 1 Validation (Same as NewProjectPage)
    if (step === 1) {
      if (!formData.title.trim()) {
        stepErrors.title = "Title is required";
        isValid = false;
      } else if (formData.title.length < 3) {
        stepErrors.title = "Title must be at least 3 characters";
        isValid = false;
      }
      if (!formData.description.trim()) {
        stepErrors.description = "Description is required";
        isValid = false;
      } else if (formData.description.length < 10) {
        stepErrors.description = "Description must be at least 10 characters";
        isValid = false;
      }
      if (!formData.category) {
        stepErrors.category = "Category is required";
        isValid = false;
      } else if (
        formData.category === "Other" &&
        !formData.otherCategory.trim()
      ) {
        stepErrors.otherCategory = "Please specify the category name";
        isValid = false;
      }
      // Propagate existing image error (from upload attempt or previous validation)
      if (errors.image) {
        stepErrors.image =
          errors.image; /* isValid = false; - Don't fail step if only preview failed */
      }
      // Image itself might be optional on edit, depending on requirements. Let's assume it's not mandatory to *re-upload*.
      // if (!formData.image && !errors.image) { stepErrors.image = "Project image is required"; isValid = false; }
      if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
        stepErrors.demoUrl = "Please enter a valid URL";
        isValid = false;
      }
    }
    // Step 2 Validation (Same as NewProjectPage)
    if (step === 2) {
      if (!formData.version.trim()) {
        stepErrors.version = "Version is required";
        isValid = false;
      }
      formData.frontendDependencies.forEach((dep, index) => {
        if (!dep.name.trim()) {
          stepErrors[`fe_dep_name_${dep.id}`] =
            `FE Dep #${index + 1} Name required`;
          isValid = false;
        }
        if (!dep.version.trim()) {
          stepErrors[`fe_dep_version_${dep.id}`] =
            `FE Dep #${index + 1} Version required`;
          isValid = false;
        }
      });
      formData.backendDependencies.forEach((dep, index) => {
        if (!dep.name.trim()) {
          stepErrors[`be_dep_name_${dep.id}`] =
            `BE Dep #${index + 1} Name required`;
          isValid = false;
        }
        if (!dep.version.trim()) {
          stepErrors[`be_dep_version_${dep.id}`] =
            `BE Dep #${index + 1} Version required`;
          isValid = false;
        }
      });
    }
    // Step 3 Validation (Refactored for documentationSections array)
    if (step === 3) {
      formData.documentationSections.forEach((section, index) => {
        if (!section.title.trim()) {
          stepErrors[`doc_title_${section.id}`] =
            `Section #${index + 1} Title required`;
          isValid = false;
        }
        // Validate RTE content ('content')
        const plainTextContent = section.content.replace(/<[^>]*>/g, "").trim();
        if (!plainTextContent) {
          stepErrors[`doc_content_${section.id}`] =
            `Section #${index + 1} Content cannot be empty`;
          isValid = false;
        }
      });
      formData.faqEntries.forEach((faq, index) => {
        if (!faq.question.trim()) {
          stepErrors[`faq_q_${faq.id}`] = `FAQ #${index + 1} Question required`;
          isValid = false;
        }
        if (!faq.answer.trim()) {
          stepErrors[`faq_a_${faq.id}`] = `FAQ #${index + 1} Answer required`;
          isValid = false;
        }
      });
    }
    return { isValid, stepErrors };
  };

  // --- Final Validation Before Submit (Refactored) ---
  const validateAll = () => {
    const { isValid: step1Valid, stepErrors: step1Errors } =
      runValidationForStep(1);
    const { isValid: step2Valid, stepErrors: step2Errors } =
      runValidationForStep(2);
    const { isValid: step3Valid, stepErrors: step3Errors } =
      runValidationForStep(3);
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };

    // Retain existing image upload error if validation didn't overwrite it
    if (errors.image && !allErrors.image) {
      allErrors.image = errors.image;
    }
    // Ensure 'Other' category is specified if selected
    if (
      formData.category === "Other" &&
      !formData.otherCategory.trim() &&
      !allErrors.otherCategory
    ) {
      allErrors.otherCategory = "Please specify the category name";
    }

    // Overall validity check
    const overallValid =
      step1Valid &&
      step2Valid &&
      step3Valid &&
      !allErrors.image &&
      !allErrors.otherCategory;
    setErrors(allErrors); // Set all combined errors

    // Determine the first invalid step to navigate to
    let firstInvalidStep = null;
    if (!step1Valid || allErrors.image || allErrors.otherCategory)
      firstInvalidStep = 1;
    else if (!step2Valid) firstInvalidStep = 2;
    else if (!step3Valid) firstInvalidStep = 3;

    return { overallValid, firstInvalidStep };
  };

  // --- Submission (Refactored) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => {
      // Clear previous general submit error
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    const { overallValid, firstInvalidStep } = validateAll();

    if (!overallValid) {
      setCurrentStep(firstInvalidStep); // Navigate to the first invalid step
      window.scrollTo(0, 0);
      setErrors((prev) => ({
        ...prev,
        submit: "Please fix the errors highlighted above.",
      }));
      toast.error("Validation failed. Please check the form.");
      return;
    }

    if (isUploadingImage) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please wait for image upload to complete.",
      }));
      toast.warning("Image is still uploading.");
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    const finalCategory =
      formData.category === "Other"
        ? formData.otherCategory
        : formData.category;

    // Prepare data for API (map sections, exclude helper fields)
    const projectDataToSubmit = {
      title: formData.title,
      description: formData.description,
      category: finalCategory,
      image: formData.image,
      version: formData.version,
      author: formData.author,
      demoUrl: formData.demoUrl || null, // Send null if empty
      packageRequirements: {
        frontend: formData.frontendDependencies.map(({ id, ...rest }) => rest), // Exclude temp ID
        backend: formData.backendDependencies.map(({ id, ...rest }) => rest), // Exclude temp ID
      },
      documentationSections: formData.documentationSections.map(
        ({
          // Exclude client-side helper fields before sending to API
          markdownContent,
          showMarkdown,
          isDeletable, // You might want to send this if API uses it
          isCustom, // You might want to send this if API uses it
          ...rest // Keep id, title, icon, content
        }) => ({
          ...rest,
          supportsMarkdown: true, // Indicate potential origin or support
          supportsHtml: true,
        })
      ),
      faqs: formData.faqEntries.map(({ id, ...rest }) => ({
        // Exclude temp ID
        ...rest,
        supportsMarkdown: false, // Assuming FAQs don't support markdown
        supportsHtml: false,
      })),
      featured: formData.featured,
      status: formData.status,
    };

    try {
      const response = await axiosSecure.put(
        `/api/projects/${projectId}`, // Use PUT for updates
        projectDataToSubmit
      );

      if (response.status === 200 && response.data?.success) {
        // Expect 200 OK for update
        toast.success("Project Updated Successfully!");
        router.push("/dashboard/projects"); // Redirect after successful update
      } else {
        // Handle potential errors from the API response even if status is 200
        const errorMessage =
          response.data?.message || `API Error (Status: ${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      setErrors((prev) => ({
        ...prev,
        submit: `Failed to update project: ${apiErrorMessage}`,
      }));
      toast.error(`Failed to update project: ${apiErrorMessage}`);
      window.scrollTo(0, 0); // Scroll to show error
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper Render Functions (renderDependencies reused) ---
  const renderDependencies = (type) => {
    const dependencies =
      formData[
        type === "frontend" ? "frontendDependencies" : "backendDependencies"
      ];
    const prefix = type === "frontend" ? "fe" : "be";
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">
            {type === "frontend"
              ? "Frontend Dependencies"
              : "Backend Dependencies"}
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddDependency(type)}
            className="gap-1"
            disabled={isSubmitting}
          >
            <Plus size={16} /> Add Dependency
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            {dependencies.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                No {type} dependencies added yet.
              </div>
            ) : (
              dependencies.map((dep, index) => (
                <div
                  key={dep.id}
                  id={`${prefix}_dep_${dep.id}`}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="sm:col-span-5">
                    <Label
                      htmlFor={`${prefix}_dep_name_${dep.id}`}
                      className="sr-only"
                    >
                      Dependency Name {index + 1}
                    </Label>
                    <Input
                      id={`${prefix}_dep_name_${dep.id}`}
                      value={dep.name}
                      onChange={(e) =>
                        handleDependencyChange(
                          type,
                          dep.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Package Name (e.g., react)"
                      className={
                        errors[`${prefix}_dep_name_${dep.id}`]
                          ? "border-red-500"
                          : ""
                      }
                      disabled={isSubmitting}
                      aria-invalid={!!errors[`${prefix}_dep_name_${dep.id}`]}
                      aria-describedby={
                        errors[`${prefix}_dep_name_${dep.id}`]
                          ? `${prefix}_dep_name_${dep.id}-error`
                          : undefined
                      }
                    />
                    {errors[`${prefix}_dep_name_${dep.id}`] && (
                      <p
                        id={`${prefix}_dep_name_${dep.id}-error`}
                        className="text-xs text-red-600 mt-1"
                      >
                        {errors[`${prefix}_dep_name_${dep.id}`]}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-5">
                    <Label
                      htmlFor={`${prefix}_dep_version_${dep.id}`}
                      className="sr-only"
                    >
                      Dependency Version {index + 1}
                    </Label>
                    <Input
                      id={`${prefix}_dep_version_${dep.id}`}
                      value={dep.version}
                      onChange={(e) =>
                        handleDependencyChange(
                          type,
                          dep.id,
                          "version",
                          e.target.value
                        )
                      }
                      placeholder="Version (e.g., ^18.2.0)"
                      className={
                        errors[`${prefix}_dep_version_${dep.id}`]
                          ? "border-red-500"
                          : ""
                      }
                      disabled={isSubmitting}
                      aria-invalid={!!errors[`${prefix}_dep_version_${dep.id}`]}
                      aria-describedby={
                        errors[`${prefix}_dep_version_${dep.id}`]
                          ? `${prefix}_dep_version_${dep.id}-error`
                          : undefined
                      }
                    />
                    {errors[`${prefix}_dep_version_${dep.id}`] && (
                      <p
                        id={`${prefix}_dep_version_${dep.id}-error`}
                        className="text-xs text-red-600 mt-1"
                      >
                        {errors[`${prefix}_dep_version_${dep.id}`]}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex justify-end pt-1 sm:pt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDependency(type, dep.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remove ${type} Dependency ${index + 1}`}
                      disabled={isSubmitting}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- Loading UI ---
  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          {/* Changed color */}
          <span className="ml-4 text-lg text-gray-600">
            Loading Project Data...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  // --- JSX (Step 3 Refactored) ---
  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header, Progress, Tabs (Same as NewProjectPage) */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => router.push("/dashboard/projects")}
                aria-label="Back to Projects"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">Edit Project</h1>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of 3
                </span>
              </div>
              <Progress value={(currentStep / 3) * 100} className="h-2" />
            </div>
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger
                  value="1"
                  disabled={isSubmitting}
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                  onClick={(e) => {
                    if (currentStep > 1) {
                      e.preventDefault();
                      setCurrentStep(1);
                      window.scrollTo(0, 0);
                    }
                  }}
                >
                  Basic Info
                  {Object.keys(errors).some((k) =>
                    [
                      "title",
                      "description",
                      "category",
                      "otherCategory",
                      "image",
                      "demoUrl",
                    ].includes(k)
                  ) && <span className="ml-1 text-red-500">*</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="2"
                  disabled={isSubmitting}
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                  onClick={(e) => {
                    if (currentStep !== 2) {
                      e.preventDefault();
                      if (
                        currentStep === 3 ||
                        runValidationForStep(1).isValid
                      ) {
                        setCurrentStep(2);
                        window.scrollTo(0, 0);
                      } else if (currentStep === 1) {
                        nextStep();
                      }
                    }
                  }}
                >
                  Project Details
                  {Object.keys(errors).some(
                    (k) =>
                      k.startsWith("version") ||
                      k.startsWith("fe_dep") ||
                      k.startsWith("be_dep")
                  ) && <span className="ml-1 text-red-500">*</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="3"
                  disabled={isSubmitting}
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                  onClick={(e) => {
                    if (currentStep !== 3) {
                      e.preventDefault();
                      if (
                        currentStep < 3 &&
                        runValidationForStep(1).isValid &&
                        runValidationForStep(2).isValid
                      ) {
                        setCurrentStep(3);
                        window.scrollTo(0, 0);
                      } else if (currentStep === 2) {
                        nextStep();
                      } else if (currentStep === 1) {
                        const { isValid: s1 } = runValidationForStep(1);
                        if (s1) {
                          const { isValid: s2 } = runValidationForStep(2);
                          if (s2) setCurrentStep(3);
                          else setCurrentStep(2);
                        } else setCurrentStep(1);
                        window.scrollTo(0, 0);
                      }
                    }
                  }}
                >
                  Documentation
                  {Object.keys(errors).some(
                    (k) => k.startsWith("doc_") || k.startsWith("faq_")
                  ) && <span className="ml-1 text-red-500">*</span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="max-w-5xl mx-auto"
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="min-h-[400px]">
                  {/* Ensure content area visible */}
                  {/* Step 1 (Basic Info - Renders same as NewProjectPage) */}
                  {currentStep === 1 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Basic Information
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Update essential details about your project.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Title */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="title"
                              className="text-sm font-medium"
                            >
                              Project Title
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              placeholder="Enter a clear and concise title"
                              className={
                                errors.title
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                              }
                              aria-invalid={!!errors.title}
                              aria-describedby={
                                errors.title ? "title-error" : undefined
                              }
                              disabled={isSubmitting}
                            />
                            {errors.title && (
                              <p
                                id="title-error"
                                className="text-sm text-red-600"
                              >
                                {errors.title}
                              </p>
                            )}
                          </div>
                          {/* Category */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="category"
                              className="text-sm font-medium"
                            >
                              Category <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) =>
                                handleSelectChange("category", value)
                              }
                              disabled={isSubmitting}
                              name="category"
                            >
                              <SelectTrigger
                                id="category"
                                className={
                                  errors.category
                                    ? "border-red-500 focus:ring-red-500"
                                    : ""
                                }
                                aria-invalid={!!errors.category}
                                aria-describedby={
                                  errors.category ? "category-error" : undefined
                                }
                              >
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.category && (
                              <p
                                id="category-error"
                                className="text-sm text-red-600"
                              >
                                {errors.category}
                              </p>
                            )}
                          </div>
                          {/* Other Category */}
                          {formData.category === "Other" && (
                            <div className="space-y-2 pl-2 border-l-2 border-emerald-200 animate-in fade-in duration-300">
                              <Label
                                htmlFor="otherCategory"
                                className="text-sm font-medium text-gray-600"
                              >
                                Specify Category
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="otherCategory"
                                name="otherCategory"
                                value={formData.otherCategory}
                                onChange={handleOtherCategoryChange}
                                placeholder="Enter custom category name"
                                className={
                                  errors.otherCategory
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }
                                aria-invalid={!!errors.otherCategory}
                                aria-describedby={
                                  errors.otherCategory
                                    ? "otherCategory-error"
                                    : undefined
                                }
                                disabled={isSubmitting}
                              />
                              {errors.otherCategory && (
                                <p
                                  id="otherCategory-error"
                                  className="text-sm text-red-600"
                                >
                                  {errors.otherCategory}
                                </p>
                              )}
                            </div>
                          )}
                          {/* Description */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium"
                            >
                              Description
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              placeholder="Describe your project... (min 10 characters)"
                              className={`min-h-[120px] ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              aria-invalid={!!errors.description}
                              aria-describedby={
                                errors.description
                                  ? "description-error"
                                  : undefined
                              }
                              disabled={isSubmitting}
                            />
                            {errors.description && (
                              <p
                                id="description-error"
                                className="text-sm text-red-600"
                              >
                                {errors.description}
                              </p>
                            )}
                          </div>
                          {/* Demo URL */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="demoUrl"
                              className="text-sm font-medium"
                            >
                              Demo URL (Optional)
                            </Label>
                            <div className="flex items-center space-x-2">
                              <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <Input
                                id="demoUrl"
                                name="demoUrl"
                                type="url"
                                value={formData.demoUrl}
                                onChange={handleChange}
                                placeholder="https://your-demo-site.com"
                                className={
                                  errors.demoUrl
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }
                                aria-invalid={!!errors.demoUrl}
                                aria-describedby={
                                  errors.demoUrl ? "demoUrl-error" : undefined
                                }
                                disabled={isSubmitting}
                              />
                            </div>
                            {errors.demoUrl && (
                              <p
                                id="demoUrl-error"
                                className="text-sm text-red-600"
                              >
                                {errors.demoUrl}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground pt-1">
                              Link to a live demo if available.
                            </p>
                          </div>
                        </div>
                        {/* Right Column - Image Upload */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium block">
                            Project Image
                          </Label>
                          <div className="border rounded-lg p-4 sm:p-6 bg-slate-50 flex flex-col items-center justify-center space-y-4">
                            <div className="relative w-full aspect-video overflow-hidden rounded-md bg-slate-200 flex items-center justify-center text-slate-500">
                              {imagePreview ? (
                                <Image
                                  src={imagePreview}
                                  alt="Project preview"
                                  fill
                                  className="object-cover"
                                  priority
                                  onError={() => {
                                    console.warn("Image preview failed");
                                    setImagePreview(null);
                                  }}
                                />
                              ) : (
                                <span className="text-sm">
                                  No Image Uploaded
                                </span>
                              )}
                            </div>
                            <div className="w-full">
                              <Label
                                htmlFor="image-upload"
                                className={`cursor-pointer inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 transition-colors ${isUploadingImage ? "opacity-50 cursor-not-allowed" : ""} ${errors.image ? "border-red-500" : ""}`}
                                aria-disabled={isUploadingImage}
                              >
                                {isUploadingImage ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Upload size={16} />
                                )}
                                {isUploadingImage
                                  ? "Uploading..."
                                  : imagePreview
                                    ? "Change Image"
                                    : "Upload Image"}
                              </Label>
                              <input
                                id="image-upload"
                                name="imageFile"
                                type="file"
                                className="sr-only"
                                accept="image/jpeg, image/png, image/gif, image/svg+xml, image/webp"
                                onChange={handleImageChange}
                                disabled={isUploadingImage || isSubmitting}
                                aria-describedby={
                                  errors.image ? "image-error" : "image-hint"
                                }
                              />
                              {errors.image && (
                                <p
                                  id="image-error"
                                  className="text-sm text-red-600 mt-2"
                                >
                                  {errors.image}
                                </p>
                              )}
                              <p
                                id="image-hint"
                                className="text-xs text-muted-foreground mt-2 text-center"
                              >
                                Recommended: 16:9 ratio (e.g., 1200x675px). Max
                                2MB.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 2 (Project Details - Renders same as NewProjectPage) */}
                  {currentStep === 2 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Project Details
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Update version, author, and technical dependencies.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                        {/* Version */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="version"
                            className="text-sm font-medium"
                          >
                            Version <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="version"
                            name="version"
                            value={formData.version}
                            onChange={handleChange}
                            placeholder="e.g., 1.0.0"
                            className={
                              errors.version
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }
                            aria-invalid={!!errors.version}
                            aria-describedby={
                              errors.version ? "version-error" : undefined
                            }
                            disabled={isSubmitting}
                          />
                          {errors.version && (
                            <p
                              id="version-error"
                              className="text-sm text-red-600"
                            >
                              {errors.version}
                            </p>
                          )}
                        </div>
                        {/* Author */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="author"
                            className="text-sm font-medium"
                          >
                            Author
                          </Label>
                          <Input
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Your name or company"
                            disabled={isSubmitting}
                          />
                          <p className="text-xs text-muted-foreground pt-1">
                            Defaults to &quot;Envato Elite Author&quot;, you can
                            change it.
                          </p>
                        </div>
                      </div>
                      {/* Dependencies */}
                      {renderDependencies("frontend")}
                      {renderDependencies("backend")}
                    </div>
                  )}
                  {/* Step 3 (Documentation & FAQ - Refactored Rendering) */}
                  {currentStep === 3 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Documentation & FAQ
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Update setup instructions and answer common questions.
                        </p>
                      </div>

                      {/* --- RENDER DOCUMENTATION SECTIONS DYNAMICALLY --- */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-0">
                          Documentation Sections
                        </h3>
                        {formData.documentationSections.map(
                          (section, index) => (
                            <div
                              key={section.id}
                              id={section.id}
                              className="space-y-4 border rounded-lg p-4 bg-white shadow-sm relative group"
                            >
                              {/* Section Header */}
                              <div className="flex items-center gap-3 justify-between flex-wrap mb-2">
                                <div className="flex items-center gap-3 flex-grow min-w-[200px]">
                                  <div className="text-emerald-600 flex-shrink-0">
                                    {getSectionIcon(section.icon)}
                                  </div>
                                  <div className="flex-grow">
                                    <Label
                                      htmlFor={`title-${section.id}`}
                                      className="sr-only"
                                    >
                                      Section Title {index + 1}
                                    </Label>
                                    <Input
                                      id={`title-${section.id}`}
                                      value={section.title}
                                      onChange={(e) =>
                                        handleSectionTitleChange(
                                          section.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Section ${index + 1} Title`}
                                      className={`text-base font-medium border-0 border-b rounded-none px-1 focus-visible:ring-0 focus-visible:border-emerald-500 ${errors[`doc_title_${section.id}`] ? "border-red-500" : "border-transparent hover:border-slate-300"}`}
                                      disabled={isSubmitting}
                                      aria-invalid={
                                        !!errors[`doc_title_${section.id}`]
                                      }
                                      aria-describedby={
                                        errors[`doc_title_${section.id}`]
                                          ? `doc_title_${section.id}-error`
                                          : undefined
                                      }
                                    />
                                    {errors[`doc_title_${section.id}`] && (
                                      <p
                                        id={`doc_title_${section.id}-error`}
                                        className="text-xs text-red-600 mt-1"
                                      >
                                        {errors[`doc_title_${section.id}`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {/* Markdown Toggle */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <Label
                                    htmlFor={`md-switch-${section.id}`}
                                    className="text-xs text-slate-600 flex items-center gap-1"
                                    title="Show/Hide Markdown Helper Area"
                                  >
                                    <Keyboard size={14} /> Markdown Helper
                                  </Label>
                                  <Switch
                                    id={`md-switch-${section.id}`}
                                    checked={section.showMarkdown}
                                    onCheckedChange={(checked) =>
                                      handleMarkdownVisibilityToggle(
                                        section.id,
                                        checked
                                      )
                                    }
                                    disabled={isSubmitting}
                                    aria-label={`Toggle Markdown helper visibility for ${section.title}`}
                                  />
                                </div>
                                {/* Delete Button */}
                                {section.isDeletable && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleRemoveSection(section.id)
                                    }
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Remove Section: ${section.title}`}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </div>

                              {/* Rich Text Editor */}
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`content-${section.id}`}
                                  className="text-sm font-medium"
                                >
                                  Content (Rich Text)
                                </Label>
                                <RichTextEditor
                                  id={`content-${section.id}`}
                                  value={section.content}
                                  onChange={(value) =>
                                    handleRichTextChange(section.id, value)
                                  }
                                  placeholder={`Enter rich text content for ${section.title}...`}
                                  className={
                                    errors[`doc_content_${section.id}`]
                                      ? "border-red-500"
                                      : ""
                                  }
                                  disabled={isSubmitting}
                                />
                                {errors[`doc_content_${section.id}`] && (
                                  <p
                                    id={`doc_content_${section.id}-error`}
                                    className="text-sm text-red-600 mt-1"
                                  >
                                    {errors[`doc_content_${section.id}`]}
                                  </p>
                                )}
                              </div>

                              {/* Markdown Area (Conditional) */}
                              {section.showMarkdown && (
                                <div className="space-y-2 pt-3 border-t border-slate-200 animate-in fade-in duration-300">
                                  <Label
                                    htmlFor={`markdown-${section.id}`}
                                    className="text-sm font-medium flex justify-between items-center text-slate-600"
                                  >
                                    <span>Markdown Helper / Input</span>
                                    <MarkdownGuidePopover />
                                  </Label>
                                  <Textarea
                                    id={`markdown-${section.id}`}
                                    value={section.markdownContent}
                                    onChange={(e) =>
                                      handleMarkdownChange(
                                        section.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Use helpers below or write Markdown here...`}
                                    className={`min-h-[150px] font-mono text-xs bg-slate-50`}
                                    disabled={isSubmitting}
                                  />
                                  <MarkdownCodeHelper
                                    sectionType={section.id} // Pass section ID or a type hint if needed
                                    onInsert={(markdown) =>
                                      handleInsertMarkdown(section.id, markdown)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )
                        )}
                        {/* Add New Section Button */}
                        <div className="pt-4 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSection}
                            disabled={isSubmitting}
                            className="gap-1 border-dashed"
                          >
                            <Plus size={16} /> Add Documentation Section
                          </Button>
                        </div>
                      </div>
                      {/* --- End Dynamic Documentation Sections --- */}

                      {/* --- FAQ Section (Render reused) --- */}
                      <div className="space-y-2 pt-6 border-t mt-8">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-emerald-600 flex-shrink-0">
                              {sectionIcons.Coffee}
                            </div>
                            <Label className="text-base font-medium">
                              Frequently Asked Questions (FAQ)
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFaqEntry}
                            className="gap-1"
                            disabled={isSubmitting}
                          >
                            <Plus size={16} /> Add FAQ
                          </Button>
                        </div>
                        {formData.faqEntries.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md mt-2">
                            No FAQ entries added yet. Add some to help users.
                          </div>
                        ) : (
                          <Accordion
                            type="multiple"
                            className="w-full border rounded-md px-0 mt-2 bg-white divide-y"
                          >
                            {formData.faqEntries.map((faq, index) => (
                              <AccordionItem
                                value={`item-${faq.id}`}
                                key={faq.id}
                                className="border-b-0"
                              >
                                <AccordionTrigger className="hover:no-underline px-4 py-3 text-left w-full">
                                  <span className="font-medium truncate pr-2 flex-1">
                                    Q{index + 1}:
                                    {faq.question || "(Untitled Question)"}
                                  </span>
                                  {(errors[`faq_q_${faq.id}`] ||
                                    errors[`faq_a_${faq.id}`]) && (
                                    <span className="ml-2 text-red-500 flex-shrink-0">
                                      *
                                    </span>
                                  )}
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4 px-4 space-y-4 bg-slate-50 rounded-b-md border-t">
                                  {/* FAQ Question Input */}
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`faq_q_${faq.id}`}
                                      className="text-xs font-semibold text-gray-700"
                                    >
                                      Question
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      id={`faq_q_${faq.id}`}
                                      value={faq.question}
                                      onChange={(e) =>
                                        handleFaqChange(
                                          faq.id,
                                          "question",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter the question"
                                      className={`text-sm ${errors[`faq_q_${faq.id}`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                      aria-invalid={!!errors[`faq_q_${faq.id}`]}
                                      aria-describedby={
                                        errors[`faq_q_${faq.id}`]
                                          ? `faq-q-${faq.id}-error`
                                          : undefined
                                      }
                                      disabled={isSubmitting}
                                    />
                                    {errors[`faq_q_${faq.id}`] && (
                                      <p
                                        id={`faq-q-${faq.id}-error`}
                                        className="text-xs text-red-600 mt-1"
                                      >
                                        {errors[`faq_q_${faq.id}`]}
                                      </p>
                                    )}
                                  </div>
                                  {/* FAQ Answer Input */}
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`faq_a_${faq.id}`}
                                      className="text-xs font-semibold text-gray-700"
                                    >
                                      Answer
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      id={`faq_a_${faq.id}`}
                                      value={faq.answer}
                                      onChange={(e) =>
                                        handleFaqChange(
                                          faq.id,
                                          "answer",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter the answer"
                                      rows={3}
                                      className={`text-sm ${errors[`faq_a_${faq.id}`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                      aria-invalid={!!errors[`faq_a_${faq.id}`]}
                                      aria-describedby={
                                        errors[`faq_a_${faq.id}`]
                                          ? `faq-a-${faq.id}-error`
                                          : undefined
                                      }
                                      disabled={isSubmitting}
                                    />
                                    {errors[`faq_a_${faq.id}`] && (
                                      <p
                                        id={`faq-a-${faq.id}-error`}
                                        className="text-xs text-red-600 mt-1"
                                      >
                                        {errors[`faq_a_${faq.id}`]}
                                      </p>
                                    )}
                                  </div>
                                  {/* Remove FAQ Button */}
                                  <div className="flex justify-end pt-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                      onClick={() =>
                                        handleRemoveFaqEntry(faq.id)
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <Trash2 size={14} /> Remove
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </div>
                      {/* --- End FAQ Section --- */}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons (Same as NewProjectPage, but Submit text changes) */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 md:p-8 bg-slate-50 border-t mt-auto">
                  <div className="mb-4 sm:mb-0 min-h-[20px]">
                    {errors.submit && (
                      <p className="text-sm text-red-600 font-medium">
                        {errors.submit}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isSubmitting}
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep < 3 && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isUploadingImage || isSubmitting}
                        aria-label="Next Step"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait...
                          </>
                        ) : (
                          "Next"
                        )}
                      </Button>
                    )}
                    {currentStep === 3 && (
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting || isUploadingImage}
                        aria-label={
                          isSubmitting ? "Updating project..." : "Save Changes"
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading Image...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* --- Helpful Tips (Reused) --- */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Info size={16} className="text-blue-700" /> Editor Tips
              </h3>
              <ul className="text-sm text-blue-700 space-y-1.5 ml-5 list-disc marker:text-blue-400">
                <li>
                  The Rich Text Editor is the primary content area. Use its
                  toolbar for formatting, links, images (
                  <ImageIcon
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  ), videos (
                  <Video
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  ), and code blocks (
                  <CodeIcon
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  ).
                </li>
                <li>
                  Optionally, toggle the &quot;Markdown Helper&quot; (
                  <Keyboard
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  ) switch for each section to show a Markdown input area below.
                </li>
                <li>
                  Use the Markdown helpers (
                  <CodeIcon
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  <HelpCircle
                    size={14}
                    className="inline align-text-bottom mx-0.5"
                  />
                  ) to generate Markdown snippets (like code blocks) in the
                  helper area. You can then copy/paste this into the Rich Text
                  Editor above if needed.
                </li>
                <li>
                  Content saved upon submission comes directly from the Rich
                  Text Editor.
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* End Container */}
      </div>
      {/* End Background */}
    </DashboardLayout>
  );
}
