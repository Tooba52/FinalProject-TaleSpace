import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"; 
import { useState, useEffect } from "react"; 

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  //check authentication status
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false)); // Handle errors during auth check
  }, []);

  // Function to refresh the JWT token using the refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN); 
    if (!refreshToken) {
      localStorage.clear(); 
      setIsAuthorized(false); 
      return;
    }

    try {
      // Try to get a new access token using the refresh token
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken, 
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access); 
        setIsAuthorized(true); 
      } else {
        localStorage.clear(); 
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log("Refresh token expired, logging out."); 
      localStorage.clear(); 
      setIsAuthorized(false); 
    }
  };

  // Function to check if the user is authenticated
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN); 
    if (!token) {
      setIsAuthorized(false); 
      return;
    }
    const decoded = jwtDecode(token); 
    const tokenExpiration = decoded.exp; 
    const now = Date.now() / 1000; 

    // If the token is expired, try to refresh it
    if (tokenExpiration < now) {
      await refreshToken(); 
    } else {
      setIsAuthorized(true);
    }
  };

  // If the authorization status is still being checked, show loading state
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // If the user is authorized, render the protected route's children
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
