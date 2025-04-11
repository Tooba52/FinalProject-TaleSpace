import React from "react";
import "../styles/Footer.css";
import { useDarkMode } from "./DarkModeContext";

const Footer = () => {
  const { darkMode } = useDarkMode();
  return (
    <footer className={`app-footer ${darkMode ? "dark-mode" : ""}`}>
      <p>© 2025 All Rights Reserved. TaleSpace Inc.</p>
    </footer>
  );
};

export default Footer;
