"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jwtToken, setJwtToken] = useState(null); // State for storing JWT

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Get JWT token on user login
          const token = await getIdToken(user);
          setJwtToken(token);
          localStorage.setItem("jwtToken", token); // Store JWT token in localStorage
        } catch (err) {
          console.error("Error fetching JWT token:", err);
        }
      } else {
        setJwtToken(null);
        localStorage.removeItem("jwtToken"); // Remove JWT token on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);
      setJwtToken(token);
      localStorage.setItem("jwtToken", token); // Store JWT token
    } catch (error) {
      setError(handleFirebaseError(error));
      throw error;
    }
  };

  const signUp = async (email, password) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);
      setJwtToken(token);
      localStorage.setItem("jwtToken", token); // Store JWT token
    } catch (error) {
      setError(handleFirebaseError(error));
      throw error;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setJwtToken(null);
      localStorage.removeItem("jwtToken"); // Remove JWT token on logout
    } catch (error) {
      setError(handleFirebaseError(error));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        error,
        jwtToken, // Provide JWT token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to handle Firebase errors
function handleFirebaseError(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "Email already in use.";
    case "auth/weak-password":
      return "Password is too weak.";
    default:
      return error.message || "An unknown error occurred.";
  }
}
