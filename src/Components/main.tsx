import React from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthRoute from "./auth/AuthRoute";
import Login from "./auth/Login";
import NotFound from "./NotFound";
import "../index.css";
import { firebaseConfig } from "../../functions/lib/firebaseConfig";
import { initializeApp } from "firebase/app";

import "firebase/auth";
import "firebase/firestore";
import GameComponent from "./GameComponent";

initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthRoute>
              <App />
            </AuthRoute>
          }
        />
        <Route
          path="/game"
          element={
            <AuthRoute>
              <GameComponent />
            </AuthRoute>
          }
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
