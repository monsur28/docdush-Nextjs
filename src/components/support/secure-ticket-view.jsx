"use client";

import { useState, useRef, useEffect } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Paperclip,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

export default function SecureTicketView({ ticket, token }) {
  const [currentTicket, setCurrentTicket] = useState(ticket); // Use state for ticket data
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  // Separate uploading state might not be needed if sending covers it
  // const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState(currentTicket.messages || []); // Initialize from state
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Function to fetch latest ticket data
  const fetchAndUpdateTicket = async () => {
    if (!currentTicket?._id || !token) return; // Ensure ID and token exist
    try {
      // NOTE: Assumes a GET endpoint exists at /api/tickets/[id]
      // You might need to create or adjust your API routes for this fetch
      const response = await fetch(`/api/tickets/${currentTicket._id}`, {
        method: "GET", // Use GET to fetch data
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Don't toast on every poll failure, just log it
        console.warn(`Failed to fetch ticket updates: ${response.status}`);
        // Option: Implement logic to stop polling after too many errors
        return;
      }

      const latestTicketData = await response.json();

      // Update the state if the data has changed (simple timestamp check)
      // More robust checks could compare message counts or specific fields
      if (latestTicketData.updatedAt !== currentTicket.updatedAt) {
        setCurrentTicket(latestTicketData);
        setMessages(latestTicketData.messages || []);
        // Optional: Scroll to bottom only if new messages arrived near the bottom
        // Consider adding logic to prevent scrolling if user scrolled up manually
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    } catch (error) {
      console.error("Error fetching ticket updates:", error);
      // Avoid flooding toasts on polling errors
      // toast.error("Could not refresh ticket data.");
    }
  };

  // Effect for polling interval
  useEffect(() => {
    if (!currentTicket?._id || !token) return; // Don't start if no ID/token

    // Set up the interval
    const intervalId = setInterval(fetchAndUpdateTicket, 10000); // 10 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);

    // Dependencies: Run effect if ticket ID or token changes (likely won't change here)
  }, [currentTicket?._id, token]); // Added dependencies

  // Effect to scroll down when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Run when messages state updates

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && files.length === 0) return;
    setSending(true);

    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      // Note: No need to append token to FormData if using Auth header
      // formData.append("token", token);
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(
        `/api/tickets/${currentTicket._id}/messages`,
        {
          // Use currentTicket._id
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // Auth header is standard
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const updatedTicketData = await response.json();

      // Update state with the response from the POST request
      setCurrentTicket(updatedTicketData); // Update the whole ticket state
      setMessages(updatedTicketData.messages || []); // Update messages state

      setNewMessage("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Let the useEffect handle scrolling based on message update
      // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Status Badge Component (no changes needed)
  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-orange-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render Message Content (Corrected field names)
  const renderMessageContent = (message) => {
    try {
      const parsedContent = JSON.parse(message.content);
      return (
        <div>
          {/* Render text content */}
          {parsedContent.text && (
            <p className="mb-2 whitespace-pre-wrap break-words">
              {parsedContent.text}
            </p>
          )}

          {/* Render attachments */}
          {parsedContent.attachments &&
            parsedContent.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {parsedContent.attachments.map((attachment, index) => {
                  // *** Corrected Check: Use resource_type ***
                  const isImage = attachment.resource_type === "image";

                  return (
                    <div
                      key={index}
                      className="border rounded p-2 bg-gray-100 dark:bg-gray-700"
                    >
                      {" "}
                      {/* Adjusted bg color */}
                      {isImage ? (
                        // Display image using next/image
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={attachment.original_filename || "View Image"}
                        >
                          <Image
                            src={attachment.url || "/placeholder.svg"}
                            // *** Corrected Alt Text: Use original_filename ***
                            alt={
                              attachment.original_filename || "Image Attachment"
                            }
                            width={300} // Adjust dimensions as needed
                            height={200}
                            className="max-h-48 w-auto rounded object-contain hover:opacity-90 transition-opacity" // Adjusted max height and added hover effect
                          />
                          {/* Optional: Display filename below image */}
                          {/* <p className="text-xs text-muted-foreground mt-1 truncate">{attachment.original_filename}</p> */}
                        </a>
                      ) : (
                        // Display link for non-image files
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                          title={`Download ${attachment.original_filename || "attachment"}`} // Add title attribute
                        >
                          <Paperclip className="h-4 w-4 mr-1 flex-shrink-0" />
                          {/* *** Corrected Link Text: Use original_filename *** */}
                          <span className="truncate">
                            {" "}
                            {/* Add truncate for long names */}
                            {attachment.original_filename || "Attachment"}
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
      // Fallback for non-JSON content
      return (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      );
    }
  };

  // --- Main Return JSX ---
  return (
    <div className="space-y-6">
      {/* Ticket Info Card - Uses currentTicket state */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {/* Use currentTicket state here */}
              <CardTitle>{currentTicket.title}</CardTitle>
              <CardDescription>
                Ticket ID: {currentTicket._id} • Created on{" "}
                {/* Ensure createdAt exists before formatting */}
                {currentTicket.createdAt
                  ? format(new Date(currentTicket.createdAt), "PPP")
                  : "N/A"}
              </CardDescription>
            </div>
            {/* Use currentTicket state here */}
            {getStatusBadge(currentTicket.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Uses currentTicket state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Submitted by
              </h3>
              <p>{currentTicket.userName}</p>
              <p className="text-sm text-muted-foreground">
                {currentTicket.userEmail}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Project
              </h3>
              <p>{currentTicket.projectName || "N/A"}</p>
              {currentTicket.projectId && (
                <p className="text-sm text-muted-foreground">
                  ID: {currentTicket.projectId}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Card */}
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        {/* Use messages state */}
        <CardContent className="flex-1 overflow-y-auto max-h-[500px] space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${message.sender === "admin" ? "justify-start" : "justify-end"}`}
              >
                {" "}
                {/* Use message._id for key if available */}
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${message.sender === "admin" ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                >
                  {renderMessageContent(message)}
                  <div
                    className={`text-xs mt-1 flex items-center ${message.sender === "admin" ? "text-muted-foreground justify-start" : "text-primary-foreground/80 justify-end"}`}
                  >
                    {/* Display sender identifier if needed */}
                    {/* {message.senderInfo && <span className="mr-1">({message.senderInfo})</span>} */}
                    <span>
                      {message.sender === "admin" ? "Support" : "You"}
                    </span>
                    <span className="mx-1">•</span>
                    {/* Use BSON Date directly with format */}
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
          <div ref={messagesEndRef} /> {/* Element to scroll to */}
        </CardContent>
        <CardFooter className="border-t pt-4">
          {" "}
          {/* Added border and padding */}
          {/* Use currentTicket state here */}
          {currentTicket.status === "closed" ? (
            <div className="w-full p-3 bg-amber-100 border border-amber-200 rounded-md text-amber-800 text-sm text-center">
              {" "}
              {/* Adjusted colors */}
              This ticket is closed. Please create a new ticket for further
              assistance.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="w-full">
              <div className="flex flex-col space-y-2">
                <div className="flex items-stretch space-x-2">
                  {" "}
                  {/* Changed to items-stretch */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    disabled={sending}
                  />
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[60px] max-h-[200px] resize-y" // Adjusted height and added resize
                    disabled={sending}
                    rows={3} // Suggest initial rows
                  />
                  <Button
                    type="submit"
                    disabled={
                      (!newMessage.trim() && files.length === 0) || sending
                    }
                    className="self-end"
                  >
                    {" "}
                    {/* Kept self-end for button */}
                    {sending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {sending ? "Sending..." : "Send"}
                    {!sending && <Send className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
                {files.length > 0 && (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md bg-gray-50">
                    {" "}
                    {/* Styled file list */}
                    <p className="font-medium mb-1">
                      {files.length} file(s) selected:
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {files.map((file, index) => (
                        <li key={index} className="truncate max-w-full">
                          {file.name}{" "}
                          <span className="text-xs">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
