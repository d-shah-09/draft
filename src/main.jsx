import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./legacy/home/style.css";
import "./legacy/timeline/style.css";
import "./legacy/faq/style.css";
import "./legacy/registration/style.css";
import "./app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>,
);
