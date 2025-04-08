"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
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
import DashboardLayout from "@/components/DashboardLayout";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { MarkdownCodeHelper } from "@/components/markdown-code-helper";
import { MarkdownGuidePopover } from "@/components/markdown-guide-popover";

// --- Get ImgBB API Key from environment variables ---
// IMPORTANT: This key WILL BE EXPOSED in the browser bundle.
// Consider a backend proxy route for production security.
const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

// Helper to safely get documentation content
const getDocContent = (sections = [], id) => {
  const section = sections.find((sec) => sec.id === id);
  return section ? section.content : "";
};

// Helper to add temporary IDs for form state management
const addTempIds = (items = [], startingId = 1) => {
  let counter = startingId;
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({ ...item, id: counter++ }));
};

export default function EditProjectPage({ params }) {
  // --- *** Use React.use() to resolve/unwrap params *** ---
  const resolvedParams = use(params);
  const { id: projectId } = resolvedParams;

  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    version: "1.0.0",
    author: "Envato Elite Author",
    demoUrl: "", // New field for demo URL
    frontendDependencies: [],
    backendDependencies: [],
    introContent: "",
    prerequisitesContent: "",
    installationContent: "",
    frontendConfigContent: "",
    backendConfigContent: "",
    databaseSetupContent: "",
    authenticationContent: "",
    faqEntries: [],
    featured: false,
    status: "Draft",
  });

  const [errors, setErrors] = useState({});
  const [nextDependencyId, setNextDependencyId] = useState(1);
  const [nextFaqId, setNextFaqId] = useState(1);
  const [imagePreview, setImagePreview] = useState(formData.image);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- Fetch Existing Project Data ---
  useEffect(() => {
    if (!projectId) {
      toast.error("Project ID is missing from URL.");
      setIsLoadingData(false);
      router.push("/dashboard/projects");
      return;
    }

    const fetchProjectData = async () => {
      setIsLoadingData(true);
      setErrors({});
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        const project = response.data;
        if (!project) throw new Error("Project not found (404)");

        const feDeps = project.packageRequirements?.frontend || [];
        const beDeps = project.packageRequirements?.backend || [];
        const faqData = project.faqs || [];
        const docSections = project.documentationSections || [];
        const transformedFaqs = addTempIds(faqData, 1);
        const transformedFeDeps = addTempIds(feDeps, 1);
        const transformedBeDeps = addTempIds(
          beDeps,
          transformedFeDeps.length + 1
        );

        setFormData({
          title: project.title || "",
          description: project.description || "",
          category: project.category || "",
          image: project.image || "/placeholder.svg?height=600&width=1200",
          version: project.version || "1.0.0",
          author: project.author || "Envato Elite Author",
          demoUrl: project.demoUrl || "", // Add demoUrl field
          frontendDependencies: transformedFeDeps,
          backendDependencies: transformedBeDeps,
          introContent: getDocContent(docSections, "introduction"),
          prerequisitesContent: getDocContent(docSections, "prerequisites"),
          installationContent: getDocContent(docSections, "installation"),
          frontendConfigContent: getDocContent(docSections, "frontend-setup"),
          backendConfigContent: getDocContent(docSections, "backend-setup"),
          databaseSetupContent: getDocContent(docSections, "database"),
          authenticationContent: getDocContent(docSections, "authentication"),
          faqEntries: transformedFaqs,
          featured: project.featured !== undefined ? project.featured : false,
          status: project.status || "Draft",
        });
        setImagePreview(
          project.image || "/placeholder.svg?height=600&width=1200"
        );
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
        if (error.response?.status === 404) router.push("/dashboard/projects");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  // --- *** UPDATED Image Handler *** ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    const currentImageOnError = formData.image; // Store current actual image URL (or null) for error fallback

    // Clear previous errors and reset preview/state if no file selected
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.image;
      return ne;
    });
    if (!file) {
      // If user cancels file selection, revert preview to the last known good state
      setImagePreview(formData.image); // Revert to last saved image URL or null
      return;
    }

    // Validation
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      setErrors((prev) => ({
        ...prev,
        image: "Image size should not exceed 2MB",
      }));
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
      // Added webp
      setErrors((prev) => ({
        ...prev,
        image: "Invalid file type (JPG, PNG, GIF, SVG, WEBP allowed)",
      }));
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        // Ensure reader.result is not null
        setImagePreview(reader.result.toString()); // Convert ArrayBuffer/Blob to string if necessary
      } else {
        setImagePreview(currentImageOnError); // Fallback if reading fails
      }
    };
    reader.onerror = () => {
      // Handle file reading errors
      console.error("Error reading file for preview.");
      setImagePreview(currentImageOnError); // Fallback on read error
      setErrors((prev) => ({
        ...prev,
        image: "Could not preview the selected file.",
      }));
    };
    reader.readAsDataURL(file);

    // Start upload process
    setIsUploadingImage(true);

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      if (!imgbbApiKey) {
        throw new Error(
          "ImgBB API Key not configured in environment variables (NEXT_PUBLIC_IMGBB_API_KEY)"
        );
      }

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        const uploadedUrl = response.data.data.url;
        console.log("Image uploaded successfully:", uploadedUrl);
        setFormData((prev) => ({ ...prev, image: uploadedUrl })); // Save the actual URL
        setImagePreview(uploadedUrl); // Ensure preview shows the final URL
        toast.success("Image uploaded!");
      } else {
        throw new Error(
          response.data?.error?.message || "ImgBB API returned an error"
        );
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors((prev) => ({
        ...prev,
        image: "Image upload failed. Please try again.",
      }));
      setImagePreview(currentImageOnError); // Revert preview to previous actual URL (or null) on error
      setFormData((prev) => ({ ...prev, image: currentImageOnError })); // Revert formData on error
      toast.error("Image upload failed."); // Add error toast
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- Dependency Handlers ---
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
        const ne = { ...prev };
        delete ne[errorKey];
        return ne;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].map((dep) =>
        dep.id === id ? { ...dep, [field]: value } : dep
      ),
    }));
  };

  // --- FAQ Handlers ---
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
      const ne = { ...prev };
      delete ne[`faq_q_${id}`];
      delete ne[`faq_a_${id}`];
      return ne;
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
        const ne = { ...prev };
        delete ne[errorKey];
        return ne;
      });
    }
  };

  // --- New handler for inserting code templates ---
  const handleInsertCodeTemplate = (sectionName, codeTemplate) => {
    const currentContent = formData[sectionName] || "";
    const newContent =
      currentContent + (currentContent ? "\n\n" : "") + codeTemplate;
    setFormData((prev) => ({ ...prev, [sectionName]: newContent }));
  };

  // --- Step Navigation ---
  const nextStep = () => {
    const { isValid, stepErrors } = runValidationForStep(currentStep);
    // Clear previous errors specific to this step before setting new ones
    const currentStepFields = getCurrentStepFields(currentStep);
    const clearedErrors = { ...errors };
    currentStepFields.forEach((field) => delete clearedErrors[field]);

    setErrors({ ...clearedErrors, ...stepErrors });

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0); // Scroll up to show errors
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Helper to get fields relevant to the current validation step
  const getCurrentStepFields = (step) => {
    if (step === 1)
      return ["title", "description", "category", "image", "demoUrl"];
    if (step === 2) {
      const depErrors = [];
      formData.frontendDependencies.forEach((dep) => {
        depErrors.push(`fe_dep_name_${dep.id}`);
        depErrors.push(`fe_dep_version_${dep.id}`);
      });
      formData.backendDependencies.forEach((dep) => {
        depErrors.push(`be_dep_name_${dep.id}`);
        depErrors.push(`be_dep_version_${dep.id}`);
      });
      return ["version", ...depErrors];
    }
    if (step === 3) {
      const faqErrors = [];
      formData.faqEntries.forEach((faq) => {
        faqErrors.push(`faq_q_${faq.id}`);
        faqErrors.push(`faq_a_${faq.id}`);
      });
      // Add documentation content fields if they have validation rules
      const docFields = Object.keys(docLabels);
      return [...docFields, ...faqErrors];
    }
    return [];
  };

  // --- Updated Validation Logic to include demoUrl ---
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
      }
      // Check if there's an image upload error stored in the main errors state
      if (errors.image) {
        stepErrors.image = errors.image; // Propagate existing image error
        isValid = false;
      }
      // Validate demo URL if provided (optional field)
      if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
        stepErrors.demoUrl =
          "Please enter a valid URL (e.g., https://example.com)";
        isValid = false;
      }
    }
    if (step === 2) {
      if (!formData.version.trim()) {
        stepErrors.version = "Version is required";
        isValid = false;
      }
      // Only validate dependencies if they exist
      if (formData.frontendDependencies.length > 0) {
        formData.frontendDependencies.forEach((dep, index) => {
          if (!dep.name.trim()) {
            stepErrors[`fe_dep_name_${dep.id}`] = `FE Dep #${
              index + 1
            } Name required`;
            isValid = false;
          }
          if (!dep.version.trim()) {
            stepErrors[`fe_dep_version_${dep.id}`] = `FE Dep #${
              index + 1
            } Version required`;
            isValid = false;
          }
        });
      }
      if (formData.backendDependencies.length > 0) {
        formData.backendDependencies.forEach((dep, index) => {
          if (!dep.name.trim()) {
            stepErrors[`be_dep_name_${dep.id}`] = `BE Dep #${
              index + 1
            } Name required`;
            isValid = false;
          }
          if (!dep.version.trim()) {
            stepErrors[`be_dep_version_${dep.id}`] = `BE Dep #${
              index + 1
            } Version required`;
            isValid = false;
          }
        });
      }
    }
    if (step === 3) {
      // Only validate FAQs if they exist
      if (formData.faqEntries.length > 0) {
        formData.faqEntries.forEach((faq, index) => {
          if (!faq.question.trim()) {
            stepErrors[`faq_q_${faq.id}`] = `FAQ #${
              index + 1
            } Question required`;
            isValid = false;
          }
          if (!faq.answer.trim()) {
            stepErrors[`faq_a_${faq.id}`] = `FAQ #${index + 1} Answer required`;
            isValid = false;
          }
        });
      }
      // Add validation for documentation sections if needed (e.g., minimum length)
      // Example:
      // if (!formData.introContent.trim()) {
      //     stepErrors.introContent = "Introduction content is required";
      //     isValid = false;
      // }
    }
    return { isValid, stepErrors };
  };

  const validateAll = () => {
    const { isValid: step1Valid, stepErrors: step1Errors } =
      runValidationForStep(1);
    const { isValid: step2Valid, stepErrors: step2Errors } =
      runValidationForStep(2);
    const { isValid: step3Valid, stepErrors: step3Errors } =
      runValidationForStep(3);
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    // Ensure existing image upload errors are retained
    if (errors.image && !allErrors.image) {
      allErrors.image = errors.image;
    }
    const overallValid =
      step1Valid && step2Valid && step3Valid && !allErrors.image; // Ensure image has no errors too
    setErrors(allErrors);
    return {
      overallValid,
      firstInvalidStep:
        !step1Valid || allErrors.image // Go to step 1 if image error exists
          ? 1
          : !step2Valid
          ? 2
          : !step3Valid
          ? 3
          : null,
    };
  };

  // Helper function to validate URL (basic check)
  const isValidUrl = (string) => {
    // Allow empty or null strings
    if (!string) return true;
    try {
      const url = new URL(string);
      // Basic check for http or https protocol
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // --- Submission (Updated to include demoUrl) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous submit error
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.submit;
      return ne;
    });

    const { overallValid, firstInvalidStep } = validateAll();

    if (!overallValid) {
      setCurrentStep(firstInvalidStep);
      window.scrollTo(0, 0);
      setErrors((prev) => ({
        ...prev,
        submit: "Please fix the errors highlighted above before submitting.",
      }));
      toast.error("Validation failed. Please check the form.");
      return;
    }

    // Double check if image is still uploading
    if (isUploadingImage) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please wait for the image to finish uploading.",
      }));
      toast.warning("Image is still uploading.");
      window.scrollTo(0, 0); // Scroll to top where error might appear
      return;
    }

    setIsSubmitting(true);

    // Prepare data, ensure dependencies and FAQs don't include the temporary 'id'
    const projectDataToSubmit = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: formData.image, // Will be null or the ImgBB URL
      version: formData.version,
      author: formData.author,
      demoUrl: formData.demoUrl || null, // Send null if empty
      packageRequirements: {
        frontend: formData.frontendDependencies.map(({ id, ...rest }) => rest), // Exclude 'id'
        backend: formData.backendDependencies.map(({ id, ...rest }) => rest), // Exclude 'id'
      },
      documentationSections: [
        {
          id: "introduction",
          title: "Introduction",
          icon: "FileText", // Keep icon name as string for API
          content: formData.introContent,
          supportsMarkdown: false,
        },
        {
          id: "prerequisites",
          title: "Prerequisites",
          icon: "CheckCircle2",
          content: formData.prerequisitesContent,
          supportsMarkdown: true,
        },
        {
          id: "installation",
          title: "Installation",
          icon: "Box",
          content: formData.installationContent,
          supportsMarkdown: true,
        },
        {
          id: "frontend-setup",
          title: "Frontend Configuration",
          icon: "Monitor",
          content: formData.frontendConfigContent,
          supportsMarkdown: true,
        },
        {
          id: "backend-setup",
          title: "Backend Configuration",
          icon: "Server",
          content: formData.backendConfigContent,
          supportsMarkdown: true,
        },
        {
          id: "database",
          title: "Database Setup",
          icon: "Database",
          content: formData.databaseSetupContent,
          supportsMarkdown: true,
        },
        {
          id: "authentication",
          title: "Authentication",
          icon: "Lock",
          content: formData.authenticationContent,
          supportsMarkdown: true,
        },
      ],
      faqs: formData.faqEntries.map(({ id, ...rest }) => ({
        // Exclude 'id'
        ...rest,
        supportsMarkdown: false,
      })),
      featured: formData.featured,
      status: formData.status,
    };

    try {
      console.log(
        `Submitting update for project ${projectId}:`,
        projectDataToSubmit
      );
      // Use Axios PUT call
      const response = await axios.put(
        `/api/projects/${projectId}`,
        projectDataToSubmit
      );

      if (response.status === 200 && response.data?.success) {
        toast.success("Project Updated Successfully!");
        router.push("/dashboard/projects");
      } else {
        throw new Error(
          response.data?.message || "API Error: Failed to update project"
        );
      }
    } catch (error) {
      console.error("Error updating project:", error);
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      setErrors({ submit: `Failed to update project: ${apiErrorMessage}` });
      toast.error(`Failed to update project: ${apiErrorMessage}`);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper Render Functions ---
  const renderDependencies = (type) => {
    const dependencies =
      formData[
        type === "frontend" ? "frontendDependencies" : "backendDependencies"
      ];
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">
            {type === "frontend"
              ? "Frontend Dependencies"
              : "Backend Dependencies"}
          </h4>
          <Button
            type="button" // Ensure it doesn't submit the form
            variant="outline"
            size="sm"
            onClick={() => handleAddDependency(type)}
            className="gap-1"
            disabled={isSubmitting} // Disable while submitting
          >
            <Plus size={16} /> Add Dependency
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            {dependencies.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                No {type} dependencies added yet
              </div>
            ) : (
              dependencies.map(
                (
                  dep,
                  index // Add index for better error messages if needed
                ) => (
                  <div
                    key={dep.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start" // Use items-start for alignment with error messages
                  >
                    <div className="sm:col-span-5">
                      <Label
                        htmlFor={`${type}_dep_name_${dep.id}`}
                        className="sr-only"
                      >
                        Dependency Name {index + 1}
                      </Label>
                      <Input
                        id={`${type}_dep_name_${dep.id}`}
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
                          errors[`${type.slice(0, 2)}_dep_name_${dep.id}`]
                            ? "border-red-500"
                            : ""
                        }
                        disabled={isSubmitting} // Disable while submitting
                      />
                      {errors[`${type.slice(0, 2)}_dep_name_${dep.id}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[`${type.slice(0, 2)}_dep_name_${dep.id}`]}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-5">
                      <Label
                        htmlFor={`${type}_dep_version_${dep.id}`}
                        className="sr-only"
                      >
                        Dependency Version {index + 1}
                      </Label>
                      <Input
                        id={`${type}_dep_version_${dep.id}`}
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
                          errors[`${type.slice(0, 2)}_dep_version_${dep.id}`]
                            ? "border-red-500"
                            : ""
                        }
                        disabled={isSubmitting} // Disable while submitting
                      />
                      {errors[`${type.slice(0, 2)}_dep_version_${dep.id}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[`${type.slice(0, 2)}_dep_version_${dep.id}`]}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2 flex justify-end pt-1 sm:pt-0">
                      <Button
                        type="button" // Ensure it doesn't submit the form
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDependency(type, dep.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Remove ${type} Dependency ${index + 1}`}
                        disabled={isSubmitting} // Disable while submitting
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                )
              )
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- Documentation Section Data ---
  const docIcons = {
    introContent: <FileText className="h-5 w-5" />,
    prerequisitesContent: <CheckCircle2 className="h-5 w-5" />,
    installationContent: <Box className="h-5 w-5" />,
    frontendConfigContent: <Monitor className="h-5 w-5" />,
    backendConfigContent: <Server className="h-5 w-5" />,
    databaseSetupContent: <Database className="h-5 w-5" />,
    authenticationContent: <Lock className="h-5 w-5" />,
    faqEntries: <Coffee className="h-5 w-5" />, // Icon for the FAQ section header
  };

  const docLabels = {
    introContent: "Introduction",
    prerequisitesContent: "Prerequisites",
    installationContent: "Installation",
    frontendConfigContent: "Frontend Configuration",
    backendConfigContent: "Backend Configuration",
    databaseSetupContent: "Database Setup",
    authenticationContent: "Authentication",
    // faqEntries is handled separately below
  };

  // Define which sections support markdown
  const markdownSupport = {
    introContent: false,
    prerequisitesContent: true,
    installationContent: true,
    frontendConfigContent: true,
    backendConfigContent: true,
    databaseSetupContent: true,
    authenticationContent: true,
    // FAQs explicitly do not support markdown in the submission object
  };

  // --- Loading UI ---
  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
          <span className="ml-4 text-lg text-gray-600">
            Loading Project Data...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  // --- JSX ---
  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors /> {/* Add Toaster component */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header, Progress, Tabs... */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => router.push("/dashboard/projects")}
                aria-label="Back to Projects"
                disabled={isSubmitting} // Disable navigation while submitting
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
              {/* Use onClick on TabsTrigger for navigation only if validation passes */}
              <Tabs value={currentStep.toString()} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger
                    value="1"
                    disabled={isSubmitting}
                    className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                    onClick={(e) => {
                      if (currentStep > 1) {
                        e.preventDefault(); // Prevent default tab switch
                        setCurrentStep(1); // Navigate if allowed
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
                        // Allow navigation to step 2 only if step 1 is valid or coming from step 3
                        if (
                          currentStep === 3 ||
                          runValidationForStep(1).isValid
                        ) {
                          setCurrentStep(2);
                          window.scrollTo(0, 0);
                        } else if (currentStep === 1) {
                          nextStep(); // Run validation before moving from 1 to 2
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
                        // Allow navigation to step 3 only if step 2 is valid
                        if (
                          currentStep < 3 &&
                          runValidationForStep(1).isValid &&
                          runValidationForStep(2).isValid
                        ) {
                          setCurrentStep(3);
                          window.scrollTo(0, 0);
                        } else if (currentStep === 2) {
                          nextStep(); // Run validation before moving from 2 to 3
                        } else if (currentStep === 1) {
                          // Try to validate step 1 then step 2
                          const { isValid: step1Valid } =
                            runValidationForStep(1);
                          if (step1Valid) {
                            const { isValid: step2Valid } =
                              runValidationForStep(2);
                            if (step2Valid) {
                              setCurrentStep(3);
                              window.scrollTo(0, 0);
                            } else {
                              setCurrentStep(2); // Go to step 2 first if invalid
                              window.scrollTo(0, 0);
                            }
                          } else {
                            setCurrentStep(1); // Stay on step 1 if invalid
                            window.scrollTo(0, 0);
                          }
                        }
                      }
                    }}
                  >
                    Documentation
                    {Object.keys(errors).some(
                      (k) => k.includes("Content") || k.startsWith("faq_")
                    ) && <span className="ml-1 text-red-500">*</span>}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <form
              onSubmit={handleSubmit}
              noValidate // Prevent browser default validation, rely on custom logic
              className="max-w-5xl mx-auto"
            >
              <Card className="border-none shadow-lg overflow-hidden">
                {" "}
                {/* Added overflow-hidden */}
                <CardContent className="p-0">
                  <div className="min-h-[400px]">
                    {" "}
                    {/* Ensure minimum height for content visibility */}
                    {/* Step 1: Basic Information */}
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
                                Project Title{" "}
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
                                Category <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                  handleSelectChange("category", value)
                                }
                                disabled={isSubmitting}
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
                                    errors.category
                                      ? "category-error"
                                      : undefined
                                  }
                                >
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {/* Add more relevant categories if needed */}
                                  <SelectItem value="Full Stack App">
                                    Full Stack App
                                  </SelectItem>
                                  <SelectItem value="Frontend App">
                                    Frontend App
                                  </SelectItem>
                                  <SelectItem value="Backend API">
                                    Backend API
                                  </SelectItem>
                                  <SelectItem value="E-commerce">
                                    E-commerce
                                  </SelectItem>
                                  <SelectItem value="Media Platform">
                                    Media Platform
                                  </SelectItem>
                                  <SelectItem value="SaaS">SaaS</SelectItem>
                                  <SelectItem value="Portfolio">
                                    Portfolio
                                  </SelectItem>
                                  <SelectItem value="Blog">Blog</SelectItem>
                                  <SelectItem value="Utility Tool">
                                    Utility Tool
                                  </SelectItem>
                                  <SelectItem value="Game">Game</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
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

                            <div className="space-y-2">
                              <Label
                                htmlFor="description"
                                className="text-sm font-medium"
                              >
                                Description{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your project, its purpose, and key features (min 10 characters)"
                                className={`min-h-[120px] ${
                                  errors.description
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }`}
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
                                  type="url" // Use type="url" for better semantics/mobile keyboards
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
                                {imagePreview || formData.image ? ( // Conditionally render image only if src is valid
                                  <Image
                                    // Use imagePreview first for instant feedback, fallback to formData.image
                                    src={imagePreview || formData.image}
                                    alt="Project preview"
                                    fill
                                    className="object-cover"
                                    priority // Load image early if it's important
                                    // Add onError handler? Maybe revert to placeholder/show error?
                                    onError={() => {
                                      console.warn(
                                        "Image failed to load:",
                                        imagePreview || formData.image
                                      );
                                      // Optionally clear preview/formData.image if load fails
                                      // setImagePreview(null);
                                      // setFormData(prev => ({...prev, image: null}));
                                      // setErrors(prev => ({...prev, image: "Preview image failed to load."}))
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
                                  className={`cursor-pointer inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 transition-colors ${
                                    isUploadingImage
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  } ${errors.image ? "border-red-500" : ""}`}
                                  aria-disabled={isUploadingImage}
                                >
                                  {isUploadingImage ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Upload size={16} />
                                  )}
                                  {isUploadingImage
                                    ? "Uploading..."
                                    : // Check formData.image as well for existing image
                                    imagePreview || formData.image
                                    ? "Change Image"
                                    : "Upload Image"}
                                </Label>
                                <input
                                  id="image-upload"
                                  name="imageFile" // Name for the input itself
                                  type="file"
                                  className="sr-only" // Hide the default ugly input
                                  accept="image/jpeg, image/png, image/gif, image/svg+xml, image/webp" // Be specific
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
                                  Recommended: 16:9 ratio (e.g., 1200x675px).
                                  Max 2MB.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Step 2: Project Details */}
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
                              Defaults to &quot;Envato Elite Author&quot;, you
                              can change it.
                            </p>
                          </div>
                        </div>
                        {renderDependencies("frontend")}
                        {renderDependencies("backend")}
                      </div>
                    )}
                    {/* Step 3: Documentation */}
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
                        <div className="grid grid-cols-1 gap-6">
                          {Object.entries(docLabels).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {" "}
                                {/* Added flex-wrap */}
                                <div className="text-emerald-600 flex-shrink-0">
                                  {docIcons[key]}
                                </div>
                                <Label
                                  htmlFor={key}
                                  className="text-base font-medium"
                                >
                                  {label}
                                  {/* Optionally add * if validation requires content */}
                                  {/* {isRequired(key) && <span className="text-red-500">*</span>} */}
                                </Label>
                                {markdownSupport[key] && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded whitespace-nowrap">
                                      {" "}
                                      {/* Added whitespace-nowrap */}
                                      Markdown Supported
                                    </span>
                                    <MarkdownGuidePopover />
                                  </div>
                                )}
                              </div>
                              <Textarea
                                id={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                placeholder={`Enter content for ${label}...${
                                  markdownSupport[key]
                                    ? " Use Markdown for formatting (e.g., # H1, **bold**, `code`, ```block```)."
                                    : ""
                                }`}
                                className={`min-h-[150px] ${
                                  errors[key]
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }`} // Add error styling if needed
                                aria-invalid={!!errors[key]}
                                aria-describedby={
                                  errors[key]
                                    ? `${key}-error`
                                    : markdownSupport[key]
                                    ? `${key}-hint`
                                    : undefined
                                }
                                disabled={isSubmitting}
                              />
                              {markdownSupport[key] && (
                                <div>
                                  <p
                                    id={`${key}-hint`}
                                    className="text-xs text-muted-foreground mb-2"
                                  >
                                    {key === "installationContent" ||
                                    key === "frontendConfigContent" ||
                                    key === "backendConfigContent" ||
                                    key === "databaseSetupContent"
                                      ? "Use ```bash, ```javascript, ```html etc. for code blocks."
                                      : "Supports Markdown for rich text formatting."}
                                  </p>

                                  {/* Add the code helper component for markdown sections */}
                                  <MarkdownCodeHelper
                                    onInsert={(codeTemplate) =>
                                      handleInsertCodeTemplate(
                                        key,
                                        codeTemplate
                                      )
                                    }
                                    sectionType={key}
                                  />
                                </div>
                              )}
                              {errors[key] && (
                                <p
                                  id={`${key}-error`}
                                  className="text-sm text-red-600"
                                >
                                  {errors[key]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* FAQ Section */}
                        <div className="space-y-2 pt-6 border-t mt-8">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="text-emerald-600 flex-shrink-0">
                                {docIcons.faqEntries}
                              </div>
                              <Label className="text-base font-medium">
                                Frequently Asked Questions (FAQ)
                              </Label>
                              {/* Add * if at least one FAQ is required */}
                              {/* {isRequired("faq") && <span className="text-red-500">*</span>} */}
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
                              type="multiple" // Allow multiple items open
                              className="w-full border rounded-md px-0 mt-2 bg-white divide-y" // Removed px-2, handled by item padding
                            >
                              {formData.faqEntries.map((faq, index) => (
                                <AccordionItem
                                  value={`item-${faq.id}`}
                                  key={faq.id}
                                  className="border-b-0" // Handled by divide-y
                                >
                                  <AccordionTrigger className="hover:no-underline px-4 py-3 text-left w-full">
                                    <span className="font-medium truncate pr-2 flex-1">
                                      {" "}
                                      {/* Added flex-1 */}Q{index + 1}:{" "}
                                      {faq.question || "(Untitled Question)"}
                                    </span>
                                    {/* Indicate errors on the trigger */}
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
                                        Question{" "}
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
                                        className={`text-sm ${
                                          errors[`faq_q_${faq.id}`]
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                        }`}
                                        aria-invalid={
                                          !!errors[`faq_q_${faq.id}`]
                                        }
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
                                        Answer{" "}
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
                                        rows={3} // Reduced rows slightly
                                        className={`text-sm ${
                                          errors[`faq_a_${faq.id}`]
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                        }`}
                                        aria-invalid={
                                          !!errors[`faq_a_${faq.id}`]
                                        }
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
                        {/* End FAQ Section */}
                      </div>
                    )}
                  </div>{" "}
                  {/* End min-h div */}
                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center p-6 md:p-8 bg-slate-50 border-t mt-auto">
                    {" "}
                    {/* Added mt-auto */}
                    {/* Submit Error Area */}
                    <div className="mb-4 sm:mb-0">
                      {errors.submit && (
                        <p className="text-sm text-red-600 font-medium">
                          {errors.submit}
                        </p>
                      )}
                    </div>
                    {/* Button Group */}
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isSubmitting} // Disable Previous when submitting
                        >
                          Previous
                        </Button>
                      )}
                      {currentStep < 3 && (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          // Disable Next if image is uploading OR if submitting (though submitting shouldn't happen here)
                          disabled={isUploadingImage || isSubmitting}
                          aria-label="Next Step"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Please wait... {/* Indicate waiting for upload */}
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
                          // Disable Submit if actively submitting OR if image is still uploading
                          disabled={isSubmitting || isUploadingImage}
                          aria-label={
                            isSubmitting
                              ? "Updating project..."
                              : "Save Changes"
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
                              Uploading Image... {/* More specific message */}
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>{" "}
                  {/* End Navigation Buttons Div */}
                </CardContent>
              </Card>
            </form>
            {/* Helpful Tips */}
            <div className="max-w-5xl mx-auto mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Info size={16} className="text-blue-700" />
                  Markdown Code Tips
                </h3>
                <ul className="text-sm text-blue-700 space-y-1.5 ml-5 list-disc marker:text-blue-400">
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">\`\`\`bash</code>{" "}
                    for terminal commands and shell scripts
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      \`\`\`javascript
                    </code>{" "}
                    for JavaScript code
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      \`\`\`typescript
                    </code>{" "}
                    for TypeScript code
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">\`\`\`html</code>{" "}
                    for HTML markup
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">\`\`\`css</code>{" "}
                    for CSS styles
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">\`\`\`json</code>{" "}
                    for JSON configuration files
                  </li>
                  <li>
                    Use{" "}
                    <code className="bg-blue-100 px-1 rounded">\`\`\`sql</code>{" "}
                    for database queries
                  </li>
                  <li>
                    Click the &quot;Insert Code Block&quot; helper below each
                    markdown-enabled section to quickly add formatted code
                  </li>
                </ul>
              </div>
            </div>
            {/* End Helpful Tips Div */}
          </div>
          {/* End Container Div */}
        </div>
      </div>
      {/* End Background Div */}
    </DashboardLayout>
  );
}
