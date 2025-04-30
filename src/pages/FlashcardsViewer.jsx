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
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCardText } from "react-icons/bs";
import NoUsagesModal from "../components/NoUsagesModal";

function FlashcardsViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [note, setNote] = useState(null);
  const [showNoUsages, setShowNoUsages] = useState(false);

  const handleGenerateFlashcards = async (content) => {
    setIsGenerating(true);
    try {
      console.log(content);
      let currentContent;
      if (content) {
        currentContent = content;
      } else {
        const noteData = await getNote(id);
        console.log("Re fetched data:", noteData);
        currentContent = noteData.content;
      }

      if (currentContent.trim().split(/\s+/).length < 70) {
        toast.error(
          "Notes must have at least 70 words! Refresh page to try again."
        );
      }

      const generateFlashcards = httpsCallable(functions, "generateFlashcards");
      const results = await generateFlashcards({
        content: getPlainText(currentContent),
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
    } catch (error) {
      if (error.code === "functions/resource-exhausted") {
        setShowNoUsages(true);
      } else if (error.code === "functions/invalid-argument") {
        toast.error(
          "Notes must have at least 70 words! Refresh page to try again."
        );
      } else {
        console.log("Error in flashcards viwer:", error);
        navigate("/");
      }
    }
    setIsGenerating(false);
  };

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
          setNote(noteData);
          setFlashcards(noteData.flashcards);
        } else if (!hasGenerated) {
          // no flashcards, generate them
          hasGenerated = true;

          handleGenerateFlashcards(noteData.content);
        }
      } catch (error) {
        console.log(error.code);
        if (error.code === "functions/resource-exhausted") {
          setShowNoUsages(true);
        } else {
          console.log("Error in flashcards viwer:", error);
          navigate("/");
        }
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
    <div className="mx-auto max-w-3xl text-center mt-16 px-4 ">
      {/* Title Section */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center mb-8 gap-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text line-clamp-2 sm:line-clamp-1">
          {`${note?.title || "Untitled Note"} Flashcards`}
        </h2>
        <div className="relative inline-block">
          <button
            onClick={() => handleGenerateFlashcards()}
            disabled={
              !note.content.trim() ||
              isGenerating ||
              note.content.trim().split(/\s+/).length < 70
            }
            className="group btn-primary btn-icon whitespace-nowrap"
          >
            {isGenerating ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <BsCardText className="text-lg" />
            )}
            <span>Regenerate Flashcards</span>

            {/* Tooltip inside the button */}
            {!isGenerating && note.content.trim().split(/\s+/).length < 70 && (
              <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Requires at least 70 words
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Flashcard Display Section */}
      <div
        onClick={() => setShowAnswer(!showAnswer)}
        className="border cursor-pointer shadow border-gray rounded-xl p-6 mx-auto flex justify-center items-center h-[380px]"
      >
        <div className="text-2xl text-text text-center">
          {isGenerating ? (
            <div
              className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <p>
              {!showAnswer
                ? flashcards[currentIndex].question
                : flashcards[currentIndex].answer}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2">
        <button
          onClick={handlePrevious}
          className="btn-primary text-lg order-2 w-full sm:order-1 sm:w-fit"
        >
          Previous
        </button>
        <div className="text-lg text-text-light order-1 sm:order-2">
          <span>{`${currentIndex + 1} / ${flashcards.length}`}</span>
        </div>
        <button
          onClick={handleNext}
          className="btn-primary text-lg order-3 w-full mb-6 sm:w-fit sm:mb-0"
        >
          Next
        </button>
      </div>
      <NoUsagesModal
        isOpen={showNoUsages}
        onClose={() => setShowNoUsages(false)}
      />
    </div>
  );
}

export default FlashcardsViewer;
