"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";
import { useAuth } from "../../context/auth-context";
import Image from "next/image";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client-side render
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted on the client
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError(""); // Clear previous error
      setLoading(true);
      await signIn(email, password);
      toast({
        title: "Login Successful",
        description: "You are now logged in.",
        status: "success",
      });
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error.message || "Failed to sign in. Please check your credentials.";
      setError(errorMessage); // Handle error message
      console.error("Login Error: ", error); // Logging actual error object if needed
    } finally {
      setLoading(false);
    }
  }

  if (!isClient) {
    return null; // Prevent SSR from trying to render context-dependent content
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Image
            className="mx-auto h-36 w-auto"
            src="https://i.ibb.co.com/dqGXxqn/Doc-Dush-twintech-removebg-preview.png"
            alt="DocDush"
            width={100}
            height={100}
          />
          <div className="flex justify-center">
            <FaLock className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your project documentation
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
