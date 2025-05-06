import { adminAuth } from "./firebaseAdmin";

export async function verifyToken(req) {
  let token = null;

  // 1. Extract token from Authorization header
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split("Bearer ")[1];
    }
  } catch (error) {
    // This might happen if req.headers is not available or structured differently
    console.error("Error accessing Authorization header:", error);
    return null; // Cannot proceed without headers
  }

  // Check if token was extracted
  if (!token) {
    console.error(
      "Token verification failed: Missing or invalid format Authorization header."
    );
    return null;
  }

  // 2. Verify the extracted token string
  try {
    // Verify the ID token using the Firebase Admin SDK.
    const decodedToken = await adminAuth.verifyIdToken(token, true); // checkRevoked = true

    // Token is valid
    return decodedToken;
  } catch (error) {
    // Handle specific Firebase Auth errors or generic errors
    if (error.code === "auth/id-token-expired") {
      console.error("Token verification failed: Token expired.");
    } else if (error.code === "auth/id-token-revoked") {
      console.error("Token verification failed: Token revoked.");
    } else if (error.code === "auth/argument-error") {
      console.error(
        "Token verification failed: Invalid token argument passed to admin SDK."
      );
    } else {
      console.error("Token verification failed with unexpected error:", error);
    }
    // Return null if verification fails
    return null;
  }
}
