import React from "react";
import { FiBookOpen } from "react-icons/fi";
import { PiSignIn } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { currentUser, signout } = useAuth();
  const handleSignout = async () => {
    try {
      await signout();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <nav className="sticky top-0 left-0 z-50 h-16 bg-white  flex justify-between items-center">
      <Link to="/" className="flex items-center justify-center gap-2">
        <FiBookOpen className="text-primary text-3xl" />
        <p className="text-text font-bold text-xl">SmartNotes</p>
      </Link>
      {currentUser ? (
        <button
          onClick={handleSignout}
          className="bg-primary rounded-xl px-5 py-2 text-white hover:opacity-90 transition-all"
        >
          Sign Out
        </button>
      ) : (
        <button className="bg-primary rounded-xl px-5 py-2 text-white hover:opacity-90 transition-all">
          <Link to="/signin">Sign In</Link>
        </button>
      )}
    </nav>
  );
}

export default Navbar;
