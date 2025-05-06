"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function TicketList({ tickets, onSelectTicket }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You don&apos;t have any support tickets yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Support Tickets</h2>
      {tickets.map((ticket) => (
        <Card
          key={ticket._id}
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => onSelectTicket(ticket)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{ticket.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Project: {ticket.projectName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: {format(new Date(ticket.createdAt), "PPP")}
                </p>
              </div>
              <Badge
                className={
                  ticket.status === "open"
                    ? "bg-orange-500"
                    : ticket.status === "in-progress"
                      ? "bg-blue-500"
                      : "bg-green-500"
                }
              >
                {ticket.status === "in-progress"
                  ? "In Progress"
                  : ticket.status.charAt(0).toUpperCase() +
                    ticket.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 text-sm">
              <p className="text-muted-foreground truncate">
                {ticket.messages?.[
                  ticket.messages.length - 1
                ]?.content?.substring(0, 100)}
                {ticket.messages?.[ticket.messages.length - 1]?.content
                  ?.length > 100
                  ? "..."
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
