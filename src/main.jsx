/**
 * Main entry point for the React application
 * Renders the MareJS application inside a StrictMode wrapper
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Mare from "../.mareJS/mare"; // Main MareJS application component
import "./i18n/config"; // Import i18n configuration

// Initialize React root and render application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Mare />
  </StrictMode>
);
