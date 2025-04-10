// src/app/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios"; // Import axios or use fetch
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react

// Remove mock data imports
// import { dashboardStats, recentActivity } from "@/lib/mock-data";

import DashboardStats from "@/components/DashboardStats";
import DashboardCard from "@/components/DashboardCard";
import RecentActivity from "@/components/RecentActivity";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link"; // Use Next.js Link for internal navigation

export default function DashboardPage() {
  // State for fetched data
  const [statsData, setStatsData] = useState(null);
  const [activityData, setActivityData] = useState([]);

  // State for loading and errors
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true); // Ensure loading is true when fetching starts
      setError(null);
      try {
        // Fetch stats and activity concurrently
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get("/api/stats"),
          axios.get("/api/activity?limit=5"), // Fetch latest 5 activities
        ]);
        // --- Process Stats Response ---
        // Adjust checks based on your actual API response structure
        if (statsResponse.data?.success && statsResponse.data.data) {
          setStatsData(statsResponse.data.data);
        } else {
          // Throw specific error if stats data is not as expected
          throw new Error(
            statsResponse.data?.message || "Failed to load dashboard stats"
          );
        }

        // --- Process Activity Response ---
        // Adjust checks based on your actual API response structure
        if (
          activityResponse.data?.success &&
          Array.isArray(activityResponse.data.data)
        ) {
          setActivityData(activityResponse.data.data);
        } else {
          // Throw specific error if activity data is not as expected
          throw new Error(
            activityResponse.data?.message || "Failed to load recent activity"
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.message || "An unexpected error occurred while loading data."
        );
        // Optionally clear state on error
        setStatsData(null);
        setActivityData([]);
      } finally {
        setLoading(false); // Set loading false after fetching completes or fails
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array fetches data once when component mounts

  // --- Loading State ---
  if (loading) {
    return (
      <DashboardLayout>
        {/* Centered loader within the layout */}
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          {/* Adjust height as needed */}
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <p className="text-red-600 px-4 text-center">
            Error loading dashboard: {error}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // --- Render Dashboard with Fetched Data ---
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Pass fetched stats data, handle null case */}
        <DashboardStats stats={statsData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Activity">
            {/* Pass fetched activity data */}
            <RecentActivity activities={activityData} />
          </DashboardCard>

          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Use Next.js Link component for internal navigation */}
              <Link
                href="/dashboard/projects/new"
                className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-200 font-medium"
              >
                Create New Project
              </Link>
              <Link
                href="/dashboard/projects"
                className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition duration-200 font-medium"
              >
                Manage Projects
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition duration-200 font-medium"
              >
                Edit Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition duration-200 font-medium"
              >
                Settings
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
