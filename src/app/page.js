"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowRight,
  Star,
  Clock,
  Download,
  Users,
  Code,
  Package,
  Loader2,
  AlertCircle,
  Search,
  BookOpen,
  Zap,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar"; // Adjust path if needed
import Footer from "@/components/footer"; // Adjust path if needed
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
import { cn } from "@/lib/utils";

// Helper function to extract and format tags from dependencies
const getTechTags = (project) => {
  // Safely access nested properties with optional chaining and provide default empty arrays
  const feDeps =
    project?.packageRequirements?.frontend?.map((dep) => dep.name) ?? [];
  const beDeps =
    project?.packageRequirements?.backend?.map((dep) => dep.name) ?? [];
  const allDeps = [...feDeps, ...beDeps];

  // Optional: Clean up names (customize this based on common packages)
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

export default function HomePage() {
  const [allProjects, setAllProjects] = useState([]);
  const [featuredProject, setFeaturedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // --- Fetch Data ---
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
        let foundFeatured = fetchedProjects.find((p) => p.featured === true);
        if (!foundFeatured && fetchedProjects.length > 0) {
          console.warn(
            "No featured project found, using the first project as fallback for hero section."
          );
          foundFeatured = fetchedProjects[0];
        }
        setAllProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
        setFeaturedProject(foundFeatured);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load project data."
        );
        toast.error("Failed to load projects", {
          description: err.message || "Please check API connection.",
        });
        setAllProjects([]);
        setFilteredProjects([]);
        setFeaturedProject(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects based on search term and category
  useEffect(() => {
    let results = [...allProjects];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (project) =>
          project.title?.toLowerCase().includes(term) ||
          project.description?.toLowerCase().includes(term) ||
          getTechTags(project).some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      results = results.filter(
        (project) =>
          project.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filter by tab
    if (activeTab === "featured") {
      results = results.filter((project) => project.featured === true);
    } else if (activeTab === "recent") {
      // Sort by lastUpdated date (most recent first)
      results = [...results]
        .sort((a, b) => {
          const dateA = new Date(a.lastUpdated || 0);
          const dateB = new Date(b.lastUpdated || 0);
          return dateB - dateA;
        })
        .slice(0, 6); // Get only the 6 most recent
    }

    setFilteredProjects(results);
  }, [allProjects, searchTerm, categoryFilter, activeTab]);

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...new Set(allProjects.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* --- Loading State --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-600 animate-ping opacity-20"></div>
            </div>
            <p className="text-lg text-gray-600 mt-6">Loading Projects...</p>
          </div>
        )}

        {/* --- Error State --- */}
        {error && !isLoading && (
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-red-700 mb-2">
              Failed to Load Projects
            </h2>
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* --- Content When Loaded --- */}
        {!isLoading && !error && (
          <>
            {/* --- Hero Section --- */}
            {featuredProject && (
              <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f7ff] to-white py-16 lg:py-24">
                {/* Decorative background elements */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-[#eef8e3] rounded-bl-[100px] opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#f5f9ff] rounded-tr-[80px]"></div>
                  <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-[#82b440]/10"></div>
                  <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-cyan-500/10"></div>

                  {/* Animated elements */}
                  <div
                    className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-[#82b440]/5 animate-pulse"
                    style={{ animationDuration: "4s" }}
                  ></div>
                  <div
                    className="absolute bottom-1/3 right-1/3 w-20 h-20 rounded-full bg-cyan-500/5 animate-pulse"
                    style={{ animationDuration: "6s" }}
                  ></div>

                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage:
                        "radial-gradient(#000 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    <div className="lg:w-1/2 text-center lg:text-left">
                      {featuredProject.featured && (
                        <div className="inline-flex items-center px-3 py-1 bg-[#82b440]/10 text-[#82b440] rounded-full text-sm font-medium mb-4">
                          <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
                          Featured Documentation
                        </div>
                      )}
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#82b440] to-cyan-600">
                          {featuredProject.title}
                        </span>
                      </h1>
                      <p className="text-xl text-gray-600 mb-8 max-w-xl lg:mx-0 mx-auto">
                        {featuredProject.description}
                      </p>

                      <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                        {getTechTags(featuredProject)
                          .slice(0, 5)
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors px-3 py-1 text-sm shadow-sm"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>

                      <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 lg:mb-0">
                        <Link
                          href={`/project/${featuredProject._id}`}
                          className="inline-flex items-center px-6 py-3 bg-[#82b440] hover:bg-[#73a139] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                        >
                          View Documentation
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    <div className="lg:w-1/2 mt-8 lg:mt-0">
                      <div className="relative">
                        {/* Glow effects */}
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#82b440] rounded-full opacity-70 blur-xl"></div>
                        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-cyan-500 rounded-full opacity-60 blur-xl"></div>

                        {/* Browser mockup with enhanced styling */}
                        <div className="relative rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] border border-gray-200/50 bg-white transform hover:scale-[1.01] transition-all duration-300">
                          {/* Browser header */}
                          <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 h-10 flex items-center px-4">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                              <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="mx-auto flex items-center bg-white/80 rounded-full px-3 py-1 text-xs text-gray-500 w-2/3">
                              <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                            </div>
                          </div>

                          {/* Image container with better styling */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#82b440]/5 to-cyan-500/5 mix-blend-overlay"></div>
                            <Image
                              src={
                                featuredProject.image ||
                                "/placeholder.svg?height=600&width=800"
                              }
                              width={1200}
                              height={675}
                              alt={featuredProject.title}
                              className="w-full object-contain object-center h-[300px] sm:h-[350px] lg:h-[400px]"
                              priority
                              style={{ objectFit: "contain" }}
                            />

                            {/* Subtle overlay for better text contrast if needed */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
                          </div>
                        </div>

                        {/* Floating elements */}
                        <div
                          className="absolute -right-4 top-1/4 bg-white p-3 rounded-lg shadow-lg rotate-3 animate-pulse"
                          style={{ animationDuration: "3s" }}
                        >
                          <Code className="h-5 w-5 text-[#82b440]" />
                        </div>
                        <div
                          className="absolute -left-4 bottom-1/4 bg-white p-3 rounded-lg shadow-lg -rotate-3 animate-pulse"
                          style={{ animationDuration: "4s" }}
                        >
                          <BookOpen className="h-5 w-5 text-cyan-500" />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-center mt-8 space-x-6">
                        <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                            <Star className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {featuredProject.stars || "4.8"}
                            </p>
                            <p className="text-xs text-gray-500">Rating</p>
                          </div>
                        </div>

                        <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <Download className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {featuredProject.downloads?.toLocaleString() ||
                                "50,000"}
                            </p>
                            <p className="text-xs text-gray-500">Downloads</p>
                          </div>
                        </div>

                        <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              24+
                            </p>
                            <p className="text-xs text-gray-500">
                              Contributors
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* --- Search and Filter Section --- */}
            <section className="py-8 border-b">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search projects..."
                      className="pl-10 pr-4 py-2 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-initial">
                      <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All Categories" : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 md:flex-initial">
                      <div className="flex rounded-md border overflow-hidden">
                        {["all", "featured", "recent"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                              "px-3 py-2 text-sm font-medium flex-1 whitespace-nowrap",
                              activeTab === tab
                                ? "bg-[#82b440] text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            {tab === "all"
                              ? "All"
                              : tab === "featured"
                              ? "Featured"
                              : "Recent"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Projects List Section --- */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Documentation Projects
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Browse detailed guides for setting up, configuring, and
                    customizing various projects.
                  </p>
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No matching projects found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your search or filter criteria to find what
                      you&apos;re looking for.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                        setActiveTab("all");
                      }}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {filteredProjects.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, index) => {
                      // Get tags for this specific project card
                      const techTags = getTechTags(project);
                      const tagsToShow = techTags.slice(0, 3); // Show first 3 on cards
                      const totalTags = techTags.length;

                      // Calculate animation delay based on index
                      const animationDelay = `${(index % 3) * 100}ms`;

                      return (
                        <Link
                          key={project._id}
                          href={`/project/${project._id}`}
                          className="group block"
                          style={{
                            animationDelay,
                            animation: "fadeInUp 0.5s ease-out forwards",
                            opacity: 0,
                            transform: "translateY(20px)",
                          }}
                        >
                          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border hover:border-[#82b440] hover:translate-y-[-4px]">
                            <div className="relative overflow-hidden h-52">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity z-10"></div>
                              <Image
                                src={
                                  project.image ||
                                  "/placeholder.svg?height=400&width=600" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                fill
                                alt={project.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute top-3 right-3 z-20">
                                <Badge
                                  variant="secondary"
                                  className="bg-black/60 text-white backdrop-blur-sm"
                                >
                                  {project.category}
                                </Badge>
                              </div>
                              {project.featured && (
                                <div className="absolute top-3 left-3 z-20">
                                  <Badge className="bg-[#82b440] text-white">
                                    <Star className="h-3 w-3 mr-1 fill-white" />
                                    Featured
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#82b440] transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                                {project.description}
                              </p>

                              {/* Tags Display */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {tagsToShow.map((tag, index) => (
                                  <Badge
                                    key={`${project._id}-tag-${index}`}
                                    variant="outline"
                                    className="text-xs bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5 hover:bg-gray-200 transition-colors"
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
                                    className="text-xs italic text-gray-400"
                                  >
                                    No tech specified
                                  </Badge>
                                )}
                              </div>

                              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-500 mt-auto">
                                <div
                                  className="flex items-center gap-1"
                                  title="Downloads"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>
                                    {project.downloads
                                      ? project.downloads.toLocaleString()
                                      : "50,000"}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1"
                                  title="Rating"
                                >
                                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                  <span>{project.stars || "4.8"}</span>
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
                                        ).toLocaleDateString()
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
              </div>
            </section>

            {/* --- Features Section --- */}
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
              <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Comprehensive Documentation
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our documentation covers everything you need to get your
                    project up and running quickly.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-transparent hover:border-[#82b440]/30">
                    <div className="w-14 h-14 bg-[#82b440]/20 rounded-lg flex items-center justify-center mb-4 mx-auto transform transition-transform group-hover:scale-110">
                      <Package className="h-7 w-7 text-[#82b440]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      Installation Guides
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Step-by-step setup for both frontend and backend
                      components.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-transparent hover:border-cyan-300">
                    <div className="w-14 h-14 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Code className="h-7 w-7 text-cyan-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      API Documentation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Detailed API references with endpoints, parameters, and
                      responses.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-transparent hover:border-purple-300">
                    <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Users className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      Developer Resources
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Code snippets, troubleshooting guides, and best practices.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-transparent hover:border-amber-300">
                    <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Zap className="h-7 w-7 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      Quick Start Templates
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Ready-to-use templates and boilerplates to jumpstart your
                      development.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Call to Action --- */}
            <section className="py-16 ">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-6">
                    Ready to Build Something Amazing?
                  </h2>
                  <p className="text-gray-800 mb-8 text-lg">
                    Explore our comprehensive documentation and start building
                    your next project with confidence.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/projects">
                      <Button className="bg-[#82b440] hover:bg-[#73a139] text-white px-8 py-6 h-auto text-lg">
                        Browse All Projects
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button className="bg-white hover:bg-[#73a139] border border-gray-500 text-black px-8 py-6 h-auto text-lg">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
