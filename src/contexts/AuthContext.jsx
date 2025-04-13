import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const errorMessages = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email address is already in use.";
    case "auth/invalid-email":
      return "That email address is invalid.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Email or password are incorrect. Please try again.";
    case "auth/user-not-found":
      return "There is no user with that email address.";
    case "auth/weak-password":
      return "The password is too weak. Please choose a stronger password (at least 6 characters).";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    // Add more cases as needed for other error codes
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

const googleErrorMessages = (code) => {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "Google Sign-In was cancelled. Please try again if you wish to sign in with Google.";
      break;
    case "auth/popup-blocked":
      return "The Google Sign-In popup was blocked by your browser. Please make sure pop-ups are enabled for this site.";
      break;
    case "auth/cancelled-popup-request":
      return "A Google Sign-In request is already in progress. Please wait or try again.";
      break;
    case "auth/network-request-failed":
      return "There was a problem connecting to Google. Please check your internet connection.";
      break;
    case "auth/user-cancelled":
      return "Google Sign-In was cancelled. Please try again if you wish to sign in with Google.";
      break;
    case "auth/account-exists-with-different-credential":
      return "An account with this email address already exists. Please sign in with your existing method or link your Google account.";
      //  Handle the "link account" scenario as described in the previous response
      break;
    case "auth/unauthorized-domain":
      return "This domain is not authorized for authentication. Please contact the administrator.";
      break;
    default:
      return "An unexpected error occurred while attempting to sign in with Google. Please try again.";
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signupError, setSignupError] = useState("");
  const [signinError, setSigninError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    setSignupError("");
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      const usersRef = collection(db, "users");
      await addDoc(usersRef, {
        uid: user.uid,
        email: user.email,
        usagesLeft: 4,
        lastReset: serverTimestamp(),
      });
    } catch (error) {
      const message = errorMessages(error.code);
      setSignupError(message);
      throw error;
    }
  };

  const signin = async (email, password) => {
    setSigninError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = errorMessages(error.code);
      setSigninError(message);
      throw error;
    }
  };

  const signout = async () => {
    setError("");
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const googleSignin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredentials = await signInWithPopup(auth, provider);
      const user = userCredentials.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          usagesLeft: 5,
          lastReset: serverTimestamp(),
        });
      }
    } catch (error) {
      const message = googleErrorMessages(error.code);
      setError(message);
      throw error;
    }
  };

  const sendResetPassword = async () => {};

  const value = {
    currentUser,
    signup,
    signin,
    signout,
    googleSignin,
    loading,
    signupError,
    signinError,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div
            className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
