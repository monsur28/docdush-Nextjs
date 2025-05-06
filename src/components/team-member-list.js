"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axiosSecure from "@/lib/axiosSecure";

export function TeamMemberList({ teamMembers }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleDelete = async () => {
    if (!memberToDelete || isDeleting) return; // Avoid triggering if already deleting

    try {
      setIsDeleting(true);
      const response = await axiosSecure.delete(
        `/api/team/${memberToDelete._id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete team member");
      }

      toast.success(`${memberToDelete.name} has been removed from the team.`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member. Please try again.");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null); // Close the confirmation dialog
    }
  };

  return (
    <>
      <div className="overflow-auto border rounded-md">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Description
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teamMembers.map((member) => (
              <tr key={member._id}>
                <td className="px-4 py-3">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {member.designation}
                </td>
                <td className="px-4 py-3 text-sm max-w-xs line-clamp-2">
                  {member.description.slice(0, 80)}
                  {member.description.length > 50 && "..."}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/team/edit/${member._id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setMemberToDelete(member)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.name} from the team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
