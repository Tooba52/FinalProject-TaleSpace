// Import necessary components and functions
import { Navigate } from "react-router-dom"; // To redirect if not authorized
import { jwtDecode } from "jwt-decode"; // To decode JWT token and check expiration
import api from "../api"; // API instance to make requests
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"; // Constants for token keys
import { useState, useEffect } from "react"; // React hooks for state and lifecycle management

function ProtectedRoute({ children }) {
  // State to track authorization status
  const [isAuthorized, setIsAuthorized] = useState(null);

  // useEffect hook to check authentication status when the component mounts
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false)); // Handle errors during auth check
  }, []);

  // Function to refresh the JWT token using the refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN); // Get refresh token from localStorage
    if (!refreshToken) {
      localStorage.clear(); // Clear local storage if no refresh token
      setIsAuthorized(false); // Set authorization status to false
      return;
    }

    try {
      // Try to get a new access token using the refresh token
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken, // Send refresh token to the server
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access); // Store new access token
        setIsAuthorized(true); // Set authorization to true
      } else {
        localStorage.clear(); // Clear local storage if refresh token is invalid
        setIsAuthorized(false); // Set authorization status to false
      }
    } catch (error) {
      console.log("Refresh token expired, logging out."); // Handle errors in refreshing token
      localStorage.clear(); // Clear local storage if token refresh fails
      setIsAuthorized(false); // Set authorization to false
    }
  };

  // Function to check if the user is authenticated
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN); // Get access token from localStorage
    if (!token) {
      setIsAuthorized(false); // If no access token, user is not authorized
      return;
    }
    const decoded = jwtDecode(token); // Decode the token to extract its payload
    const tokenExpiration = decoded.exp; // Get token expiration time
    const now = Date.now() / 1000; // Get current time in seconds

    // If the token is expired, try to refresh it
    if (tokenExpiration < now) {
      await refreshToken(); // Call refresh token function
    } else {
      setIsAuthorized(true); // If token is still valid, authorize the user
    }
  };

  // If the authorization status is still being checked, show loading state
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // If the user is authorized, render the protected route's children
  return isAuthorized ? children : <Navigate to="/login" />; // Redirect to login if not authorized
}

export default ProtectedRoute;
