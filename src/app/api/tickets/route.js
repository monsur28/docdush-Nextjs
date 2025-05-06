import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { verifyAdminToken } from "@/lib/jwt";

// GET handler to fetch all tickets
export async function GET(request) {
  try {
    // Check if this is an admin request
    const isAdminRequest = request.headers.get("X-Admin-Request") === "true";

    if (isAdminRequest) {
      // Get the Authorization header
      const authHeader = request.headers.get("Authorization");

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
          // Verify admin token
          const adminData = verifyAdminToken(token);
        } catch (error) {
          console.error("Admin token verification failed:", error.message);
          // For development, we'll continue without authentication
          // In production, you should return a 401 error here
          // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
      }
    }

    // Connect to MongoDB
    const db = await connectDB();
    const ticketsCollection = db.collection("tickets");

    // Fetch all tickets
    const tickets = await ticketsCollection.find({}).toArray();

    // Transform ObjectId to string for JSON serialization
    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      _id: ticket._id.toString(),
      projectId: ticket.projectId ? ticket.projectId.toString() : null,
    }));

    return NextResponse.json(serializedTickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets", details: error.message },
      { status: 500 }
    );
  }
}
