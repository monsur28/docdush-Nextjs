"use client";

import { useState } from "react";
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
  GripVertical,
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
import { toast } from "sonner";
import axiosSecure from "@/lib/axiosSecure";
import { RichTextEditor } from "@/components/rich-text-editor";
import { MarkdownGuidePopover } from "@/components/markdown-guide-popover";
import { MarkdownCodeHelper } from "@/components/markdown-code-helper";

// Helper function to generate unique IDs
const generateId = () =>
  `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- Initial Documentation Sections ---
const initialDocumentationSections = [
  // Added showMarkdown state, removed editorMode
  {
    id: "introduction",
    title: "Introduction",
    icon: "FileText",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "prerequisites",
    title: "Prerequisites",
    icon: "CheckCircle2",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "installation",
    title: "Installation",
    icon: "Box",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "frontend-setup",
    title: "Frontend Configuration",
    icon: "Monitor",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "backend-setup",
    title: "Backend Configuration",
    icon: "Server",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "database",
    title: "Database Setup",
    icon: "Database",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
  {
    id: "authentication",
    title: "Authentication",
    icon: "Lock",
    content: "<p></p>",
    markdownContent: "",
    showMarkdown: false,
    isDeletable: true,
    isCustom: false,
  },
];

// --- Icon Mapping ---
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
};
const getSectionIcon = (iconName) => {
  return sectionIcons[iconName] || sectionIcons.BookOpen;
};

// --- Category Options ---
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

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    otherCategory: "",
    image: null,
    version: "1.0.0",
    author: "Envato Elite Author",
    demoUrl: "",
    frontendDependencies: [],
    backendDependencies: [],
    documentationSections: initialDocumentationSections,
    faqEntries: [],
  });
  const [errors, setErrors] = useState({});
  const [nextDependencyId, setNextDependencyId] = useState(1);
  const [nextFaqId, setNextFaqId] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      ...(name === "category" && value !== "Other" && { otherCategory: "" }),
    }));
    if (errors[name] || errors.otherCategory) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.otherCategory;
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

  // Handler for toggling Markdown visibility
  const handleMarkdownVisibilityToggle = (sectionId, show) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId ? { ...section, showMarkdown: show } : section
      ),
    }));
  };

  // Rich Text Editor Changes - Primary Content Source
  const handleRichTextChange = (sectionId, value) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId ? { ...section, content: value } : section
      ),
    }));
    const errorKey = `doc_content_${sectionId}`;
    if (errors[errorKey]) {
      // Clear error if content is modified
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Markdown Textarea Changes - Helper Input
  const handleMarkdownChange = (sectionId, value) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.map((section) =>
        section.id === sectionId
          ? { ...section, markdownContent: value }
          : section
      ),
    }));
  };

  // Insert Markdown Snippets into the Markdown Textarea
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
    const textarea = document.getElementById(`markdown-${sectionId}`);
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      }, 0);
    }
  };

  // Add Section - Initialize with showMarkdown: false
  const handleAddSection = () => {
    const newSection = {
      id: generateId(),
      title: "New Section",
      icon: "BookOpen",
      content: "<p></p>",
      markdownContent: "",
      showMarkdown: false,
      isDeletable: true,
      isCustom: true,
    };
    setFormData((prev) => ({
      ...prev,
      documentationSections: [...prev.documentationSections, newSection],
    }));
    setTimeout(() => {
      const element = document.getElementById(newSection.id);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      const titleInput = document.getElementById(`title-${newSection.id}`);
      titleInput?.focus();
    }, 100);
  };

  // Remove Section (Keep as is)
  const handleRemoveSection = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documentationSections: prev.documentationSections.filter(
        (section) => section.id !== idToRemove
      ),
    }));
    const titleErrorKey = `doc_title_${idToRemove}`;
    const contentErrorKey = `doc_content_${idToRemove}`;
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[titleErrorKey];
      delete newErrors[contentErrorKey];
      return newErrors;
    });
  };

  // --- Image Handler (Keep as is) ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    const currentImageOnError = formData.image;
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.image;
      return ne;
    });
    if (!file) {
      setImagePreview(formData.image);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size should not exceed 2MB",
      }));
      setImagePreview(currentImageOnError);
      return;
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
      setImagePreview(currentImageOnError);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImagePreview(reader.result.toString());
      } else {
        setImagePreview(currentImageOnError);
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
    setIsUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      const response = await axiosSecure.post("/api/upload", uploadFormData);
      if (response.data.url) {
        const uploadedUrl = response.data.url;
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        setImagePreview(uploadedUrl);
        toast.success("Image uploaded!");
      } else {
        throw new Error(
          response.data?.message ||
            "Image upload API did not return a valid URL."
        );
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred during upload.";
      setErrors((prev) => ({
        ...prev,
        image: `Image upload failed: ${apiErrorMessage}. Please try again.`,
      }));
      setImagePreview(currentImageOnError);
      setFormData((prev) => ({ ...prev, image: currentImageOnError }));
      toast.error(`Image upload failed: ${apiErrorMessage}`);
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // --- Dependency & FAQ Handlers (Keep as is) ---
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
  };
  const handleDependencyChange = (type, id, field, value) => {
    const key =
      type === "frontend" ? "frontendDependencies" : "backendDependencies";
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
    const errorKey = `faq_${field.slice(0, 1)}_${id}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // --- Step Navigation (Keep as is) ---
  const nextStep = () => {
    const { isValid, stepErrors } = runValidationForStep(currentStep);
    const currentFields = getCurrentStepFields(currentStep);
    const clearedErrors = { ...errors };
    currentFields.forEach((fieldKey) => {
      if (fieldKey.includes("*")) {
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
      window.scrollTo(0, 0);
      const firstErrorKey = Object.keys(stepErrors)[0];
      if (firstErrorKey) {
        let elementId = firstErrorKey;
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
      }
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  const getCurrentStepFields = (step) => {
    if (step === 1) {
      return [
        "title",
        "description",
        "category",
        "otherCategory",
        "image",
        "demoUrl",
      ];
    }
    if (step === 2) {
      return [
        "version",
        "fe_dep_name_*",
        "fe_dep_version_*",
        "be_dep_name_*",
        "be_dep_version_*",
      ];
    }
    if (step === 3) {
      return ["doc_title_*", "doc_content_*", "faq_q_*", "faq_a_*"];
    }
    return [];
  };

  // --- Validation Logic ---
  const runValidationForStep = (step) => {
    const stepErrors = {};
    let isValid = true;
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
      if (errors.image) {
        stepErrors.image = errors.image; /* isValid = false; */
      }
      if (!formData.image && !errors.image) {
        /* stepErrors.image = "Project image is required"; isValid = false; */
      }
      if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
        stepErrors.demoUrl = "Please enter a valid URL";
        isValid = false;
      }
    }
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
    if (step === 3) {
      // ** UPDATED: Validate only RTE content ('content') **
      formData.documentationSections.forEach((section, index) => {
        if (!section.title.trim()) {
          stepErrors[`doc_title_${section.id}`] =
            `Section #${index + 1} Title required`;
          isValid = false;
        }
        const plainTextContent = section.content.replace(/<[^>]*>/g, "").trim(); // Check HTML content
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

  // --- Final Validation Before Submit ---
  const validateAll = () => {
    const { isValid: step1Valid, stepErrors: step1Errors } =
      runValidationForStep(1);
    const { isValid: step2Valid, stepErrors: step2Errors } =
      runValidationForStep(2);
    const { isValid: step3Valid, stepErrors: step3Errors } =
      runValidationForStep(3);
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    if (errors.image && !allErrors.image) {
      allErrors.image = errors.image;
    }
    if (
      formData.category === "Other" &&
      !formData.otherCategory.trim() &&
      !allErrors.otherCategory
    ) {
      allErrors.otherCategory = "Please specify the category name";
    }
    const overallValid =
      step1Valid &&
      step2Valid &&
      step3Valid &&
      !allErrors.image &&
      !allErrors.otherCategory;
    setErrors(allErrors);
    let firstInvalidStep = null;
    if (!step1Valid || allErrors.image || allErrors.otherCategory)
      firstInvalidStep = 1;
    else if (!step2Valid) firstInvalidStep = 2;
    else if (!step3Valid) firstInvalidStep = 3;
    return { overallValid, firstInvalidStep };
  };

  // Helper function to validate URL (Keep as is)
  const isValidUrl = (string) => {
    if (!string) return true;
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // --- Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });
    const { overallValid, firstInvalidStep } = validateAll();
    if (!overallValid) {
      setCurrentStep(firstInvalidStep);
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
        submit: "Please wait for image upload.",
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
    const projectDataToSubmit = {
      title: formData.title,
      description: formData.description,
      category: finalCategory,
      image: formData.image,
      version: formData.version,
      author: formData.author,
      demoUrl: formData.demoUrl || null,
      packageRequirements: {
        frontend: formData.frontendDependencies.map(({ id, ...rest }) => rest),
        backend: formData.backendDependencies.map(({ id, ...rest }) => rest),
      },
      // ** UPDATED: Submit only the primary RTE content ('content') **
      documentationSections: formData.documentationSections.map(
        ({
          isDeletable,
          isCustom,
          markdownContent,
          showMarkdown,
          /* ignore markdownContent & showMarkdown */ ...rest
        }) => ({
          ...rest, // id, title, icon, content (from RTE)
          supportsMarkdown: true, // Still indicate it *could* have come from markdown conceptually
          supportsHtml: true,
        })
      ),
      faqs: formData.faqEntries.map(({ id, ...rest }) => ({
        ...rest,
        supportsMarkdown: false,
        supportsHtml: false,
      })),
      status: "Published",
    };

    try {
      const response = await axiosSecure.post(
        "/api/projects",
        projectDataToSubmit
      );
      if (response.status === 201 && response.data?.success) {
        toast.success("Project Created Successfully!");
        router.push("/dashboard/projects");
      } else {
        const errorMessage =
          response.data?.message || `API Error (Status: ${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      setErrors((prev) => ({
        ...prev,
        submit: `Failed to create project: ${apiErrorMessage}`,
      }));
      toast.error(`Failed to create project: ${apiErrorMessage}`);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper Render Functions (Keep renderDependencies as is) ---
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

  // --- JSX ---
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header, Progress, Tabs */}
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
              <h1 className="text-3xl font-bold text-gray-800">
                Create New Project
              </h1>
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
                        const { isValid: step1Valid, stepErrors: s1Errors } =
                          runValidationForStep(1);
                        const { isValid: step2Valid, stepErrors: s2Errors } =
                          runValidationForStep(2);
                        const currentFields1 = getCurrentStepFields(1);
                        const currentFields2 = getCurrentStepFields(2);
                        const clearedErrors = { ...errors };
                        currentFields1.forEach((f) => delete clearedErrors[f]);
                        currentFields2.forEach((f) => {
                          if (f.includes("*")) {
                            const prefix = f.split("*")[0];
                            Object.keys(clearedErrors).forEach((key) => {
                              if (key.startsWith(prefix))
                                delete clearedErrors[key];
                            });
                          } else {
                            delete clearedErrors[f];
                          }
                        });
                        setErrors({
                          ...clearedErrors,
                          ...s1Errors,
                          ...s2Errors,
                        });
                        if (step1Valid && step2Valid) {
                          setCurrentStep(3);
                        } else if (step1Valid) {
                          setCurrentStep(2);
                        } else {
                          setCurrentStep(1);
                        }
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
                  {/* Step 1 */}
                  {currentStep === 1 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Basic Information
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Provide essential details about your project.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
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
                          <div className="space-y-2">
                            <Label
                              htmlFor="category"
                              className="text-sm font-medium"
                            >
                              Category
                              <span className="text-red-500">*</span>
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
                              placeholder="Describe your project, its purpose, and key features (min 10 characters)"
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
                                  onError={(e) => {
                                    console.warn(
                                      "Image preview failed to load:",
                                      e.target.src
                                    );
                                    setImagePreview(null);
                                  }}
                                />
                              ) : formData.image ? (
                                <Image
                                  src={formData.image}
                                  alt="Project image"
                                  fill
                                  className="object-cover"
                                  priority
                                  onError={(e) => {
                                    console.warn(
                                      "Form data image failed to load:",
                                      e.target.src
                                    );
                                    setFormData((prev) => ({
                                      ...prev,
                                      image: null,
                                    }));
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
                                  : imagePreview || formData.image
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

                  {/* Step 2 */}
                  {currentStep === 2 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Project Details
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Specify version, author, and technical dependencies.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
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
                      {renderDependencies("frontend")}
                      {renderDependencies("backend")}
                    </div>
                  )}

                  {/* Step 3 */}
                  {currentStep === 3 && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                      <div className="border-b pb-4 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Documentation & FAQ
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Provide setup instructions and answer common
                          questions.
                        </p>
                      </div>
                      {/* Documentation Sections */}
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
                                {/* Markdown Visibility Toggle */}
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

                              {/* Rich Text Editor (Always Visible) */}
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

                              {/* Markdown Area (Conditionally Visible) */}
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
                                    sectionType={section.id} // Pass section ID
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
                      {/* --- End Documentation Sections --- */}

                      {/* --- FAQ Section (Keep as is) --- */}
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

                {/* --- Navigation Buttons --- */}
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
                          isSubmitting
                            ? "Creating project..."
                            : "Create Project"
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading Image...
                          </>
                        ) : (
                          "Create Project"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* --- Helpful Tips --- */}
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
      </div>
    </DashboardLayout>
  );
}
