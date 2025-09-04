"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecureTicketView from "@/components/support/secure-ticket-view";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SecureTicketPage() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);

        // Verify the token and get the ticket ID
        const response = await fetch(`/api/tickets/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid or expired ticket link");
        }

        const { ticketId } = await response.json();

        // Fetch the ticket data using the ID
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ticketResponse.ok) {
          throw new Error("Failed to load ticket data");
        }

        const ticketData = await ticketResponse.json();
        console.log("Fetched ticket data:", ticketData);
        setTicket(ticketData);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTicket();
    }
  }, [token]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-16 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-16 flex justify-center items-center min-h-[50vh]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. This link may be invalid or expired.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Support Ticket</h1>
        {ticket && <SecureTicketView ticket={ticket} token={token} />}
      </div>
      <Footer />
    </div>
  );
}
