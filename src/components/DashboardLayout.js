"use client";

import { useState, useEffect, useRef } from "react";
import {
  Headset,
  Home,
  Menu,
  Package,
  Search,
  Settings,
  Users,
  User2,
} from "lucide-react";
import { FaInfoCircle, FaUser } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import PrivateRoute from "@/context/PrivateRoute";

const DashboardLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [zoomContent, setZoomContent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null); // Site info state
  const { user, signOut } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const res = await fetch("/api/site-info");
        const json = await res.json();
        if (json.success) {
          setSiteInfo(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch site info", err);
      }
    };
    fetchSiteInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    signOut()
      .then(() => router.push("/login"))
      .catch((error) => console.error("Sign out error:", error));
  };

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Projects",
      link: "/dashboard/projects",
    },
    {
      icon: <FaUser className="w-5 h-5" />,
      label: "Profile",
      link: "/dashboard/profile",
    },
    {
      icon: <Headset className="w-5 h-5" />,
      label: "Support",
      link: "/dashboard/support",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Team",
      link: "/dashboard/team",
    },
    {
      icon: <FaInfoCircle className="w-5 h-5" />,
      label: "Site Info",
      link: "/dashboard/site-info",
    },
  ];

  const handleBackdropClick = () => {
    setIsMobileOpen(false);
    setZoomContent(true);
    setTimeout(() => setZoomContent(false), 600);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <PrivateRoute>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            isOpen ? "w-64" : "w-16"
          } border-r transition-all duration-300 fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-card`}
        >
          <div className="flex h-16 items-center border-b px-4 shrink-0">
            <Link href="/" className="flex items-center">
              {siteInfo?.siteImage ? (
                <Image
                  src={siteInfo.siteImage}
                  alt={siteInfo.siteName || "Site Logo"}
                  width={isOpen ? 140 : 40}
                  height={40}
                  className="object-contain"
                  priority
                />
              ) : (
                <span className="text-lg font-bold">
                  {isOpen ? "Logo" : "D"}
                </span>
              )}
            </Link>
            {isOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            <Sidebar menuItems={menuItems} isCollapsed={!isOpen} />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:hidden`}
        >
          <div className="flex h-16 items-center border-b px-4 shrink-0">
            <Link href="/" className="flex items-center">
              {siteInfo?.siteImage && (
                <Image
                  src={siteInfo.siteImage}
                  alt={siteInfo.siteName || "Site Logo"}
                  width={100}
                  height={32}
                  className="object-contain"
                  priority
                />
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-2">
            <Sidebar menuItems={menuItems} isCollapsed={false} />
          </div>
        </aside>

        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isOpen ? "lg:ml-64" : "lg:ml-16"
          }`}
        >
          <header className="h-16 border-b px-4 md:px-6 flex items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative w-full max-w-sm hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 bg-muted sm:bg-transparent md:w-[200px] lg:w-[300px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative" ref={dropdownRef}>
                <Avatar
                  className="h-8 w-8"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <AvatarImage src={user?.photoURL} alt="User Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 md:w-72 lg:w-96 rounded-[24px] border-2 border-white bg-blue-100 backdrop-blur-16.5 shadow-lg p-4 z-50">
                    <div className="flex items-center space-x-4">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="User Avatar"
                          className="w-12 h-12 rounded-full object-contain"
                          width={48}
                          height={48}
                          priority
                        />
                      ) : (
                        <User2 className="w-6 h-6 text-gray-500" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {user?.displayName}
                        </h2>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-blue-300 rounded-md"
                        >
                          Sign out
                        </button>
                        <button
                          onClick={() => setShowDropdown(false)}
                          className="px-4 py-2 bg-blue-300 rounded-md"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main
            className={`flex-1 overflow-auto p-4 pt-8 transition-opacity duration-300 ${
              zoomContent ? "opacity-30" : "opacity-100"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default DashboardLayout;
