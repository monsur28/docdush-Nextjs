import DashboardLayout from "@/components/DashboardLayout";
import { TeamMemberForm } from "@/components/team-member-form";

export default function AddTeamMemberPage() {
  return (
    <DashboardLayout>
      <div className="container py-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Add Team Member
            </h1>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <TeamMemberForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
