import PublicTicketForm from "@/components/support/public-ticket-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CreateTicketPage() {
  return (
    <div>
      <Navbar />
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Submit a Support Request</h1>
        <PublicTicketForm />
      </div>
      <Footer />
    </div>
  );
}
