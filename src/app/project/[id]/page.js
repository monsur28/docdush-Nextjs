"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Box,
  Server,
  Database,
  Settings,
  AlertCircle,
  Monitor,
  ExternalLink,
  Lock,
  CheckCircle2,
  Coffee,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar"; // Adjust path if needed
import Footer from "@/components/Footer"; // Adjust path if needed
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// HTML Sanitization function to prevent XSS
const sanitizeHtml = (html) => {
  // In a production environment, you should use a proper HTML sanitizer like DOMPurify
  // This is a very basic implementation for demonstration purposes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "");
};

// --- Icon Mapping ---
const iconMap = {
  FileText: <FileText className="h-5 w-5 text-gray-600" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  Box: <Box className="h-5 w-5 text-blue-600" />,
  Monitor: <Monitor className="h-5 w-5 text-indigo-600" />,
  Server: <Server className="h-5 w-5 text-purple-600" />,
  Database: <Database className="h-5 w-5 text-pink-600" />,
  Lock: <Lock className="h-5 w-5 text-red-600" />,
  Settings: <Settings className="h-5 w-5 text-gray-600" />,
  AlertCircle: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  Coffee: <Coffee className="h-5 w-5 text-orange-600" />,
  Default: <FileText className="h-5 w-5 text-gray-600" />,
};

const getIcon = (iconName) => {
  return iconMap[iconName] || iconMap.Default;
};

const calculateReadingTime = (sections = []) => {
  const wordsPerMinute = 200;
  const totalWords = sections.reduce((acc, section) => {
    const contentString =
      typeof section.content === "string" ? section.content : "";
    const textOnly = contentString
      .replace(/<[^>]*>/g, " ")
      .replace(/[`*#~[\]()]/g, "");
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    return acc + wordCount;
  }, 0);
  return Math.ceil(totalWords / wordsPerMinute);
};

// --- Custom Renderers for Markdown ---
const markdownComponents = {
  a: ({ node, ...props }) => (
    <a
      className="text-blue-600 hover:text-blue-800 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).trim();

    if (!inline && match) {
      return (
        <SyntaxHighlighter
          style={coldarkDark}
          language={match[1]}
          PreTag="pre"
          className="!p-4 !rounded-md text-sm scrollbar"
          showLineNumbers={false}
          wrapLines={false}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      );
    } else if (!inline) {
      return (
        <pre
          className="bg-muted p-4 rounded-md text-sm overflow-x-auto scrollbar text-muted-foreground"
          {...props}
        >
          <code>{children}</code>
        </pre>
      );
    } else {
      return (
        <code
          className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono relative -top-px"
          {...props}
        >
          {children}
        </code>
      );
    }
  },
  img({ node, ...props }) {
    return (
      <div className="my-6">
        <Image
          className="rounded-md max-w-full h-auto"
          {...props}
          loading="lazy"
          alt={props.alt || "Documentation image"}
        />
        {props.alt && (
          <p className="text-sm text-center text-gray-500 mt-2">{props.alt}</p>
        )}
      </div>
    );
  },
  p({ node, children, ...props }) {
    // Check if paragraph contains a YouTube embed marker
    const childrenArray = React.Children.toArray(children);
    const youtubeMatch =
      typeof childrenArray[0] === "string" &&
      childrenArray[0].match(/\[youtube:([a-zA-Z0-9_-]{11})\]/);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div className="my-6">
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-md">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute top-0 left-0 w-full h-full"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return <p {...props}>{children}</p>;
  },
};
// --- End Custom Renderers ---

export default function ProjectPage({ params }) {
  // --- Use React.use() to resolve params as required by the warning ---
  const resolvedParams = use(params);
  const { id: projectId } = resolvedParams;
  // --- End params change ---

  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);

  // --- Fetch Data useEffect ---
  useEffect(() => {
    // No need to check for projectId existence here, as 'use(params)'
    // should handle the resolution or throw if it's fundamentally unavailable.
    // If resolvedParams is available, projectId should be derived or undefined.

    const fetchProject = async () => {
      // Check if projectId was actually resolved before fetching
      if (!projectId) {
        console.warn("Project ID could not be resolved from params.");
        setError("Project ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        if (!response.data) {
          throw new Error("Project not found (empty response data).");
        }

        const sections = response.data.documentationSections;
        if (sections && !Array.isArray(sections)) {
          console.warn(
            "API returned non-array for documentationSections, setting to empty array."
          );
          response.data.documentationSections = [];
        } else if (!sections) {
          response.data.documentationSections = [];
        }

        setProjectData(response.data);
        setReadingTime(
          calculateReadingTime(response.data.documentationSections)
        );
      } catch (err) {
        console.error("Error fetching project:", err);
        let errorMsg = "Could not load project data.";
        if (axios.isAxiosError(err)) {
          errorMsg =
            err.response?.data?.message ||
            err.response?.statusText ||
            err.message;
          if (err.response?.status === 404) {
            errorMsg = "Project not found.";
          }
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        toast.error("Failed to load project", { description: errorMsg });
        setProjectData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run fetch if projectId is available after resolving params
    if (projectId) {
      fetchProject();
    } else {
      // Handle case where projectId is still not available after use(params)
      // This might indicate an issue upstream or invalid route
      setError("Project ID could not be determined.");
      setIsLoading(false);
    }
  }, [projectId]); // Keep projectId dependency, as it's derived from the resolved params

  // --- Loading State ---
  if (isLoading) {
    // ... (Loading state JSX remains the same)
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
          <span className="ml-4 text-lg text-gray-600">Loading Project...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Error State ---
  if (error && !projectData) {
    // ... (Error state JSX remains the same)
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-red-700 mb-2">
            Error Loading Project
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Not Found State ---
  if (!isLoading && !projectData) {
    // ... (Not Found state JSX remains the same, potentially adjusted based on error message)
    const isNotFoundError =
      typeof error === "string" && error.toLowerCase().includes("not found");
    if (isNotFoundError && error) {
      return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow container mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-red-700 mb-2">
              Project Not Found
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
          <Footer />
        </div>
      );
    }
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you are looking for does not exist or could not be
            loaded.
          </p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Main Content --- (Render only if projectData exists)
  const documentationSections = projectData.documentationSections || [];
  const frontendDeps = projectData.packageRequirements?.frontend || [];
  const backendDeps = projectData.packageRequirements?.backend || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      {/* Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#82b440] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to all projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10 border border-gray-200">
          {/* ... Header content remains the same ... */}
          <div className="relative">
            <div className="aspect-[16/6] bg-gradient-to-r from-[#0b1622] to-[#1c2a3a] relative">
              {projectData.image && (
                <Image
                  src={projectData.image || "/placeholder.svg"}
                  alt={projectData.title || "Project Image"}
                  fill
                  className="object-cover mix-blend-overlay opacity-40"
                  priority
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-md">
                    {projectData.title || "Project Title"}
                  </h1>
                  <p className="max-w-3xl text-gray-200 mx-auto text-base md:text-lg drop-shadow-sm">
                    {projectData.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              {projectData.demoUrl && (
                <a
                  href={projectData.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium inline-flex items-center hover:bg-white/30 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Live Demo
                </a>
              )}
            </div>
          </div>
          <div className="p-5 md:p-6 border-t border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start items-center text-sm">
              <div>
                <span className="text-gray-500 mr-1.5">Version:</span>
                <strong className="font-medium text-gray-800">
                  {projectData.version || "N/A"}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 mr-1.5">Updated:</span>
                <strong className="font-medium text-gray-800">
                  {projectData.lastUpdated
                    ? new Date(projectData.lastUpdated).toLocaleDateString()
                    : "N/A"}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 mr-1.5">Author:</span>
                <strong className="font-medium text-gray-800">
                  {projectData.author || "N/A"}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 mr-1.5">Category:</span>
                <strong className="font-medium text-gray-800">
                  {projectData.category || "N/A"}
                </strong>
              </div>
              {readingTime > 0 && (
                <div>
                  <span className="text-gray-500 mr-1.5">Read Time:</span>
                  <strong className="font-medium text-gray-800">
                    ~{readingTime} min
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            {/* ... Sidebar content remains the same ... */}
            <div className="bg-white rounded-lg shadow-md p-5 lg:sticky lg:top-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Documentation Sections
              </h3>
              <nav>
                {documentationSections.length > 0 ? (
                  <ul className="space-y-1">
                    {documentationSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#82b440] transition-colors group"
                        >
                          <span className="mr-3 opacity-80 group-hover:opacity-100">
                            {getIcon(section.icon)}
                          </span>
                          <span className="font-medium">
                            {section.title || "Untitled Section"}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No sections available.
                  </p>
                )}
              </nav>
              {(frontendDeps.length > 0 || backendDeps.length > 0) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                    Package Requirements
                  </h3>
                  <div className="space-y-5">
                    {frontendDeps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center mb-2 text-gray-700">
                          <Monitor className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                          Frontend
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs border-l-2 border-blue-100 pl-3 scrollbar">
                          {frontendDeps.map((pkg, idx) => (
                            <div
                              key={`fe-${pkg.name || idx}`}
                              className="flex justify-between items-center py-1"
                            >
                              <span
                                className="text-gray-600 truncate mr-2"
                                title={pkg.name}
                              >
                                {pkg.name || "N/A"}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-blue-700 bg-blue-50 font-mono text-xs"
                              >
                                {pkg.version || "N/A"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {backendDeps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center mb-2 text-gray-700">
                          <Server className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                          Backend
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs border-l-2 border-purple-100 pl-3 scrollbar">
                          {backendDeps.map((pkg, idx) => (
                            <div
                              key={`be-${pkg.name || idx}`}
                              className="flex justify-between items-center py-1"
                            >
                              <span
                                className="text-gray-600 truncate mr-2"
                                title={pkg.name}
                              >
                                {pkg.name || "N/A"}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-purple-700 bg-purple-50 font-mono text-xs"
                              >
                                {pkg.version || "N/A"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* ... Main content rendering ReactMarkdown remains the same ... */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-10 border border-gray-100">
              {documentationSections.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No documentation content found for this project.
                </p>
              ) : (
                documentationSections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="mb-16 scroll-mt-20"
                  >
                    <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg mr-4 flex-shrink-0">
                        {getIcon(section.icon)}
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 m-0 p-0 border-none">
                        {section.title || "Untitled Section"}
                      </h2>
                    </div>

                    <div className="prose prose-slate max-w-none prose-p:text-gray-700 prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:font-semibold prose-pre:bg-slate-800 prose-pre:text-slate-200 prose-pre:scrollbar prose-code:before:content-none prose-code:after:content-none">
                      {/* Check if content appears to be HTML (contains HTML tags) */}
                      {section.content &&
                      section.content.match(/<[a-z][\s\S]*>/i) ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {section.content ||
                            "*No content provided for this section.*"}
                        </ReactMarkdown>
                      )}
                    </div>
                  </section>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
