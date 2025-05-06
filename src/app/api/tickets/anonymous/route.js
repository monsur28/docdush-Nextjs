import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import connectDB from "@/lib/connectDB";
import { generateTicketToken } from "@/lib/jwt";

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
  debug: true, // Add debug mode
  logger: true, // Add logging
});

// Helper function to send email with secure ticket link
async function sendTicketConfirmationEmail(
  ticket,
  attachments,
  userEmail,
  token
) {
  // Create secure ticket URL with JWT token
  const ticketLink = `http://doc.twintechsoft.com/support/tickets/${token}`;

  let emailHtml = `
    <h1>Your Support Ticket Created</h1>
    <p>Dear ${ticket.userName},</p>
    <p>Thank you for submitting a support ticket. We have received your ticket with the following details:</p>
    <ul>
      <li><strong>Title:</strong> ${ticket.title}</li>
      <li><strong>Project:</strong> ${ticket.projectName}</li>
      <li><strong>Status:</strong> ${ticket.status}</li>
      <li><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
    </ul>
    <p><strong>Description Provided:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border: 1px solid #eee; white-space: pre-wrap; word-wrap: break-word;">${ticket.description}</pre>
  `;

  if (attachments && attachments.length > 0) {
    emailHtml += `
      <p><strong>Attachments included:</strong></p>
      <ul>
        ${attachments.map((att) => `<li><a href="${att.url}" target="_blank" rel="noopener noreferrer">${att.original_filename}</a> (${att.bytes ? Math.round(att.bytes / 1024) + " KB" : "size unknown"})</li>`).join("")}
      </ul>
    `;
  }

  emailHtml += `
    <p><strong>IMPORTANT: Your Secure Ticket Link</strong></p>
    <p>Use the link below to view and respond to your ticket. This link is private and should not be shared:</p>
    <p><a href="${ticketLink}" style="padding: 10px 15px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Ticket</a></p>
    <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
    <p>${ticketLink}</p>
    <p>Our team will review your request and respond as soon as possible.</p>
    <br>
    <p>Regards,</p>
    <p>The Support Team</p>
    <a href="Twintechsoft.com">Twintechsoft</a>
  `;

  const mailOptions = {
    from: `"Support" <${process.env.EMAIL_USER}>`, // Simplified from address
    to: userEmail,
    subject: `Support Ticket Received: ${ticket.title}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    return false;
  }
}

// Helper function to send notification to IT team
async function sendITNotificationEmail(ticket) {
  const itSupportEmail = process.env.IT_SUPPORT_EMAIL;
  if (!itSupportEmail) {
    console.warn(
      "IT_SUPPORT_EMAIL environment variable not set. Skipping IT notification."
    );
    return;
  }

  const adminTicketLink = `${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${ticket._id}`;

  let emailHtml = `
    <h1>New Anonymous Support Ticket Submitted</h1>
    <p>A new support ticket requires attention.</p>
    <h2>Ticket Details:</h2>
    <ul>
      <li><strong>User Name:</strong> ${ticket.userName}</li>
      <li><strong>User Email:</strong> <a href="mailto:${ticket.userEmail}">${ticket.userEmail}</a></li>
      <li><strong>Title:</strong> ${ticket.title}</li>
      <li><strong>Project:</strong> ${ticket.projectName} (ID: ${ticket.projectId || "Not provided"})</li>
      <li><strong>Status:</strong> ${ticket.status}</li>
      <li><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</li>
    </ul>
    <p><strong>Description Provided:</strong></p>
    <pre style="background-color: #f5f5f5; padding: 10px; border: 1px solid #eee; white-space: pre-wrap; word-wrap: break-word;">${ticket.description}</pre>
  `;

  if (ticket.attachments && ticket.attachments.length > 0) {
    emailHtml += `
      <p><strong>Attachments:</strong></p>
      <ul>
        ${ticket.attachments.map((att) => `<li><a href="${att.url}" target="_blank" rel="noopener noreferrer">${att.original_filename}</a> (${att.bytes ? Math.round(att.bytes / 1024) + " KB" : "size unknown"})</li>`).join("")}
      </ul>
    `;
  }

  emailHtml += `
    <p>Please review and respond to the ticket in the admin panel:</p>
    <p><a href="${adminTicketLink}" target="_blank" rel="noopener noreferrer">View Ticket Now</a></p>
  `;

  const mailOptions = {
    from: `"Support System" <${process.env.EMAIL_USER}>`, // Simplified from address
    to: itSupportEmail,
    subject: `[Support Ticket #${ticket._id}] New Anonymous Ticket: ${ticket.title}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending notification email to IT:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    return false;
  }
}

// POST Handler: Create a new anonymous ticket
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract and Validate Fields
    const title = formData.get("title")?.toString()?.trim();
    const userName = formData.get("userName")?.toString()?.trim();
    const userEmail = formData.get("email")?.toString()?.trim();
    const projectId = formData.get("projectId")?.toString()?.trim() || null;
    const projectName = formData.get("projectName")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const files = formData
      .getAll("files")
      .filter((f) => f instanceof File && f.size > 0);

    const requiredFields = {
      title,
      userName,
      userEmail,
      description,
      projectName,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields.join(", "));
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}.` },
        { status: 400 }
      );
    }

    // Upload Files to Cloudinary
    let uploadedFiles = [];
    if (files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise(async (resolve, reject) => {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "support-tickets", resource_type: "auto" },
              (error, result) => {
                if (error) {
                  console.error(
                    `Cloudinary upload error for ${file.name}:`,
                    error
                  );
                  reject(new Error(`Failed to upload ${file.name}`));
                } else if (result) {
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                    format: result.format,
                    bytes: result.bytes,
                    original_filename: file.name,
                  });
                } else {
                  reject(
                    new Error(
                      `Cloudinary upload failed without error for ${file.name}`
                    )
                  );
                }
              }
            );
            uploadStream.end(buffer);
          } catch (bufferError) {
            console.error(
              `Error processing file buffer for ${file.name}:`,
              bufferError
            );
            reject(new Error(`Error processing file ${file.name}`));
          }
        });
      });

      try {
        uploadedFiles = await Promise.all(uploadPromises);
      } catch (allUploadsError) {
        console.error(
          "One or more file uploads failed during processing/uploading:",
          allUploadsError
        );
        return NextResponse.json(
          {
            error: "Failed to upload one or more attachments.",
            details: allUploadsError.message,
          },
          { status: 500 }
        );
      }
    }

    // Save Ticket to Database
    let insertedTicket = null;
    try {
      const db = await connectDB();
      const ticketsCollection = db.collection("tickets");

      const newTicket = {
        title,
        userName,
        userEmail,
        projectId: projectId ? new ObjectId(projectId) : null,
        projectName,
        description,
        attachments: uploadedFiles,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        isAnonymous: true, // Mark as anonymous ticket
        messages: [
          {
            sender: userName,
            content: description,
            timestamp: new Date(),
            attachments: uploadedFiles.map((f) => ({
              url: f.url,
              public_id: f.public_id,
              filename: f.original_filename,
              bytes: f.bytes,
              resource_type: f.resource_type,
            })),
          },
        ],
      };

      const result = await ticketsCollection.insertOne(newTicket);

      insertedTicket = await ticketsCollection.findOne({
        _id: result.insertedId,
      });

      if (!insertedTicket) {
        throw new Error(
          "Critical: Failed to retrieve ticket immediately after insertion."
        );
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      if (uploadedFiles.length > 0) {
        console.warn(
          "Attempting to delete uploaded files from Cloudinary due to DB error..."
        );
        const deletePromises = uploadedFiles.map((f) =>
          cloudinary.uploader
            .destroy(f.public_id)
            .catch((err) =>
              console.error(`Failed to delete ${f.public_id}:`, err)
            )
        );
        await Promise.allSettled(deletePromises);
      }
      const dbErrorMessage =
        dbError instanceof Error ? dbError.message : "Database error";
      return NextResponse.json(
        {
          error: "Failed to save ticket to database.",
          details: dbErrorMessage,
        },
        { status: 500 }
      );
    }

    // Generate JWT token for secure access
    const token = generateTicketToken(insertedTicket._id.toString(), userEmail);

    // Send Emails (User and IT) - Use await directly to catch errors
    try {
      // Send user confirmation email
      const userEmailSent = await sendTicketConfirmationEmail(
        insertedTicket,
        uploadedFiles,
        userEmail,
        token
      );

      // Send IT notification email
      await sendITNotificationEmail(insertedTicket);
    } catch (emailError) {
      console.error("Error in email sending process:", emailError);
      // Continue with the response even if email sending fails
    }

    // Return Success Response

    return NextResponse.json(
      {
        success: true,
        ticketId: insertedTicket._id.toString(),
        message:
          "Ticket created successfully. Check your email for the secure access link.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unhandled error in POST /api/tickets/anonymous:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    if (error instanceof Error) console.error(error.stack);
    return NextResponse.json(
      {
        error: "Failed to create ticket due to an unexpected error.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
