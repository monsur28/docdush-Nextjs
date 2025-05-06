"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteImage, setSiteImage] = useState(null);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/project" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const res = await fetch("/api/site-info");
        const data = await res.json();
        if (data.success && data.data.siteImage) {
          setSiteImage(data.data.siteImage);
        } else {
          setSiteImage(null);
        }
      } catch (error) {
        console.error("Failed to fetch site info:", error);
        setSiteImage(null);
      }
    };

    fetchSiteInfo();
  }, []);

  const fallbackImage =
    "https://i.ibb.co/dqGXxqn/Doc-Dush-twintech-removebg-preview.png";

  return (
    <header className="sticky top-0 z-50 bg-white text-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#82b440] to-[#5a8e30] rounded-full opacity-0 group-hover:opacity-70 transition duration-300 group-hover:duration-200 animate-pulse blur-md"></div>
              <div className="relative">
                <Image
                  src={siteImage || fallbackImage}
                  alt="Logo"
                  className="w-16 h-16 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                  width={100}
                  height={100}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8 items-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`relative py-2 px-1 font-medium transition-colors duration-300 ${
                      pathname === link.href
                        ? "text-[#82b440]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                    {pathname === link.href && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#82b440] transform transition-transform duration-300"></span>
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="bg-[#82b440] hover:bg-[#6a9235] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-[#82b440]/20 transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-[#82b440] transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <nav>
              <ul className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`block py-2 px-3 rounded-md transition-colors duration-300 ${
                        pathname === link.href
                          ? "bg-[#82b440]/10 text-[#82b440]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/login"
                    className="block bg-[#82b440] hover:bg-[#6a9235] text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
