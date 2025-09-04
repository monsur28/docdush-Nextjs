// src/app/dashboard/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

// --- Use sonner toast ---
import { toast } from "sonner";
import axiosSecure from "@/lib/axiosSecure";

// ImgBB Key
const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return names[0].slice(0, 2);
};

export default function ProfilePage() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();

  // No useToast hook needed for sonner

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(
    "/placeholder.svg?height=200&width=200"
  );

  // Effect to populate form
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      if (user) {
        const nameParts = user.displayName?.split(" ") || ["", ""];
        setProfileData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        });
        setAvatarPreview(
          user.photoURL || "/placeholder.svg?height=200&width=200"
        );
      } else {
        // --- Use sonner toast for error ---
        toast.error("Authentication Error", {
          description: "Not authenticated. Redirecting...",
        });
        router.push("/login");
      }
    } else {
      setIsLoading(true);
    }
  }, [user, authLoading, router]); // Removed toast from dependency array

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  // src/app/dashboard/profile/page.jsx

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    const currentAvatar =
      user?.photoURL || "/placeholder.svg?height=200&width=200";

    // Clear any previous image errors
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.image;
      return ne;
    });

    // --- Client-side validation (this part stays the same) ---
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 2MB." }));
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      setErrors((prev) => ({ ...prev, image: "Invalid file type." }));
      return;
    }

    setIsUploadingImage(true);

    // Show a local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result.toString());
    reader.readAsDataURL(file);

    // Prepare form data to send to YOUR API
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      // ✅ NEW: Call your own backend API route
      const response = await axiosSecure.post("/api/upload", uploadFormData);

      // ✅ NEW: Your API returns a simpler object: { url: "..." }
      if (response.data && response.data.url) {
        const uploadedUrl = response.data.url;
        console.log("Image URL from our API:", uploadedUrl);

        // Update the user's profile in Firebase
        await updateUserProfile({ photoURL: uploadedUrl });
        setAvatarPreview(uploadedUrl); // Ensure final URL is set
        toast.success("Profile picture updated!");
      } else {
        // Handle cases where your API returns an error
        throw new Error(
          response.data?.error || "Upload failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Image upload/update failed:", error);
      setErrors((prev) => ({ ...prev, image: "Upload failed." }));
      toast.error("Upload Failed", {
        description: error.message || "Could not upload profile picture.",
      });
      setAvatarPreview(currentAvatar); // Revert to the old avatar on failure
    } finally {
      setIsUploadingImage(false);
    }
  };
  const handleRemovePicture = async () => {
    const defaultAvatar = "/placeholder.svg?height=200&width=200";
    setIsUploadingImage(true);
    try {
      await updateUserProfile({ photoURL: null });
      setAvatarPreview(defaultAvatar);
      // --- Use sonner toast for info ---
      toast.info("Profile picture removed.");
    } catch (error) {
      console.error("Error removing picture:", error);
      // --- Use sonner toast for error ---
      toast.error("Failed to remove picture", {
        description: error.message || "An error occurred.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- Update Firebase Profile ---
  const updateUserProfile = async (dataToUpdate) => {
    if (!auth.currentUser) {
      // --- Use sonner toast for error ---
      toast.error("Authentication Error", {
        description: "Not authenticated.",
      });
      throw new Error("User not authenticated");
    }
    try {
      await updateProfile(auth.currentUser, dataToUpdate);
    } catch (error) {
      console.error("Firebase profile update error:", error);
      throw error; // Re-throw to be handled by calling function
    }
  };

  // --- Handle Saving General Info ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.generalSubmit;
      return ne;
    });

    const newDisplayName =
      `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim();
    const updates = {};
    let changed = false;

    if (newDisplayName && newDisplayName !== user?.displayName) {
      updates.displayName = newDisplayName;
      changed = true;
    }

    if (!changed) {
      // --- Use sonner toast for info ---
      toast.info("No changes detected in profile name.");
      setIsSavingProfile(false);
      return;
    }

    try {
      await updateUserProfile(updates);
      // --- Use sonner toast for success ---
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors((prev) => ({
        ...prev,
        generalSubmit: error.message || "Failed to save profile.",
      }));
      // --- Use sonner toast for error ---
      toast.error("Failed to save profile", {
        description: error.message || "An error occurred.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Handle Password Update ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setErrors((prev) => {
      const ne = { ...prev };
      delete ne.passwordSubmit;
      return ne;
    });

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Basic client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        passwordSubmit: "All password fields are required.",
      }));
      setIsUpdatingPassword(false);
      return;
    }
    if (newPassword.length < 6) {
      setErrors((prev) => ({
        ...prev,
        passwordSubmit: "New password must be at least 6 characters long.",
      }));
      setIsUpdatingPassword(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        passwordSubmit: "New passwords do not match.",
      }));
      setIsUpdatingPassword(false);
      return;
    }
    if (!auth.currentUser) {
      setErrors((prev) => ({ ...prev, passwordSubmit: "Not authenticated." }));
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      // --- Use sonner toast for success ---
      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      let errorMsg = "Failed to update password.";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Incorrect current password.";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "New password is too weak (at least 6 characters).";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg =
          "This action requires recent login. Please sign out and sign back in.";
      }
      setErrors((prev) => ({ ...prev, passwordSubmit: errorMsg }));
      // --- Use sonner toast for error ---
      toast.error("Password Update Failed", { description: errorMsg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- Loading UI ---
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
          <span className="ml-4 text-lg text-gray-600">Loading Profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  // --- User Not Found UI ---
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
          <p className="text-lg text-red-600">
            User not found or not logged in.
          </p>
          <Button onClick={() => router.push("/login")} className="ml-4">
            Login
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- Main JSX ---
  // (The JSX structure remains the same, only the toast function calls and imports above are changed)
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* --- Profile Avatar Column --- */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-6">
                  <Avatar className="h-40 w-40 border-2 border-muted shadow-sm">
                    <AvatarImage
                      src={avatarPreview} // Use state for preview
                      alt={user.displayName || user.email || "User Avatar"}
                      key={avatarPreview} // Add key to force re-render on src change
                    />
                    <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                      {getInitials(user.displayName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-opacity ${
                      isUploadingImage
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer hover:bg-primary/90"
                    }`}
                    title={isUploadingImage ? "Uploading..." : "Change picture"}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    <span className="sr-only">Upload avatar</span>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/webp" // Be specific
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
                <div className="space-y-1 text-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {user.displayName || "Name Not Set"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleRemovePicture}
                    disabled={
                      isUploadingImage || !user.photoURL // Disable if no photoURL exists in Firebase user object
                    }
                  >
                    Remove Picture
                  </Button>
                  {errors.image && (
                    <p className="text-xs text-red-500 mt-1 text-center">
                      {errors.image}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* --- Profile Details Tabs --- */}
          <div className="flex-1">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* General Info Tab */}
              <TabsContent value="general" className="space-y-6">
                <form onSubmit={handleSaveChanges}>
                  <Card>
                    <CardHeader>
                      <CardTitle>General Information</CardTitle>
                      <CardDescription>
                        Update your display name.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Your first name"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Your last name"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ""}
                          disabled
                          className="cursor-not-allowed bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed here.
                        </p>
                      </div>

                      {errors.generalSubmit && (
                        <p className="text-sm text-red-600">
                          {errors.generalSubmit}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                      <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </form>

                {/* Notifications Card (Static Example) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage your notification preferences (UI only).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium" htmlFor="email-notif">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about account activity.
                        </p>
                      </div>
                      {/* Replace Button with Switch if implementing */}
                      <Button variant="outline" size="sm" disabled>
                        Configure
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium" htmlFor="project-notif">
                          Project Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified for project changes.
                        </p>
                      </div>
                      {/* Replace Button with Switch if implementing */}
                      <Button variant="outline" size="sm" disabled>
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-6">
                <form onSubmit={handleUpdatePassword}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password. Requires re-entering current
                        password.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current password
                        </Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>
                      {errors.passwordSubmit && (
                        <p className="text-sm text-red-600">
                          {errors.passwordSubmit}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                      <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Password
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent sign-in times and account creation date.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>
                        <span className="font-medium text-foreground">
                          Account Created:
                        </span>{" "}
                        {user.metadata.creationTime
                          ? new Date(
                              user.metadata.creationTime
                            ).toLocaleString()
                          : "N/A"}
                      </li>
                      <li>
                        <span className="font-medium text-foreground">
                          Last Sign In:
                        </span>{" "}
                        {user.metadata.lastSignInTime
                          ? new Date(
                              user.metadata.lastSignInTime
                            ).toLocaleString()
                          : "N/A"}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
