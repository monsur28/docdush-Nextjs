// Assuming path is src/app/projects/page.jsx or similar
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowRight,
  Star,
  Clock,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar"; // Adjust path
import Footer from "@/components/footer"; // Adjust path
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// *** ADDED Helper function to extract and format tags from dependencies ***
const getTechTags = (project) => {
  const feDeps =
    project?.packageRequirements?.frontend?.map((dep) => dep.name) ?? [];
  const beDeps =
    project?.packageRequirements?.backend?.map((dep) => dep.name) ?? [];
  const allDeps = [...feDeps, ...beDeps];

  // Optional: Clean up names (customize as needed)
  const cleanedTags = allDeps.map((tag) => {
    if (tag.toLowerCase().includes("react")) return "React";
    if (tag.toLowerCase().includes("next")) return "Next.js";
    if (tag.toLowerCase().includes("vue")) return "Vue";
    if (tag.toLowerCase().includes("angular")) return "Angular";
    if (tag.toLowerCase().includes("laravel")) return "Laravel";
    if (tag.toLowerCase().includes("node")) return "Node.js";
    if (tag.toLowerCase().includes("express")) return "Express";
    if (tag.toLowerCase().includes("python")) return "Python";
    if (tag.toLowerCase().includes("django")) return "Django";
    if (tag.toLowerCase().includes("php")) return "PHP";
    if (tag.toLowerCase().includes("firebase")) return "Firebase";
    if (tag.toLowerCase().includes("mongo")) return "MongoDB";
    if (tag.toLowerCase().includes("sql")) return "SQL";
    if (tag.toLowerCase().includes("tailwind")) return "TailwindCSS";
    if (tag.toLowerCase().includes("stripe")) return "Stripe";
    // Remove scope like @stripe/stripe-js -> stripe-js
    return tag.startsWith("@") ? tag.split("/")[1] || tag : tag;
  });

  // Remove duplicates after cleaning
  const uniqueTags = [...new Set(cleanedTags)];
  return uniqueTags;
};

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Added router if needed later

  // --- Fetch Data (Unchanged) ---
  useEffect(() => {
    const fetchProjects = async () => {
      /* ... existing fetch logic ... */
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/projects");
        const fetchedProjects = response.data || [];
        if (!Array.isArray(fetchedProjects)) {
          throw new Error("Unexpected data format received from API.");
        }
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load project data.";
        setError(errorMsg);
        toast.error("Failed to load projects", { description: errorMsg });
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            All Documentation Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse comprehensive guides for setting up, configuring, and
            customizing various projects.
          </p>
        </div>

        {/* --- Loading State --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-600 mb-4" />
            <p className="text-lg text-gray-600">Loading Projects...</p>
          </div>
        )}
        {/* --- Error State --- */}
        {error && !isLoading && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-red-700 mb-2">
              Failed to Load Projects
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* --- Content When Loaded --- */}
        {!isLoading && !error && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No projects found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => {
                  // *** Get tags for this specific project card using the helper ***
                  const techTags = getTechTags(project);
                  const tagsToShow = techTags.slice(0, 3); // Show first 3 on cards
                  const totalTags = techTags.length;
                  // *** End tag processing ***

                  return (
                    <Link
                      key={project._id || project.id}
                      href={`/project/${project._id || project.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-300">
                        <div className="relative overflow-hidden h-52">
                          <Image
                            src={
                              project.image ||
                              "/placeholder.svg?height=400&width=600"
                            }
                            fill
                            alt={project.title || "Project Image"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute top-3 right-3 z-20">
                            <Badge
                              variant="secondary"
                              className="bg-black/60 text-white backdrop-blur-sm"
                            >
                              {project.category || "N/A"}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-5 md:p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#82b440] transition-colors duration-200">
                            {project.title || "Untitled Project"}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                            {project.description || "No description available."}
                          </p>

                          {/* --- *** UPDATED TAGS DISPLAY using techTags *** --- */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {tagsToShow.map((tag, index) => (
                              <Badge
                                key={`${project._id}-tag-${index}`}
                                variant="outline"
                                className="text-xs bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {totalTags > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5"
                              >
                                +{totalTags - 3} more
                              </Badge>
                            )}
                            {totalTags === 0 && ( // Handle case with no dependencies listed
                              <Badge
                                variant="outline"
                                className="text-xs italic text-gray-400 px-2 py-0.5"
                              >
                                No tech specified
                              </Badge>
                            )}
                          </div>
                          {/* --- *** END UPDATED TAGS DISPLAY *** --- */}

                          <div className="flex flex-wrap justify-between items-center mt-auto pt-3 border-t border-gray-100 gap-x-4 gap-y-1 text-xs text-gray-500">
                            <div
                              className="flex items-center gap-1"
                              title="Downloads"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>
                                {project.downloads
                                  ? project.downloads.toLocaleString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1"
                              title="Rating"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                              <span>
                                {project.stars
                                  ? project.stars.toFixed(1)
                                  : "N/A"}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1"
                              title="Last Updated"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {project.lastUpdated
                                  ? new Date(
                                      project.lastUpdated
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
