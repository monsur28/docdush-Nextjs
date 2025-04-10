"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import {
  Star,
  Clock,
  Download,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to extract and format tags from dependencies
const getTechTags = (project) => {
  const feDeps =
    project?.packageRequirements?.frontend?.map((dep) => dep.name) ?? [];
  const beDeps =
    project?.packageRequirements?.backend?.map((dep) => dep.name) ?? [];
  const allDeps = [...feDeps, ...beDeps];

  // Clean up names
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
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Fetch Data
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/projects");
        const fetchedProjects = response.data || [];
        if (!Array.isArray(fetchedProjects)) {
          throw new Error("Unexpected data format received from API.");
        }
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load project data.";
        setError(errorMsg);
        toast.error("Failed to load projects", { description: errorMsg });
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let result = [...projects];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (project) =>
          project.title?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          getTechTags(project).some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (project) =>
          project.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort projects
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
        case "oldest":
          return new Date(a.lastUpdated || 0) - new Date(b.lastUpdated || 0);
        case "popular":
          return (b.downloads || 0) - (a.downloads || 0);
        case "rating":
          return (b.stars || 0) - (a.stars || 0);
        default:
          return 0;
      }
    });

    setFilteredProjects(result);
  }, [projects, searchQuery, selectedCategory, sortBy]);

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(projects.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-cyan-900 to-cyan-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Documentation Projects
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Browse comprehensive guides for setting up, configuring, and
                customizing various projects.
              </p>
              <div className="relative max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search projects by name, description, or technology..."
                  className="pl-10 py-6 text-gray-900  rounded-full shadow-lg border-1 focus:ring-2 focus:ring-cyan-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mb-4" />
              <p className="text-lg text-gray-600">Loading Projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-red-700 mb-2">
                Failed to Load Projects
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Content When Loaded */}
          {!isLoading && !error && (
            <>
              {/* Filters */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {filteredProjects.length}{" "}
                      {filteredProjects.length === 1 ? "Project" : "Projects"}
                    </h2>
                    {searchQuery && (
                      <Badge className="ml-3 bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge className="ml-2 bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                        Category: {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>

                    <div
                      className={`flex flex-col md:flex-row gap-2 w-full md:w-auto ${
                        showFilters ? "block" : "hidden md:flex"
                      }`}
                    >
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All Categories" : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="popular">
                            Most Downloads
                          </SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    We couldn&apos;t find any projects matching your current
                    filters. Try adjusting your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSortBy("newest");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredProjects.map((project) => {
                    const techTags = getTechTags(project);
                    const tagsToShow = techTags.slice(0, 3);
                    const totalTags = techTags.length;

                    return (
                      <Link
                        key={project._id || project.id}
                        href={`/project/${project._id || project.id}`}
                        className="group block"
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-cyan-300 transform hover:-translate-y-1">
                          <div className="relative overflow-hidden h-52">
                            <Image
                              src={
                                project.image ||
                                "/placeholder.svg?height=400&width=600" ||
                                "/placeholder.svg"
                              }
                              fill
                              alt={project.title || "Project Image"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-3 right-3 z-20">
                              <Badge className="bg-black/70 text-white backdrop-blur-sm hover:bg-black/80">
                                {project.category || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-5 md:p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors duration-200">
                              {project.title || "Untitled Project"}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                              {project.description ||
                                "No description available."}
                            </p>

                            {/* Tags Display */}
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
                              {totalTags === 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs italic text-gray-400 px-2 py-0.5"
                                >
                                  No tech specified
                                </Badge>
                              )}
                            </div>

                            {/* Project Metadata */}
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
                          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
