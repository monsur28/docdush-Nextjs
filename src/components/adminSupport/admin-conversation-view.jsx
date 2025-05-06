"use client";

import { useState, useRef, useEffect } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  Paperclip,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminConversationView({
  ticket: initialTicket, // Renamed prop for clarity
  messages: initialMessages, // Renamed prop
  loadingMessages,
  onBack,
  onSendMessage,
  onUpdateStatus,
}) {
  // --- State Management ---
  // Hold the current view of the ticket data internally
  const [currentTicket, setCurrentTicket] = useState(initialTicket);
  // Hold the current view of messages internally
  const [internalMessages, setInternalMessages] = useState(
    initialMessages || initialTicket?.messages || []
  );
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Update internal state if initial props change ---
  useEffect(() => {
    setCurrentTicket(initialTicket);
    setInternalMessages(initialMessages || initialTicket?.messages || []);
  }, [initialTicket, initialMessages]); // Update if the initial ticket/messages from parent change

  // --- Function to fetch latest ticket data ---
  const fetchAndUpdateTicketData = async () => {
    // Ensure we have an ID to fetch
    if (!currentTicket?._id) return;

    try {
      // IMPORTANT: Assumes a GET endpoint exists and requires admin auth (Bearer token)
      // You need to implement GET /api/tickets/[id] on your backend
      const response = await fetch(`/api/tickets/${currentTicket._id}`, {
        method: "GET",
        headers: {
          // Assuming admin token is available via localStorage, context, or other means
          // If not, this needs to be passed down or retrieved securely
          Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`, // EXAMPLE: Retrieve token
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Polling failed: Unauthorized. Stopping poll.");
        toast.error("Admin session expired. Please log in again.");
        // Optionally clear the interval here if desired
        // clearInterval(intervalId); // Need to manage intervalId state if clearing here
        return;
      }
      if (!response.ok) {
        console.warn(
          `Failed to fetch ticket updates (poll): ${response.status}`
        );
        return; // Don't update state on non-OK response
      }

      const latestTicketData = await response.json();

      // Only update state if the data has actually changed to prevent needless re-renders
      if (latestTicketData.updatedAt !== currentTicket.updatedAt) {
        setCurrentTicket(latestTicketData);
        setInternalMessages(latestTicketData.messages || []);
        // Let the other useEffect handle scrolling
      }
    } catch (error) {
      console.error("Error polling for ticket updates:", error);
      // Avoid toast spam on polling errors
    }
  };

  // --- Effect for polling interval ---
  useEffect(() => {
    // Don't poll if ticket is closed or doesn't exist
    if (!currentTicket?._id || currentTicket?.status === "closed") {
      return; // No cleanup needed if interval wasn't set
    }

    // Set up the interval
    const intervalId = setInterval(fetchAndUpdateTicketData, 10000); // 30 seconds

    // Cleanup function to clear interval
    return () => {
      clearInterval(intervalId);
    };

    // Re-run effect if the ticket ID changes or status changes (to stop polling when closed)
  }, [currentTicket?._id, currentTicket?.status]);

  // Effect to scroll down when internal messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [internalMessages]); // Depend on internalMessages

  // --- Event Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content && files.length === 0) {
      toast.warning("Please enter a message or select a file.");
      return;
    }
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      files.forEach((file) => {
        if (file instanceof File) formData.append("files", file);
      });

      // Call parent handler to actually send the data
      await onSendMessage(formData);

      // Clear local form state. Data refresh will happen via polling or parent update.
      setNewMessage("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Optional: Trigger an immediate fetch after sending, instead of waiting for the poll
      // fetchAndUpdateTicketData(); // Uncomment to fetch immediately
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = (status) => {
    if (currentTicket.status === status) return;
    // Call parent handler to update status
    onUpdateStatus(currentTicket._id, status);
    // Optimistically update local state for immediate UI feedback
    setCurrentTicket((prev) => ({ ...prev, status: status }));
  };

  // --- Rendering Logic ---
  const renderMessageContent = (message) => {
    // (Keep the improved renderMessageContent function from previous examples
    // which handles JSON parsing and image display)
    try {
      let parsedContent;
      if (typeof message.content === "object" && message.content !== null)
        parsedContent = message.content;
      else if (typeof message.content === "string")
        parsedContent = JSON.parse(message.content);
      else return <p>{String(message.content)}</p>;

      const textContent = parsedContent?.text || "";
      const attachments = parsedContent?.attachments || [];
      return (
        <div>
          {textContent && (
            <p className="mb-2 whitespace-pre-wrap break-words">
              {textContent}
            </p>
          )}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => {
                const isImage = attachment.resource_type === "image";
                const fileName =
                  attachment.original_filename ||
                  attachment.filename ||
                  "Attachment";
                const fileSize = attachment.bytes
                  ? `(${(attachment.bytes / 1024).toFixed(1)} KB)`
                  : "";
                return (
                  <div
                    key={attachment.public_id || index}
                    className="border rounded p-2 bg-slate-100 dark:bg-slate-700 max-w-xs"
                  >
                    {isImage ? (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View image: ${fileName}`}
                      >
                        <Image
                          src={attachment.url || "/placeholder.svg"}
                          alt={fileName}
                          width={300}
                          height={200}
                          className="max-h-40 w-auto rounded object-contain transition-opacity duration-300 opacity-0"
                          onLoadingComplete={(image) =>
                            image.classList.remove("opacity-0")
                          }
                          onError={(e) =>
                            (e.currentTarget.src = "/placeholder.svg")
                          }
                        />
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {fileName} {fileSize}
                        </span>
                      </a>
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                        title={`Download file: ${fileName}`}
                      >
                        <Paperclip className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {fileName} {fileSize}
                        </span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return (
        <p className="whitespace-pre-wrap break-words">
          {String(message.content)}
        </p>
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "closed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // --- Main Return JSX ---
  // Use internal state variables (currentTicket, internalMessages) for display
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[75vh]">
      {/* Header Section - Use currentTicket */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2
              className="text-lg md:text-xl font-semibold truncate"
              title={currentTicket.title}
            >
              {currentTicket.title}
            </h2>
            <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground gap-x-2">
              <span>
                From: {currentTicket.userName} ({currentTicket.userEmail})
              </span>
              <span className="hidden md:inline mx-1">•</span>
              <span>Project: {currentTicket.projectName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="flex items-center mr-2 border rounded-md px-2 py-1">
            {getStatusIcon(currentTicket.status)}
            <span className="ml-1 text-xs md:text-sm font-medium">
              {currentTicket.status === "in-progress"
                ? "In Progress"
                : currentTicket.status?.charAt(0).toUpperCase() +
                  currentTicket.status?.slice(1)}
            </span>
          </div>
          <Select
            value={currentTicket.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs md:text-sm">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversation Area - Use internalMessages */}
      <Card className="flex-1 flex flex-col overflow-hidden border">
        <CardContent className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3">
          {/* Use loadingMessages prop from parent */}
          {loadingMessages && !internalMessages.length ? ( // Show loading only if messages aren't loaded yet
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading
              Messages...
            </div>
          ) : internalMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            // Map over internalMessages state
            internalMessages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-lg p-2 md:p-3 shadow-sm ${message.sender === "admin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                >
                  {renderMessageContent(message)}
                  <div
                    className={`text-xs mt-1 flex items-center ${message.sender === "admin" ? "text-blue-100 opacity-80 justify-end" : "text-gray-500 dark:text-gray-400 justify-start"}`}
                  >
                    <span>
                      {message.sender === "admin"
                        ? "Support Team"
                        : currentTicket.userName || "User"}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {message.timestamp
                        ? format(new Date(message.timestamp), "MMM d, h:mm a")
                        : "Sending..."}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input Area - Use currentTicket */}
      <form
        onSubmit={handleSendMessage}
        className="mt-4 border rounded-md p-3 bg-slate-50 dark:bg-slate-800"
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-start space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || currentTicket.status === "closed"}
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              disabled={sending || currentTicket.status === "closed"}
            />
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                currentTicket.status === "closed"
                  ? "Ticket is closed."
                  : "Type your reply..."
              }
              className="flex-1 min-h-[60px] max-h-[200px] text-sm bg-white dark:bg-slate-900 dark:text-gray-200"
              disabled={sending || currentTicket.status === "closed"}
              rows={3}
            />
            <Button
              type="submit"
              className="self-end"
              disabled={
                (!newMessage.trim() && files.length === 0) ||
                sending ||
                currentTicket.status === "closed"
              }
              title={
                currentTicket.status === "closed"
                  ? "Re-open ticket to reply"
                  : "Send message"
              }
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2 hidden md:inline">
                {sending ? "Sending..." : "Reply"}
              </span>
            </Button>
          </div>
          {files.length > 0 && (
            <div className="text-xs text-muted-foreground pl-12">
              <p className="font-medium mb-1">
                {files.length} file(s) ready to upload:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {files.map((file, index) => (
                  <li key={index} className="truncate max-w-xs md:max-w-md">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {currentTicket.status === "closed" && !sending && (
            <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2 text-center">
              This ticket is closed. To reply, please change the status above.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
