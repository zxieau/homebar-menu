import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/noto-serif-sc/wght.css";
import App from "./App.jsx";
import "./styles.css";
import "./editorial-v2.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
