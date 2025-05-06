import jwt from "jsonwebtoken";

// Secret key for JWT - should be in environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Generate a JWT token for a ticket
export function generateTicketToken(ticketId, email) {
  // Token expires in 30 days
  return jwt.sign(
    {
      ticketId,
      email,
      type: "ticket-access",
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// Verify a JWT token and return the ticket ID
export function verifyTicketToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure this is a ticket access token
    if (decoded.type !== "ticket-access") {
      throw new Error("Invalid token type");
    }

    return {
      ticketId: decoded.ticketId,
      email: decoded.email,
    };
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new Error("Invalid or expired token");
  }
}

// Generate a JWT token for admin access
export function generateAdminToken(adminId, email, role = "admin") {
  // Token expires in 7 days
  return jwt.sign(
    {
      adminId,
      email,
      role,
      type: "admin-access",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify an admin JWT token
export function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure this is an admin access token
    if (decoded.type !== "admin-access") {
      throw new Error("Invalid token type");
    }

    return {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Admin JWT verification error:", error);
    throw new Error("Invalid or expired admin token");
  }
}
