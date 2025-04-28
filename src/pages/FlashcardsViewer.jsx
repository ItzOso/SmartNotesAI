import React, { useActionState, useEffect, useState } from "react";
import { getNote, updateNote } from "../services/firebaseService";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactFlipCard from "reactjs-flip-card";
import { GoArrowLeft } from "react-icons/go";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { getPlainText } from "../utils/textHelper";
import { toast } from "react-toastify";

function FlashcardsViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { currentUser } = useAuth();

  let hasGenerated = false;
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const noteData = await getNote(id);
        if (!noteData) {
          navigate("/");
        }

        if (noteData.flashcards.length > 0) {
          // flashcards exist, load them
          setTitle(noteData.title);
          setFlashcards(noteData.flashcards);
        } else if (!hasGenerated) {
          // no flashcards, generate them
          hasGenerated = true;

          const generateFlashcards = httpsCallable(
            functions,
            "generateFlashcards"
          );
          const results = await generateFlashcards({
            content: getPlainText(noteData.content),
          });
          const flashcards = results.data.flashcards;

          await updateNote(id, { flashcards }); // Save them to the note

          setFlashcards(flashcards);

          // show many credits left
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();

          toast.success(
            `Flashcards generated! You have ${userData.usagesLeft} credits left.`
          );
        }
      } catch (error) {
        console.log("Error in flashcards viwer:", error);
        navigate("/");
      }
      setLoading(false);
    };
    fetchNote();
  }, [id]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  if (loading || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="animate-spin inline-block w-12 h-12 -mt-[128px] border-4 border-primary border-t-transparent rounded-full"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl text-center mt-16 px-4">
      {/* Title Section */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8">
        {`${title || "Untitled Note"} Flashcards`}
      </h2>

      {/* Flashcard Display Section */}
      <div
        onClick={() => setShowAnswer(!showAnswer)}
        className="border cursor-pointer shadow border-gray rounded-xl p-6 mx-auto flex justify-center items-center h-[380px]"
      >
        <div className="text-2xl text-text text-center">
          <p>
            {!showAnswer
              ? flashcards[currentIndex].question
              : flashcards[currentIndex].answer}
          </p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex justify-between items-center mt-6">
        <button onClick={handlePrevious} className="btn-primary text-lg">
          Previous
        </button>
        <div className="text-lg text-text-light">
          <span>{`${currentIndex + 1} / ${flashcards.length}`}</span>
        </div>
        <button onClick={handleNext} className="btn-primary text-lg">
          Next
        </button>
      </div>
    </div>
  );
}

export default FlashcardsViewer;
