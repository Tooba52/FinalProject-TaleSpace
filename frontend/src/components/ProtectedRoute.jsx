import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

// Utility function to get token from localStorage
const getToken = (key) => localStorage.getItem(key);

function ProtectedRoute({ children }) {
  const [authStatus, setAuthStatus] = useState("loading"); // "loading", "authorized", "unauthorized"

  // Refresh JWT token using the refresh token
  const refreshToken = async () => {
    const refreshToken = getToken(REFRESH_TOKEN);
    if (!refreshToken) {
      localStorage.clear();
      setAuthStatus("unauthorized");
      return;
    }

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setAuthStatus("authorized");
      } else {
        localStorage.clear();
        setAuthStatus("unauthorized");
      }
    } catch (error) {
      console.log("Refresh token expired or error occurred, logging out.");
      localStorage.clear();
      setAuthStatus("unauthorized");
    }
  };

  // Check if the user is authenticated
  const auth = async () => {
    const token = getToken(ACCESS_TOKEN);
    if (!token) {
      setAuthStatus("unauthorized");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setAuthStatus("authorized");
      }
    } catch (error) {
      console.log("Error decoding token or invalid token");
      setAuthStatus("unauthorized");
    }
  };

  useEffect(() => {
    auth();
  }, []);

  if (authStatus === "loading") {
    return <div>Loading...</div>; // Loading state
  }

  // If the user is authorized, render the protected route's children
  return authStatus === "authorized" ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
