import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDarkMode = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (token) {
          // For authenticated users
          await fetchDarkModePreference();
        } else {
          // For non-authenticated users
          const savedMode = localStorage.getItem("darkMode");

          if (savedMode !== null) {
            // Use saved preference from localStorage
            setDarkMode(savedMode === "true");
            document.documentElement.classList.toggle(
              "dark-mode",
              savedMode === "true"
            );
          } else {
            // Detect system preference
            const systemPrefersDark =
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches;

            setDarkMode(systemPrefersDark);
            document.documentElement.classList.toggle(
              "dark-mode",
              systemPrefersDark
            );
            localStorage.setItem("darkMode", systemPrefersDark.toString());
          }
        }
      } catch (error) {
        console.error("Error initializing dark mode:", error);
        // Fallback to light mode if initialization fails
        setDarkMode(false);
        document.documentElement.classList.remove("dark-mode");
      } finally {
        setInitialized(true);
      }
    };

    initializeDarkMode();

    // Optional: Watch for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem("darkMode")) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle("dark-mode", e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  const fetchDarkModePreference = async () => {
    try {
      const res = await api.get("/api/user/profile/");
      const darkModeValue = !!res.data.dark_mode_enabled;
      setDarkMode(darkModeValue);
      document.documentElement.classList.toggle("dark-mode", darkModeValue);
      // Also store in localStorage for immediate access
      localStorage.setItem("darkMode", darkModeValue.toString());
    } catch (err) {
      console.error("Error fetching dark mode preference", err);
      // Fallback to localStorage if API fails
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setDarkMode(savedMode === "true");
      }
    } finally {
      setInitialized(true);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark-mode", newMode);
    localStorage.setItem("darkMode", newMode.toString());

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await api.patch("/api/user/profile/", { dark_mode_enabled: newMode });
      }
    } catch (err) {
      console.error("Error saving dark mode preference", err);
      // Revert if save fails
      setDarkMode(!newMode);
      document.documentElement.classList.toggle("dark-mode", !newMode);
      localStorage.setItem("darkMode", (!newMode).toString());
    }
  };

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
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
