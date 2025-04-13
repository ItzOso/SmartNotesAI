import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation(); // Get the current location

  return currentUser ? (
    children
  ) : (
    <Navigate to="/signin" state={{ from: location }} replace />
  );
}

export default PrivateRoute;
