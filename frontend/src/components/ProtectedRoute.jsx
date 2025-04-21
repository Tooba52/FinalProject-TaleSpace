// Code resued from: 
// Author: Tech With Tim
// Video Title: Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
// Video Link:  https://www.youtube.com/watch?v=c-QsfbznSXI 
// Code reused Lines - 7-84

import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

// get token from local storage
const getToken = (key) => localStorage.getItem(key);

function ProtectedRoute({ children }) {
  const [authStatus, setAuthStatus] = useState("loading");

  // try to refresh the access token
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

  // check if user has valid token
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

      // if token expired, try to refresh it
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

  // show loading while checking auth
  if (authStatus === "loading") {
    return <div>Loading...</div>;
  }

  // show protected content or redirect to login
  return authStatus === "authorized" ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
