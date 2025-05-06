"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { TeamMemberForm } from "@/components/team-member-form";
import axiosSecure from "@/lib/axiosSecure";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function EditTeamMemberPage() {
  // Use useParams hook instead of use(params)
  const params = useParams();
  const id = params.id;

  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        const res = await axiosSecure.get(`/api/team/${id}`);
        // The API returns the team member directly, not wrapped in a teamMember property
        if (!res.data) {
          notFound();
        }
        setTeamMember(res.data);
      } catch (error) {
        console.error("Error fetching team member:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeamMember();
    }
  }, [id]);

  return (
    <DashboardLayout>
      <div className="container py-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Team Member
            </h1>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin" />
              </div>
            ) : teamMember ? (
              <TeamMemberForm teamMember={teamMember} />
            ) : (
              <div className="text-center text-muted-foreground">
                No team member found to edit.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
