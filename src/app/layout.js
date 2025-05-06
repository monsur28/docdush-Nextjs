import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/auth-context";
import { SidebarProvider } from "@/context/sidebarContext";
import { Toaster } from "@/components/ui/sonner";
import { getSiteInfoDirect } from "@/lib/hideApi/getSiteInfo";

// Font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Dynamic Metadata Generation (API only) ---
export async function generateMetadata() {
  try {
    const siteInfo = await getSiteInfoDirect();

    return {
      title: siteInfo.metaTitle || siteInfo.siteName || "Doc Twintech",
      description: siteInfo.metaDescription || "Documentation made simple.",
      icons: {
        icon: siteInfo.favicon || "/favicon.ico",
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return {
      title: "Doc Twintech | Metadata Error",
      description: "Failed to load metadata due to an internal error.",
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

// --- Root Layout Component ---
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased text-gray-900 bg-white">
        <SidebarProvider>
          <AuthProvider>{children}</AuthProvider>
        </SidebarProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
