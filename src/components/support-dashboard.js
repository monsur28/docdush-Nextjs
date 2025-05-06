"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TicketList from "./ticket-list";
import TicketForm from "./ticket-form";
import ConversationView from "./conversation-view";
import NotificationHandler from "./notification-handler";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axiosSecure from "@/lib/axiosSecure";

export default function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch ticket list from API
  useEffect(() => {
    setLoading(true);
    axiosSecure
      .get("/api/tickets")
      .then((res) => {
        setTickets(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setError("Failed to load tickets from API.");
        setLoading(false);
      });
  }, []);

  // Fetch messages for a selected ticket
  useEffect(() => {
    if (!activeTicket?._id) return;

    setLoadingMessages(true);
    fetch(`/api/tickets/${activeTicket._id}/messages`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        setMessages(data.messages || []);
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("API message error:", err);
        setError("Failed to load messages.");
        setLoadingMessages(false);
      });
  }, [activeTicket]);

  const handleCreateTicket = async (newTicketData) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicketData),
      });

      if (!res.ok) throw new Error("Failed to create ticket");

      const created = await res.json();
      setActiveTab("list");
      setActiveTicket(null);
      toast.success("Ticket created successfully!");

      // Refresh ticket list
      setTickets((prev) => [created.ticket, ...prev]);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create ticket.");
    }
  };

  const handleSendMessage = async (content) => {
    if (!activeTicket?._id) return;

    try {
      const res = await fetch(`/api/tickets/${activeTicket._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg.message]);

      // Notify admin
      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "admin-user-id",
          title: `New reply: ${activeTicket.title}`,
          body: `${activeTicket.userName} replied to ticket #${activeTicket._id.substring(0, 8)}...`,
          data: {
            ticketId: activeTicket._id,
            type: "ticket_reply",
          },
        }),
      });

      toast.success("Message sent successfully");
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message.");
    }
  };

  const handleSelectTicket = (ticket) => {
    setActiveTicket(ticket);
  };

  const handleBackToList = () => {
    setActiveTicket(null);
    setError("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-4 border-b">
        {activeTicket ? (
          <>
            <button
              onClick={handleBackToList}
              className="text-sm text-blue-600 hover:underline flex items-center mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
              Back to List
            </button>
            <h2
              className="text-xl font-semibold truncate"
              title={activeTicket.title}
            >
              Ticket: {activeTicket.title}
            </h2>
          </>
        ) : (
          <h2 className="text-xl font-semibold">Support Dashboard</h2>
        )}
        {!activeTicket && <NotificationHandler />}
      </div>

      {activeTicket ? (
        <div className="p-4">
          {error && (
            <div className="text-red-500 p-4 mb-4 border border-red-200 rounded">
              {error}
            </div>
          )}
          <ConversationView
            key={activeTicket._id}
            ticket={activeTicket}
            messages={messages}
            loadingMessages={loadingMessages}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
          />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">My Tickets</TabsTrigger>
            <TabsTrigger value="new">New Ticket</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="p-4">
            {error && !loading && (
              <div className="text-red-500 p-4">{error}</div>
            )}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <TicketList
                tickets={tickets}
                onSelectTicket={handleSelectTicket}
              />
            )}
          </TabsContent>
          <TabsContent value="new" className="p-4">
            <TicketForm onSubmit={handleCreateTicket} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
