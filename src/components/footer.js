"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(null);
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const fetchSiteInfo = async () => {
      try {
        const res = await fetch("/api/site-info");
        const data = await res.json();
        if (data.success) {
          setSiteInfo(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch site info:", error);
      }
    };

    fetchSiteInfo();
  }, []);

  if (currentYear === null) {
    return null; // or show skeleton/spinner
  }

  const logoSrc =
    siteInfo?.siteImage ||
    "https://i.ibb.co/dqGXxqn/Doc-Dush-twintech-removebg-preview.png";
  const siteName = siteInfo?.siteName || "DocDush";

  return (
    <footer className="bg-white rounded-lg shadow-sm dark:bg-gray-900 m-4">
      <div className="w-full p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <Image
              src={logoSrc}
              alt={`${siteName} Logo`}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              {siteName}
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/support" className="hover:underline me-4 md:me-6">
                Support
              </Link>
            </li>
            <li>
              <Link href="/projects" className="hover:underline me-4 md:me-6">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline me-4 md:me-6">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {currentYear}{" "}
          <Link href="/" className="hover:underline">
            {siteName}™
          </Link>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
