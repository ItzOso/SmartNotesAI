import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import NotesPage from "./pages/NotesPage";
import ForgotPassword from "./pages/ForgotPassword";
import FlashcardsViewer from "./pages/FlashcardsViewer";
import SignIn from "./pages/SignIn";

function App() {
  const location = useLocation();
  const hideNavbar = ["/signin", "/signup"].includes(location.pathname);
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/notes/:id"
          element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/flashcards/:id"
          element={
            <PrivateRoute>
              <FlashcardsViewer />
            </PrivateRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
