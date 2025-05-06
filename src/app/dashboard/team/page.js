"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { TeamMemberList } from "@/components/team-member-list";
import axiosSecure from "@/lib/axiosSecure";
import DashboardLayout from "@/components/DashboardLayout";

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axiosSecure.get("/api/team");
        setTeamMembers(res.data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <DashboardLayout>
      <div className="container py-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <Button asChild>
            <Link href="/dashboard/team/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Member
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 />
          </div>
        ) : teamMembers?.length > 0 ? (
          <TeamMemberList teamMembers={teamMembers} />
        ) : (
          <div className="rounded-lg border bg-card">
            <div className="p-6 text-center text-muted-foreground">
              No team members added yet. Click the button above to add your
              first team member.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
