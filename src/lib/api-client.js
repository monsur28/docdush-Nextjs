import axios from "axios"

// Create an axios instance with default headers for admin requests
const adminApiClient = axios.create({
  headers: {
    "X-Admin-Request": "true",
  },
})

export const adminApi = {
  // Get all tickets
  getTickets: async () => {
    const response = await adminApiClient.get("/api/tickets")
    return response.data
  },

  // Get a specific ticket
  getTicket: async (ticketId) => {
    const response = await adminApiClient.get(`/api/tickets/${ticketId}`)
    return response.data
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    const response = await adminApiClient.patch(`/api/tickets/${ticketId}`, { status })
    return response.data
  },

  // Send a reply to a ticket
  sendReply: async (ticketId, content) => {
    const response = await adminApiClient.post(`/api/tickets/${ticketId}/messages`, {
      sender: "admin",
      content,
    })
    return response.data
  },
}

export default adminApi
