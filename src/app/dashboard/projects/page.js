// Example path: src/app/dashboard/projects/page.jsx (Adapt path as needed)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Edit2, Eye, Trash2, Loader2, Plus, Star, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // --- Functions (fetchProjects, toggleProjectFeatured, openDeleteDialog, executeDelete, getStatusBadge) ---
  // Keep these functions exactly as they were in the previous correct version
  const fetchProjects = async () => {
    /* ... */
    try {
      setIsLoading(true);
      const response = await axios.get("/api/projects");
      const projectsWithFeatured = response.data.map((project) => ({
        ...project,
        featured: project.featured !== undefined ? project.featured : false,
      }));
      setProjects(projectsWithFeatured);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects", {
        description: error.message || "Please check the API connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleProjectFeatured = async (id, currentFeaturedState) => {
    setTogglingId(id);
    const newFeaturedState = !currentFeaturedState;

    // If a project is being marked as featured, unfeature the others
    if (newFeaturedState) {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === id
            ? { ...project, featured: true }
            : { ...project, featured: false }
        )
      );
    } else {
      setProjects(
        projects.map((project) =>
          project._id === id
            ? { ...project, featured: newFeaturedState }
            : project
        )
      );
    }

    try {
      await axios.patch(`/api/projects/${id}`, { featured: newFeaturedState });
      if (newFeaturedState) {
        toast.success("Project featured", {
          description: "The project has been marked as featured.",
        });
      } else {
        toast.info("Project unfeatured", {
          description: "The project is no longer featured.",
        });
      }
    } catch (error) {
      console.error("Error toggling project featured state:", error);
      setProjects(
        projects.map((project) =>
          project._id === id
            ? { ...project, featured: currentFeaturedState }
            : project
        )
      );
      toast.error("Failed to update project status", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteDialog = (project) => {
    /* ... */ setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const executeDelete = async () => {
    /* ... */ if (!projectToDelete) return;
    const { _id, title } = projectToDelete;
    setDeletingId(_id);
    try {
      const response = await axios.delete(`/api/projects/${_id}`);
      if (response.status === 200 && response.data?.success) {
        setProjects((currentProjects) =>
          currentProjects.filter((p) => p._id !== _id)
        );
        toast.success(`Project "${title}" deleted successfully`);
        setShowDeleteDialog(false);
        setProjectToDelete(null);
      } else {
        throw new Error(
          response.data?.message || "API Error: Failed to delete project"
        );
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      const apiErrorMessage = error.response?.data?.message || error.message;
      toast.error(`Failed to delete project: ${apiErrorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    /* ... */ switch (status) {
      case "In Progress":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
            Completed
          </Badge>
        );
      case "Published":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
            Published
          </Badge>
        );
      case "Draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-500"></span>
            Draft
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
            {status || "Pending"}
          </Badge>
        );
    }
  };
  // --- End Functions ---

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-6 px-4">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Manage Projects
            </h1>
            <Link href="/dashboard/projects/create">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all">
                <Plus className="mr-2 h-4 w-4" /> Create New Project
              </Button>
            </Link>
          </div>

          {/* Table Card */}
          <Card className="overflow-hidden border-none shadow-lg">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-cyan-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-cyan-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">
                    No projects yet
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Get started by creating your first project
                  </p>
                  <Link href="/dashboard/projects/create" className="mt-4">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    >
                      Create Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* --- THEAD: Ensure no stray whitespace/comments --- */}
                    <thead /* No comments or text here */>
                      <tr
                        className="bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white" /* No comments or text here */
                      >
                        <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                          #
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                          Project
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider hidden md:table-cell">
                          Desc.
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-medium uppercase tracking-wider">
                          Featured
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    {/* --- TBODY: Ensure no stray whitespace/comments directly inside tbody or tr --- */}
                    <tbody
                      className="divide-y divide-gray-200 bg-white" /* No comments or text here */
                    >
                      {projects.map((project, index) => (
                        // No comments or text between the map and the tr
                        <tr
                          key={project._id}
                          className={`hover:bg-gray-50 transition-colors group ${
                            !project.featured ? "opacity-75" : ""
                          }`}
                          /* No comments or text here */
                        >
                          {/* Ensure no comments/text between td elements */}
                          <td className="py-3 px-6 whitespace-nowrap">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-xs ${
                                project.featured
                                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md"
                                  : "bg-gradient-to-br from-gray-400 to-gray-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-200 border">
                                <Image
                                  src={project.image || "/placeholder.svg"}
                                  alt={project.title}
                                  width={40}
                                  height={40}
                                  className="object-cover h-full w-full"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {project.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {project.category || "Uncategorized"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Created:
                                  {new Date(
                                    project.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6 hidden md:table-cell">
                            <div className="text-sm text-gray-700 max-w-xs">
                              {project.description.length > 60
                                ? `${project.description.slice(0, 60)}...`
                                : project.description}
                            </div>
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap">
                            {getStatusBadge(project.status)}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={project.featured}
                                onCheckedChange={() =>
                                  toggleProjectFeatured(
                                    project._id,
                                    project.featured
                                  )
                                }
                                disabled={togglingId === project._id}
                                className="data-[state=checked]:bg-cyan-600"
                                id={`featured-switch-${project._id}`}
                                aria-labelledby={`featured-label-${project._id}`}
                              />
                              <Label
                                htmlFor={`featured-switch-${project._id}`}
                                id={`featured-label-${project._id}`}
                                className="sr-only"
                              >
                                {project.featured ? "Featured" : "Not Featured"}
                              </Label>
                              {togglingId === project._id && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin text-cyan-500" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Link
                                href={`/dashboard/projects/edit/${project._id}`}
                                passHref
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 h-8 w-8"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600 hover:text-rose-800 hover:bg-rose-100 h-8 w-8"
                                title="Delete"
                                onClick={() => openDeleteDialog(project)}
                                disabled={deletingId === project._id}
                              >
                                {deletingId === project._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                          {/* No comments or text here */}
                        </tr>
                        // No comments or text here
                      ))}
                    </tbody>
                    {/* No comments or text here */}
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- ALERT DIALOG FOR DELETE CONFIRMATION --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project titled &quot;<strong>{projectToDelete?.title}</strong>
              &quot;. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setProjectToDelete(null)}
              disabled={deletingId === projectToDelete?._id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingId === projectToDelete?._id}
            >
              {deletingId === projectToDelete?._id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* --- END ALERT DIALOG --- */}
    </DashboardLayout>
  );
}
