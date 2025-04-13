import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

function NoUsagesModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchResetTime = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const lastReset = data.lastReset?.toDate(); // Convert Firestore timestamp
        const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        updateCountdown(nextReset);

        // Update every second
        const interval = setInterval(() => updateCountdown(nextReset), 1000);
        return () => clearInterval(interval);
      }
    };

    const updateCountdown = (nextReset) => {
      const now = new Date();
      const diff = nextReset - now;

      if (diff <= 0) {
        setTimeLeft("Reset, Try Again");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    fetchResetTime();
  }, [currentUser.uid]);

  useEffect(() => {
    // Close modal if clicked outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        ref={modalRef}
        className="bg-white border border-gray rounded-2xl shadow-md p-8 max-w-md w-[90%] text-center"
      >
        <h2 className="text-2xl font-bold text-text mb-3">
          No more free uses today
        </h2>
        <p className="text-text-light mb-4">
          You’ve hit your daily limit of 5 free summaries & flashcards.
        </p>

        <div className="bg-gray-light text-text font-mono text-3xl py-3 rounded-xl mb-6">
          {timeLeft || "Loading.."}
        </div>

        <p className="text-sm text-text-light mb-6">
          Come back tomorrow or upgrade to unlock unlimited access.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={onClose} className="btn-secondary">
            Maybe later
          </button>
          <button
            onClick={() =>
              alert("Coming soon... For now use our app for free with limits!")
            }
            className="btn-primary "
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoUsagesModal;
