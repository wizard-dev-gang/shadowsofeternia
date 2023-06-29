import React from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthRoute from "./auth/AuthRoute";
import Login from "./auth/Login";
import "../index.css";
import { firebaseConfig } from "../../lib/firebaseConfig";
import { initializeApp } from "firebase/app";

import "firebase/auth";
import "firebase/firestore";

initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthRoute>
              <App />
            </AuthRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
