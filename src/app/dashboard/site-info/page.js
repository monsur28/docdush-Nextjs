import DashboardLayout from "@/components/DashboardLayout";
import { SiteInfoForm } from "@/components/site-info-form";
import { Separator } from "@/components/ui/separator";

export default function SiteInfoPage() {
  return (
    <DashboardLayout>
      <div className="">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Site Information
          </h2>
          <p className="text-muted-foreground">
            Manage your site details, metadata, and branding.
          </p>
        </div>
        <Separator className="my-6" />
        <SiteInfoForm />
      </div>
    </DashboardLayout>
  );
}
