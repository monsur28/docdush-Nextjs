"use client"; // Required for useState and useEffect

import React, { useState, useEffect } from "react"; // Import hooks
import Navbar from "@/components/Navbar";
import Footer from "../../components/Footer"; // Adjust path if needed
import Image from "next/image";
import axiosSecure from "@/lib/axiosSecure"; // Import your axios instance
import { toast } from "sonner"; // Import toast for error messages
import { Loader2, AlertTriangle } from "lucide-react"; // Icons for loading/error states

export default function AboutPage() {
  // State for team members, loading status, and errors
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team members when the component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        const response = await axiosSecure.get("/api/team"); // Fetch from your API endpoint
        if (response.data && Array.isArray(response.data)) {
          // Assuming the API returns an array of team members directly
          // Or adjust based on your API response structure (e.g., response.data.data)
          setTeamMembers(response.data);
        } else {
          // Handle cases where data is not an array or missing
          console.warn(
            "API did not return an array of team members:",
            response.data
          );
          setTeamMembers([]); // Set to empty array if data is invalid
          // Consider throwing an error or showing a specific message if format is wrong
          // throw new Error("Unexpected data format received from API.");
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Could not load team data.";
        setError(errorMessage);
        toast.error("Failed to load team members", {
          description: errorMessage,
        });
        setTeamMembers([]); // Ensure teamMembers is an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Helper function to render the team section based on state ---
  const renderTeamSection = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px] text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading Team Members...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[200px] text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <span className="font-semibold">Error Loading Team</span>
          <p className="text-sm text-center mt-1">{error}</p>
        </div>
      );
    }

    if (teamMembers.length === 0) {
      return (
        <div className="text-center text-gray-500 min-h-[200px] flex items-center justify-center border border-dashed rounded-md">
          No team members found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <div
            // Use a unique identifier from your data, assuming '_id' or 'id'
            key={member._id || member.id}
            // Centered content within the card
            className="bg-white p-6 rounded-lg shadow-md text-center transition-shadow hover:shadow-lg flex flex-col items-center"
          >
            {/* Container for the circular image */}
            <div className="relative h-40 w-40 mb-4 overflow-hidden rounded-full border-2 border-slate-200">
              {/* Changed size, added rounded-full and border */}
              <Image
                src={member.photoUrl || "/placeholder-avatar.svg"}
                alt={member.name || "Team Member"}
                layout="fill"
                className="object-contain" // object-cover ensures the image fills the circle
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-avatar.svg";
                }}
              />
            </div>
            <h3 className="text-xl font-bold mb-1">
              {member.name || "Unnamed Member"}
            </h3>
            <p className="text-indigo-600 font-medium mb-2">
              {member.designation || "Team Role"}
            </p>
            <p className="text-gray-700 text-sm">
              {member.description || member.bio || "No bio available."}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-gray-800">
          About Us
        </h1>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-semibold mb-4 text-gray-700">
              Our Mission
            </h2>
            <p className="text-lg mb-4 text-gray-600 leading-relaxed">
              We&apos;re dedicated to creating comprehensive, easy-to-understand
              documentation for developers. Our platform helps bridge the gap
              between complex code and practical implementation.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              With years of experience in software development and technical
              writing, we understand the challenges developers face when working
              with new technologies.
            </p>
          </div>
          <div className="relative h-80 w-full order-first md:order-last">
            <Image
              src="https://www.adaptiveus.com/hubfs/124515-min.jpg"
              alt="Our team working together"
              fill
              className="object-cover rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl font-semibold mb-10 text-center text-gray-700">
            Meet Our Team
          </h2>
          {renderTeamSection()} {/* Renders the team grid */}
        </div>

        {/* Values Section */}
        <div>
          <h2 className="text-3xl font-semibold mb-10 text-center text-gray-700">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 text-blue-800">Clarity</h3>
              <p className="text-blue-700">
                We believe in making complex concepts accessible through clear,
                concise documentation that anyone can understand.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 text-green-800">
                Thoroughness
              </h3>
              <p className="text-green-700">
                Our documentation covers every aspect of a project, from setup
                to advanced features, ensuring no questions are left unanswered.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 text-purple-800">
                Practicality
              </h3>
              <p className="text-purple-700">
                We focus on real-world applications, providing examples and use
                cases that demonstrate how to implement features effectively.
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 text-yellow-800">
                Community
              </h3>
              <p className="text-yellow-700">
                We foster a supportive community where developers can share
                knowledge, ask questions, and collaborate on solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
