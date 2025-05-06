import { NextResponse } from "next/server"
import { verifyTicketToken } from "@/lib/jwt"

// POST handler to verify a ticket token
export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    try {
      // Verify the token
      const { ticketId, email } = verifyTicketToken(token)

      // Return the ticket ID if token is valid
      return NextResponse.json({ ticketId, email })
    } catch (tokenError) {
      console.error("Token verification error:", tokenError)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ error: "Failed to verify token", details: error.message }, { status: 500 })
  }
}
