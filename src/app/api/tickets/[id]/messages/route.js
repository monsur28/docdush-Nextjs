// /src/app/api/tickets/[id]/messages/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectDB from "@/lib/connectDB"; // Adjust path if needed
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken"; // For verifying CUSTOM tokens
import { adminAuth } from "@/lib/firebaseAdmin"; // Import the named export (adjust path)
import { generateTicketToken } from "@/lib/jwt"; // For generating email links (adjust path)

// --- Environment Variable Check ---
const JWT_SECRET = process.env.JWT_SECRET; // Using JWT_SECRET for custom tokens
if (!JWT_SECRET) {
  console.error(
    "CRITICAL SERVER CONFIG ERROR: JWT_SECRET is not defined in environment variables."
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "465", 10),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: process.env.NODE_ENV === "development",
  logger: process.env.NODE_ENV === "development",
});

// --- Authorization Helper ---
async function verifyAuthorization(request, requiredTicketId) {
  if (!JWT_SECRET) {
    console.error("verifyAuthorization Error: JWT_SECRET is not configured.");
    throw new Error("Server configuration error: Missing JWT secret.");
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header missing or invalid format.");
  }
  const token = authHeader.substring(7);
  if (!token) {
    throw new Error("Bearer token is missing.");
  }

  try {
    // Attempt Firebase Admin Verification
    const decodedFirebaseToken = await adminAuth.verifyIdToken(token);

    return {
      isAuth: true,
      senderType: "admin",
      identifier: decodedFirebaseToken.email || decodedFirebaseToken.uid,
    };
  } catch (firebaseError) {
    if (
      firebaseError.code &&
      !firebaseError.code.startsWith("auth/id-token-")
    ) {
      console.warn("Firebase verify error:", firebaseError.code);
    }
  }

  try {
    // Attempt Custom Token Verification
    const decodedCustomToken = jwt.verify(token, JWT_SECRET);
    if (decodedCustomToken.type !== "ticket-access") {
      throw new Error(`Invalid custom token type.`);
    }
    if (decodedCustomToken.ticketId !== requiredTicketId) {
      throw new Error("Token ticketId mismatch.");
    }
    if (!decodedCustomToken.email) {
      throw new Error("Custom token missing email.");
    }
    return {
      isAuth: true,
      senderType: "user",
      identifier: decodedCustomToken.email,
    };
  } catch (customTokenError) {
    console.error("Custom JWT verification failed:", customTokenError.message);
    throw new Error("Invalid or expired token.");
  }
}

// --- Email Sending Function ---
async function sendUserNotificationEmail(ticket, message) {
  if (
    !ticket ||
    !ticket._id ||
    !ticket.userEmail ||
    !ticket.userName ||
    !ticket.title ||
    !message
  ) {
    console.error(
      `Email Send: Invalid input. T_ID: ${ticket?._id || "N/A"}, U_Email: ${ticket?.userEmail || "N/A"}, Msg: ${!!message}`
    );
    return false;
  }
  const tokenForLink = generateTicketToken(
    ticket._id.toString(),
    ticket.userEmail
  );
  const ticketLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/support/tickets/${tokenForLink}`;
  let messageText = "";
  let attachmentsIncluded = false;
  try {
    if (typeof message.content === "string") {
      const parsed = JSON.parse(message.content);
      messageText = parsed.text || "";
      attachmentsIncluded = parsed.attachments?.length > 0;
    } else {
      messageText = String(message.content);
      console.warn(`Email Send: Content for T_ID ${ticket._id} not JSON.`);
    }
  } catch (e) {
    messageText = String(message.content);
    console.warn(
      `Email Send: Failed JSON parse T_ID ${ticket._id}. Err: ${e.message}`
    );
  }
  if (!messageText && attachmentsIncluded) {
    messageText = "(Attachment included - view online)";
  } else if (!messageText && !attachmentsIncluded) {
    messageText = "(No content provided - view online)";
    console.warn(`Email Send: No content for T_ID ${ticket._id}.`);
  }
  const emailHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Support Reply</title><style>body{font-family:sans-serif}.container{max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd}.message-box{background:#f5f5f5;padding:15px;border-radius:4px;white-space:pre-wrap;word-wrap:break-word;margin-bottom:15px}.button{display:inline-block;padding:10px 20px;background:#0070f3;color:white!important;text-decoration:none;border-radius:5px}</style></head><body><div class="container"><h2>New Reply</h2><p>Hello ${ticket.userName || "User"},</p><p>Reply to ticket: <strong>${ticket.title || "N/A"}</strong></p><p><strong>Message:</strong></p><div class="message-box">${messageText.replace(/\n/g, "<br>")}</div>${attachmentsIncluded ? "<p><em>Attachments included. View online.</em></p>" : ""}<p><a href="${ticketLink}" class="button">View Ticket</a></p><p>Link: ${ticketLink}</p><p>Regards,<br>Support Team</p></div></body></html>`;
  const fromAddress =
    process.env.EMAIL_FROM ||
    `"${process.env.EMAIL_FROM_NAME || "Support Team"}" <${process.env.EMAIL_USER}>`;
  const replyToAddress = process.env.EMAIL_REPLY_TO || fromAddress;
  const mailOptions = {
    from: fromAddress,
    to: ticket.userEmail,
    subject: `Re:[Ticket #${ticket._id.toString().substring(0, 8)}] ${ticket.title || "Update"}`,
    replyTo: replyToAddress,
    html: emailHtml,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(
      `Error sending email T_ID ${ticket._id} To: ${ticket.userEmail}:`,
      error
    );
    return false;
  }
}

// --- Main POST Handler ---
export async function POST(request, { params }) {
  const handlerStartTime = Date.now();
  let ticketIdForLogging = params.id || "N/A";
  try {
    const { id } = params;
    ticketIdForLogging = id;

    if (!id || !ObjectId.isValid(id)) {
      console.warn(`Invalid Ticket ID format received: ${id}`);
      return NextResponse.json(
        { error: "Valid Ticket ID is required" },
        { status: 400 }
      );
    }

    // --- Authorization ---
    let authResult;
    try {
      authResult = await verifyAuthorization(request, id);
    } catch (authError) {
      console.error(
        `Authorization failed for ticket ${id}:`,
        authError.message
      );
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    // --- Determine Sender ---
    const sender = authResult.senderType;
    const senderIdentifier = authResult.identifier;

    // --- Content Parsing ---
    const contentType = request.headers.get("Content-Type") || "";
    let content = "";
    let files = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      content = formData.get("content")?.toString()?.trim() || "";
      files = formData
        .getAll("files")
        .filter((f) => f instanceof File && f.size > 0);
    } else if (contentType.includes("application/json")) {
      const data = await request.json();
      content = data.content?.toString()?.trim() || "";
    } else {
      console.warn(
        `Unsupported Content-Type: ${contentType} for ticket ${id}.`
      );
      return NextResponse.json(
        { error: "Unsupported request format." },
        { status: 415 }
      );
    }

    if (!content && files.length === 0) {
      return NextResponse.json(
        { error: "Message content or files are required" },
        { status: 400 }
      );
    }

    // --- Database Operations ---

    const db = await connectDB();
    const ticketsCollection = db.collection("tickets");

    const originalTicket = await ticketsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!originalTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // --- SECURITY CHECK for USER posts ---
    if (sender === "user" && originalTicket.userEmail !== senderIdentifier) {
      console.error(
        `FORBIDDEN: User token email [${senderIdentifier}] != ticket owner [${originalTicket.userEmail}]. Ticket: ${id}`
      );
      return NextResponse.json(
        { error: "Forbidden: Token email does not match ticket owner." },
        { status: 403 }
      );
    }

    // --- File Uploads ---
    let uploadedFiles = [];
    if (files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise(async (resolve, reject) => {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: `support-tickets/${id}`, resource_type: "auto" },
              (error, result) => {
                if (error) {
                  reject(new Error(`Upload failed for ${file.name}`));
                } // Simplified error handling
                else if (result) {
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                    format: result.format,
                    bytes: result.bytes,
                    original_filename: file.name,
                  });
                } else {
                  reject(new Error(`Cloudinary fail for ${file.name}`));
                }
              }
            );
            uploadStream.end(buffer);
          } catch (bufferError) {
            reject(new Error(`File process error for ${file.name}`));
          }
        });
      });
      try {
        uploadedFiles = await Promise.all(uploadPromises);
      } catch (allUploadsError) {
        console.error(`Upload failed for ticket ${id}:`, allUploadsError);
        return NextResponse.json(
          {
            error: "Failed to upload attachments.",
            details: allUploadsError.message,
          },
          { status: 500 }
        );
      }
    }

    // --- Prepare Message Document ---
    const messageContentObject = {
      text: content,
      attachments: uploadedFiles.map((f) => ({
        url: f.url,
        public_id: f.public_id,
        original_filename: f.original_filename,
        bytes: f.bytes,
        resource_type: f.resource_type,
      })),
    };
    const newMessage = {
      _id: new ObjectId(),
      sender: sender,
      senderInfo: senderIdentifier,
      content: JSON.stringify(messageContentObject),
      timestamp: new Date(),
    };

    // --- *** MODIFIED Database Update *** ---
    const updateOps = {
      // Define base update object
      $push: { messages: { $each: [newMessage], $sort: { timestamp: 1 } } },
      $set: {
        lastMessageTimestamp: newMessage.timestamp,
        updatedAt: new Date(),
        // status will be added below ONLY if admin replies to an open ticket
      },
    };

    // Check ONLY the condition to change status to 'in-progress'
    if (sender === "admin" && originalTicket.status === "open") {
      // ONLY change status if admin replies to an OPEN ticket
      updateOps.$set.status = "in-progress";
    }
    // --- *** End MODIFIED Database Update *** ---
    const updateResult = await ticketsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOps // Use the potentially modified updateOps object
    );

    if (updateResult.matchedCount === 0) {
      console.error(`CRITICAL: Failed find T_ID ${id} during update.`);
      return NextResponse.json(
        { error: "Failed find ticket during update" },
        { status: 404 }
      );
    }
    if (
      updateResult.modifiedCount === 0 &&
      updateResult.matchedCount === 1 &&
      updateOps.$set.status
    ) {
      // If we intended to change status but modifiedCount is 0, something might be wrong
      console.warn(
        `T_ID ${id} matched, status change expected, but modifiedCount=0. Check DB state/indexes.`
      );
    } else if (updateResult.modifiedCount === 0) {
      console.warn(
        `T_ID ${id} matched, but no changes made. Possible duplicate message.`
      );
    }

    // --- Fetch Updated Ticket ---
    const updatedTicket = await ticketsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!updatedTicket) {
      console.error(`CRITICAL: Failed retrieve T_ID ${id} after update.`);
      return NextResponse.json(
        { error: "Failed retrieve ticket after update" },
        { status: 500 }
      );
    }

    // --- Send Email Notification ---
    if (sender === "admin" && updatedTicket.userEmail) {
      sendUserNotificationEmail(updatedTicket, newMessage) // Fire-and-forget
        .then((sent) => {
          if (!sent) console.warn(`Async email failed for ticket ${id}.`);
        })
        .catch((err) => console.error(`Async email error T_ID ${id}:`, err));
    }

    // --- Respond to Client ---
    const handlerEndTime = Date.now();
    const duration = handlerEndTime - handlerStartTime;
    return NextResponse.json({
      ...updatedTicket,
      _id: updatedTicket._id.toString(),
    });
  } catch (error) {
    // --- Global Error Handling ---
    const handlerEndTime = Date.now();
    const duration = handlerEndTime - handlerStartTime;
    console.error(
      `Unhandled error POST T_ID ${ticketIdForLogging} after ${duration}ms:`,
      error
    );
    if (error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Unexpected server error.", details: error.message },
      { status: 500 }
    );
  }
} // End of POST handler
