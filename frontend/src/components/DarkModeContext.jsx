import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchDarkModePreference();
    } else {
      setInitialized(true);
    }
  }, []);

  const fetchDarkModePreference = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      const darkModeValue = !!res.data.dark_mode_enabled;
      console.log("Initial dark mode from API:", darkModeValue);
      setDarkMode(darkModeValue);
      // Apply to HTML element immediately
      document.documentElement.classList.toggle("dark-mode", darkModeValue);
    } catch (err) {
      console.error("Error fetching dark mode preference", err);
    } finally {
      setInitialized(true);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    console.log("Toggling dark mode to:", newMode);
    setDarkMode(newMode);
    // Apply to HTML element immediately
    document.documentElement.classList.toggle("dark-mode", newMode);

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await api.patch("/api/user/profile/", { dark_mode_enabled: newMode });
        console.log("Dark mode saved to DB");
      }
    } catch (err) {
      console.error("Error saving dark mode preference", err);
      // Revert if save fails
      setDarkMode(!newMode);
      document.documentElement.classList.toggle("dark-mode", !newMode);
    }
  };

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {children}
      </div>
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
