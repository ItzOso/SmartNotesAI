import React, { useActionState, useEffect, useState } from "react";
import { getNote } from "../services/firebaseService";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactFlipCard from "reactjs-flip-card";
import { GoArrowLeft } from "react-icons/go";

function FlashcardsViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const noteData = await getNote(id);
        if (noteData) {
          setTitle(noteData.title);
          setFlashcards(noteData.flashcards);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.log(error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
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
      <h2 className="text-3xl font-bold text-text mb-8">
        {`${title} Flashcards`}
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
