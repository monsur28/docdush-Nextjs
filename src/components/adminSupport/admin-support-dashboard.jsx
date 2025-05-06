"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AdminConversationView from "./admin-conversation-view";
import AdminTicketList from "./admin-ticket-list";
import axios from "axios"; // Use regular axios for public GETs
import axiosSecure from "@/lib/axiosSecure"; // Use secure for POST/PATCH etc.
import { Button } from "../ui/button";

export default function AdminSupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [sending, setSending] = useState(false); // Keep track of sending state for AdminConversationView

  // Effect for fetching the list of tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/tickets"); // Public endpoint ok for GET list

        // Sort tickets by lastMessageTimestamp (or createdAt as fallback) in descending order
        const sortedTickets = response.data.sort((a, b) => {
          const dateA = new Date(a.lastMessageTimestamp || a.createdAt);
          const dateB = new Date(b.lastMessageTimestamp || b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Ensure correct comparison
        });

        setTickets(sortedTickets);
        setError("");
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError(
          error.response?.data?.error ||
            "Failed to load tickets from the server."
        );
        toast.error("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Fetch only once on mount

  const handleSelectTicket = async (ticket) => {
    // If the selected ticket doesn't have messages fully loaded (e.g., list view optimization)
    // Or if we always want the latest, fetch the full details.
    if (
      !ticket.messages ||
      ticket.messages.length === 0 ||
      !activeTicket ||
      activeTicket._id !== ticket._id
    ) {
      try {
        setLoading(true); // Show loading indicator while fetching full ticket
        setActiveTicket(null); // Clear previous active ticket briefly
        const response = await axios.get(`/api/tickets/${ticket._id}`);
        setActiveTicket(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching full ticket details:", err);
        setError(err.response?.data?.error || "Failed to load ticket details.");
        toast.error("Failed to load ticket details.");
        setActiveTicket(null); // Clear active ticket on error
      } finally {
        setLoading(false);
      }
    } else {
      // Already have the details, just set it active
      setActiveTicket(ticket);
    }
  };

  // --- Updated handleSendMessage to accept FormData ---
  const handleSendMessage = async (formData) => {
    // formData is now expected to be a FormData object
    if (!activeTicket?._id || !formData) return;

    setSending(true); // Indicate sending process started

    try {
      // --- Send FormData using axiosSecure.post ---
      // Axios automatically sets Content-Type to multipart/form-data for FormData
      const response = await axiosSecure.post(
        `/api/tickets/${activeTicket._id}/messages`,
        formData // Send the FormData object directly
      );

      // The backend should return the *updated* ticket after adding the message
      const updatedTicket = response.data;

      // Update the active ticket state with the fully updated ticket from the backend
      setActiveTicket(updatedTicket);

      // Also update the ticket in the main tickets list for consistency
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === activeTicket._id ? updatedTicket : ticket
        )
      );

      // If the ticket was 'open', automatically update its status to 'in-progress'
      if (updatedTicket.status === "open") {
        // Use the updatedTicket directly instead of relying on potentially stale activeTicket state
        await handleUpdateTicketStatus(
          updatedTicket._id,
          "in-progress",
          updatedTicket
        );
      } else {
        // If status wasn't 'open', ensure the active ticket reflects any potential status change from the backend response
        setActiveTicket(updatedTicket);
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === activeTicket._id ? updatedTicket : ticket
          )
        );
      }

      toast.success("Reply sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      // Display more specific error from backend if available
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to send reply";
      toast.error(errorMsg);
      // Re-throw or handle error state if needed, e.g., keep sending indicator off
    } finally {
      setSending(false); // Indicate sending process finished
    }
  };

  // --- Updated handleUpdateTicketStatus ---
  const handleUpdateTicketStatus = async (
    ticketId,
    newStatus,
    currentTicketData = null
  ) => {
    // currentTicketData allows passing the latest ticket data if available, avoids stale state reads
    const ticketToUpdate =
      currentTicketData || tickets.find((t) => t._id === ticketId);

    if (!ticketToUpdate || ticketToUpdate.status === newStatus) {
      return; // No change needed or ticket not found
    }

    // Optimistic UI update (optional but good UX)
    const previousTickets = [...tickets]; // Store previous state for potential rollback
    const previousActiveTicket = activeTicket ? { ...activeTicket } : null;

    // Update locally first
    if (activeTicket && activeTicket._id === ticketId) {
      setActiveTicket((prev) => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      }));
    }
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket._id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : ticket
      )
    );

    try {
      // Use secure axios for PATCH
      const response = await axiosSecure.patch(`/api/tickets/${ticketId}`, {
        status: newStatus,
      });

      // Update with data from backend response for accuracy (contains updated timestamps etc.)
      const updatedTicketFromServer = response.data;
      if (activeTicket && activeTicket._id === ticketId) {
        setActiveTicket(updatedTicketFromServer);
      }
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? updatedTicketFromServer : ticket
        )
      );

      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update ticket status"
      );
      // Rollback optimistic update on error
      setTickets(previousTickets);
      if (
        previousActiveTicket &&
        activeTicket &&
        activeTicket._id === previousActiveTicket._id
      ) {
        setActiveTicket(previousActiveTicket);
      }
    }
  };

  const handleBackToList = () => {
    setActiveTicket(null);
    setError("");
    // Optionally refetch tickets list if needed, though usually not necessary just going back
  };

  // Filter tickets based on the active tab
  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "all") return true;
    return ticket.status === activeTab;
  });

  // UI Rendering (Main structure remains similar)
  return (
    <div className="bg-white rounded-lg shadow-md border">
      {/* Content Area */}
      {activeTicket ? (
        // Conversation View
        <div className="p-3 md:p-4">
          {error && (
            <div className="text-red-600 bg-red-50 p-3 mb-4 border border-red-200 rounded text-sm">
              {error}
            </div>
          )}
          {/* Pass the 'sending' state down */}
          <AdminConversationView
            key={activeTicket._id} // Ensure component re-mounts on ticket change
            ticket={activeTicket}
            messages={activeTicket.messages || []} // Ensure messages is an array
            loadingMessages={loading && !activeTicket} // Indicate loading only if fetching full ticket
            onBack={handleBackToList}
            onSendMessage={handleSendMessage} // Passes FormData up
            onUpdateStatus={handleUpdateTicketStatus}
            // Note: sending state is managed here now, not needed as prop? Let's keep it local in ConversationView.
          />
        </div>
      ) : (
        // Ticket List View
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10 bg-white px-1 pt-1 md:px-4 md:pt-4">
            {" "}
            {/* Make tabs sticky */}
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="p-3 md:p-4">
            {error && !loading && (
              <div className="text-red-600 bg-red-50 p-4 border border-red-200 rounded text-sm">
                {error}
              </div>
            )}
            {
              loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !error ? (
                <AdminTicketList
                  tickets={filteredTickets}
                  onSelectTicket={handleSelectTicket}
                />
              ) : null /* Render nothing if error and loading */
            }
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
