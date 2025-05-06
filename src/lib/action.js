"use server";

import { revalidatePath } from "next/cache";
import axiosSecure from "./axiosSecure";

export async function createProject(formData) {
  try {
    // Format the data to match your API expectations
    const projectData = {
      title: formData.name,
      description: formData.description,
      category: formData.category,
      image: formData.imageUrl,
      version: "1.0.0",
      author: "Envato Elite Author",
      demoUrl: formData.liveUrl || null,
      packageRequirements: {
        frontend: [],
        backend: [],
      },
      documentationSections: [
        {
          id: "introduction",
          title: "Introduction",
          icon: "FileText",
          content: formData.introContent,
          supportsMarkdown: true,
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
      faqs: [],
      status: "Published",
    };

    // Make API request to create project
    const response = await axiosSecure.post("/api/projects", projectData);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create project");
    }

    // Revalidate the projects page to show the new project
    revalidatePath("/dashboard/projects");

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create project"
    );
  }
}
