import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectDB from "@/lib/connectDB";
import { verifyTicketToken, verifyAdminToken } from "@/lib/jwt";

// // Helper function to verify authorization
// async function verifyAuthorization(request, ticketId) {
//   // Get the Authorization header
//   const authHeader = request.headers.get("Authorization");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new Error("Authorization header missing or invalid");
//   }

//   // Extract the token
//   const token = authHeader.split(" ")[1];

//   // Check if this is an admin request
//   const isAdminRequest = request.headers.get("X-Admin-Request") === "true";

//   if (isAdminRequest) {
//     try {
//       // For admin requests, verify admin token
//       const adminData = verifyAdminToken(token);
//       console.log("Admin authenticated:", adminData.email);
//       return true;
//     } catch (adminError) {
//       console.error("Admin token verification failed:", adminError.message);

//       // Try as a regular ticket token as fallback
//       try {
//         const { ticketId: tokenTicketId } = verifyTicketToken(token);

//         // Check if the token is for this ticket
//         if (tokenTicketId !== ticketId) {
//           throw new Error("Token does not match this ticket");
//         }
//         return true;
//       } catch (ticketError) {
//         throw new Error("Invalid admin token and not a valid ticket token");
//       }
//     }
//   } else {
//     // For regular user requests, verify ticket token
//     const { ticketId: tokenTicketId } = verifyTicketToken(token);

//     // Check if the token is for this ticket
//     if (tokenTicketId !== ticketId) {
//       throw new Error("Token does not match this ticket");
//     }
//     return true;
//   }
// }

// GET handler to fetch a specific ticket
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // try {
    //   // Verify authorization for anonymous tickets
    //   await verifyAuthorization(request, id)
    // } catch (authError) {
    //   console.error("Authorization error:", authError)
    //   return NextResponse.json({ error: "Unauthorized access", details: authError.message }, { status: 401 })
    // }

    // Connect to MongoDB
    const db = await connectDB();
    const ticketsCollection = db.collection("tickets");

    // Find the ticket
    const ticket = await ticketsCollection.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Return the ticket with _id as a string
    return NextResponse.json({
      ...ticket,
      _id: ticket._id.toString(),
      projectId: ticket.projectId ? ticket.projectId.toString() : null,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH handler to update a ticket
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // try {
    //   // Verify authorization
    //   await verifyAuthorization(request, id);
    // } catch (authError) {
    //   console.error("Authorization error:", authError);
    //   return NextResponse.json(
    //     { error: "Unauthorized access", details: authError.message },
    //     { status: 401 }
    //   );
    // }

    // Connect to MongoDB
    const db = await connectDB();
    const ticketsCollection = db.collection("tickets");

    // Update the ticket
    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No changes made to the ticket" },
        { status: 400 }
      );
    }

    // Get the updated ticket
    const updatedTicket = await ticketsCollection.findOne({
      _id: new ObjectId(id),
    });

    // Return the updated ticket with _id as a string
    return NextResponse.json({
      ...updatedTicket,
      _id: updatedTicket._id.toString(),
      projectId: updatedTicket.projectId
        ? updatedTicket.projectId.toString()
        : null,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket", details: error.message },
      { status: 500 }
    );
  }
}
