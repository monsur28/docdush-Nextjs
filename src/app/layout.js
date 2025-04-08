import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/auth-context";
import { ProjectsProvider } from "../hooks/use-projects";
import { SidebarProvider } from "@/context/sidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Doc Twintech | Documentation",
  description: "Generated by create next app",
  icons: {
    icon: "/DocDush-twintech.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SidebarProvider>
        <AuthProvider>
          <head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="description" content={metadata.description} />
            <link rel="icon" href="/favicon.ico" />
            <title>{metadata.title}</title>
            {/* Inject CSS variables as style */}
            <style>{`:root { ${geistSans.variable}; ${geistMono.variable}; }`}</style>
          </head>
          <body className="font-sans antialiased text-gray-900">
            {children}
          </body>
        </AuthProvider>
      </SidebarProvider>
    </html>
  );
}
