import AdminSupportDashboard from "@/components/adminSupport/admin-support-dashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminSupportPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <AdminSupportDashboard />
      </div>
    </DashboardLayout>
  );
}
