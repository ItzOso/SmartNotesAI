import React, { useEffect, useRef, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { FiSave } from "react-icons/fi";
import { RiExpandDiagonalLine, RiFileTextLine } from "react-icons/ri";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { db, functions } from "../config/firebase";
import { deleteNote, getNote, updateNote } from "../services/firebaseService";
import { AiOutlineEdit, AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuth } from "../contexts/AuthContext";
import { httpsCallable } from "firebase/functions";
import { getIdToken } from "firebase/auth";
import { IoClose, IoReaderOutline } from "react-icons/io5";
import { BsCardText } from "react-icons/bs";
import NoUsagesModal from "../components/NoUsagesModal";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { formatDate, getPlainText } from "../utils/textHelper";
import { toast } from "react-toastify";

function NotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [note, setNote] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ saving: false, message: "" });
  const [fullscreen, setFullscreen] = useState(false);

  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [showNoUsages, setShowNoUsages] = useState(false);

  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const summaryRef = useRef(null);

  const refreshNote = async () => {
    try {
      const updatedNote = await getNote(id);
      if (updatedNote) {
        setNote(updatedNote);
      }
    } catch (error) {
      console.log("Error refreshing note:", error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNote();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (showSummary) {
      summaryRef.current.scrollIntoView({
        behavior: "smooth", // Smooth scroll
      });
    }
  }, [showSummary]);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const noteData = await getNote(id);
        if (noteData) {
          setNote(noteData);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setFullscreen(false);
      }
    };

    if (fullscreen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen]);

  const handleTitleChange = (e) => {
    setNote((prevNote) => {
      return { ...prevNote, title: e.target.value };
    });
  };

  const handleContentChange = (value) => {
    const newContent = value;
    setNote((prevNote) => {
      return { ...prevNote, content: newContent };
    });
  };

  const handleSave = async () => {
    setSaveStatus((prev) => {
      return { ...prev, saving: true, message: "Saving..." };
    });
    try {
      if (currentUser.uid === note.uid) {
        await updateNote(id, { title: note.title, content: note.content });
        const fakeTimestamp = Timestamp.fromDate(new Date());
        setNote((prevNote) => {
          return { ...prevNote, updatedAt: fakeTimestamp };
        });
        setSaveStatus({ saving: false, message: "Saved!" });
        setTimeout(() => {
          setSaveStatus((prev) => {
            return { ...prev, message: "" };
          });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteNote = async () => {
    try {
      if (currentUser.uid === note.uid) {
        await deleteNote(note.id);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateSummary = async () => {
    setSummarizing(true);
    setSaveStatus((prev) => {
      return { ...prev, saving: true, message: "Saving..." };
    });

    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);
    let userData;
    if (userDoc.exists()) {
      userData = userDoc.data();
      const lastReset = userData.lastReset?.toDate(); // Convert Firestore timestamp
      const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
      if (userData.usagesLeft <= 0 && nextReset - new Date() >= 0) {
        setShowNoUsages(true);
        await updateNote(id, {
          title: note.title,
          content: note.content,
        });
        setSaveStatus({ saving: false, message: "Saved!" });
        setTimeout(() => {
          setSaveStatus((prev) => {
            return { ...prev, message: "" };
          });
        }, 2000);
        setSummarizing(false);
        return;
      }
    }
    try {
      const generateSummary = httpsCallable(functions, "generateSummary");
      const results = await generateSummary({
        content: getPlainText(note.content),
      });
      const summary = results.data.summary;

      await updateNote(id, {
        title: note.title,
        content: note.content,
        summary,
      });

      const fakeTimestamp = Timestamp.fromDate(new Date());

      setNote((prevNote) => {
        return { ...prevNote, summary, updatedAt: fakeTimestamp };
      });

      setShowSummary(true);

      setSaveStatus({ saving: false, message: "Saved!" });

      // if (userData.usagesLeft <= 0 && nextReset - new Date() >= 0) {
      toast.success(
        `Summary generated! ${userData.usagesLeft - 1} credits remaining.`
      );
    } catch (error) {
      // no more usages left
      console.log(error.code);
      if (error.code === "functions/resource-exhausted") {
        setShowNoUsages(true);
      }
      console.log("Error generating summary", error);
      setSaveStatus({ saving: false, message: "Couldnt Save." });
    } finally {
      setTimeout(() => {
        setSaveStatus((prev) => {
          return { ...prev, message: "" };
        });
      }, 2000);
      setSummarizing(false);
    }
  };

  const handleCreateFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    setSaveStatus((prev) => {
      return { ...prev, saving: true, message: "Saving..." };
    });
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastReset = userData.lastReset?.toDate(); // Convert Firestore timestamp
        const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        if (userData.usagesLeft <= 0 && nextReset - new Date() >= 0) {
          setShowNoUsages(true);
          await updateNote(id, {
            title: note.title,
            content: note.content,
          });
          const fakeTimestamp = Timestamp.fromDate(new Date());
          setNote((prevNote) => {
            return { ...prevNote, updatedAt: fakeTimestamp };
          });
          setSaveStatus({ saving: false, message: "Saved!" });
          setTimeout(() => {
            setSaveStatus((prev) => {
              return { ...prev, message: "" };
            });
          }, 2000);
          setIsGeneratingFlashcards(false);
          return;
        }
      }
      await updateNote(id, {
        title: note.title,
        content: note.content,
      });
      const fakeTimestamp = Timestamp.fromDate(new Date());
      setNote((prevNote) => {
        return { ...prevNote, updatedAt: fakeTimestamp };
      });
      setSaveStatus({ saving: false, message: "Saved!" });
      setTimeout(() => {
        setSaveStatus((prev) => {
          return { ...prev, message: "" };
        });
      }, 2000);
      window.open(`/flashcards/${id}`, "_blank");
    } catch (error) {
      console.log("Error preparing flashcard viewer:", error);
    } finally {
      setSaveStatus({ saving: false, message: "" });
      setIsGeneratingFlashcards(false);
    }
  };

  // const handleCreateFlashcards = async () => {
  //   setIsGeneratingFlashcards(true);
  //   setSaveStatus((prev) => {
  //     return { ...prev, saving: true, message: "Saving..." };
  //   });
  //   const userRef = doc(db, "users", currentUser.uid);
  //   const userDoc = await getDoc(userRef);
  //   if (userDoc.exists()) {
  //     const userData = userDoc.data();
  //     const lastReset = userData.lastReset?.toDate(); // Convert Firestore timestamp
  //     const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
  //     if (userData.usagesLeft <= 0 && nextReset - new Date() >= 0) {
  //       setShowNoUsages(true);
  //       setIsGeneratingFlashcards(false);
  //       setSaveStatus((prev) => {
  //         return { ...prev, saving: false, message: "" };
  //       });
  //       return;
  //     }
  //   }
  //   try {
  //     const generateFlashcards = httpsCallable(functions, "generateFlashcards");
  //     const results = await generateFlashcards({
  //       content: getPlainText(note.content),
  //     });
  //     const flashcards = results.data.flashcards;

  //     await updateNote(id, {
  //       title: note.title,
  //       content: note.content,
  //       flashcards,
  //     });
  //     const fakeTimestamp = Timestamp.fromDate(new Date());

  //     setNote((prevNote) => {
  //       return { ...prevNote, flashcards, updatedAt: fakeTimestamp };
  //     });
  //     window.open(`/flashcards/${id}`, "_blank");
  //     setSaveStatus({ saving: false, message: "Saved!" });
  //   } catch (error) {
  //     console.log("Error generating flashcards", error);
  //     setSaveStatus({ saving: false, message: "Couldnt Save." });
  //   } finally {
  //     setTimeout(() => {
  //       setSaveStatus((prev) => {
  //         return { ...prev, message: "" };
  //       });
  //     }, 2000);
  //     setIsGeneratingFlashcards(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="animate-spin inline-block w-12 h-12 border-4 -mt-[128px] border-primary border-t-transparent rounded-full"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto  ${
        fullscreen ? "fixed inset-0 bg-white p-6 z-50" : "max-w-4xl"
      } ${showSummary && "overflow-auto"}`}
    >
      <div className="min-[430px]:flex justify-between mb-4">
        <Link
          to="/"
          className=" btn-primary btn-icon bg-white hover:bg-gray-light hover:text-text text-text-light"
        >
          <GoArrowLeft className="text-lg" />
          <span>Back to notes</span>
        </Link>
        <div className="justify-center flex items-center gap-2">
          {saveStatus.message ? (
            <p className="text-text-light">{saveStatus.message}</p>
          ) : (
            <p className="text-text-light">{`Last saved ${formatDate(
              note?.updatedAt
            )}`}</p>
          )}
          <button onClick={handleSave} className="btn-primary btn-icon">
            {saveStatus.saving ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <FiSave />
            )}
            <span>Save</span>
          </button>

          <button
            onClick={handleDeleteNote}
            className="btn-secondary p-0 w-[40px] h-[40px]  flex justify-center items-center"
          >
            <MdDeleteOutline className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="btn-secondary p-0 w-[40px] h-[40px] flex justify-center items-center"
          >
            {!fullscreen ? (
              <RiExpandDiagonalLine className="h-4 w-4" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-minimize2 h-4 w-4"
              >
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" x2="21" y1="10" y2="3"></line>
                <line x1="3" x2="10" y1="21" y2="14"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col rounded-xl border border-gray p-6 gap-4">
        <input
          type="text"
          placeholder="Note Title"
          value={note?.title}
          onChange={handleTitleChange}
          className="text-3xl font-bold outline-none text-text"
        />
        <div
          className={`h-[500px] ${
            fullscreen ? "h-[545px]" : ""
          } overflow-hidden`}
        >
          <ReactQuill
            theme="snow"
            value={note?.content}
            onChange={handleContentChange}
            className="h-full"
          />
        </div>
        {/* <textarea
          name=""
          id=""
          value={note?.content}
          onChange={handleContentChange}
          placeholder="Start typing your notes here..."
          className={`outline-none resize-none h-[500px] ${
            fullscreen && "h-[545px]"
          } `}
        ></textarea> */}

        {showSummary && note.summary && (
          <div
            ref={summaryRef}
            className="mt-4 p-4 border border-gray rounded-lg bg-gray-100"
          >
            <div className="flex flex-col-reverse min-[520px]:flex-row justify-between items-center">
              <h3 className="text-lg font-bold text-text">Summary:</h3>
              <div className="flex gap-2">
                <div className="relative group inline-block">
                  <button
                    onClick={handleCreateSummary}
                    disabled={
                      !note.content.trim() ||
                      summarizing ||
                      note.content.trim().split(/\s+/).length < 50
                    }
                    className={`btn-primary btn-icon ${
                      note.content.trim().split(/\s+/).length < 50
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primary-dark"
                    }`}
                  >
                    {summarizing ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      <AiOutlineEdit className="text-lg" />
                    )}
                    <span>Summarize</span>
                  </button>

                  {/* Tooltip */}
                  {note.content.trim().split(/\s+/).length < 50 && (
                    <div className="absolute left-1/2 pointer-events-none -top-10 transform -translate-x-1/2 bg-text-light text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Requires at least 50 words
                    </div>
                  )}
                </div>
                {/* <button
                  onClick={() => setShowSummary(false)}
                  className="btn-secondary"
                >
                  Close
                </button> */}
              </div>
            </div>
            <p className="text-text-light mt-2">{note.summary}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 md:flex-row my-4">
        {note.summary ? (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="btn-primary btn-icon"
          >
            {showSummary ? (
              <IoClose className="text-lg" />
            ) : (
              <RiFileTextLine className="text-lg" />
            )}
            <span>{showSummary ? "Close Summary" : "View Summary"}</span>
          </button>
        ) : (
          <div className="relative group inline-block">
            <button
              onClick={handleCreateSummary}
              disabled={
                !note.content.trim() ||
                summarizing ||
                note.summary ||
                note.content.trim().split(/\s+/).length < 50
              }
              className={`btn-primary btn-icon ${
                note.content.trim().split(/\s+/).length < 50
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-dark"
              }`}
            >
              {summarizing ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <AiOutlineEdit className="text-lg" />
              )}
              <span>Summarize</span>
            </button>

            {/* Tooltip */}
            {note.content.trim().split(/\s+/).length < 50 && (
              <div className="absolute left-1/2 pointer-events-none -top-10 transform -translate-x-1/2 bg-text-light text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Requires at least 50 words
              </div>
            )}
          </div>
        )}

        {note.flashcards.length ? (
          <button
            onClick={() => window.open(`/flashcards/${id}`, "_blank")}
            className="btn-primary btn-icon"
          >
            <BsCardText />
            <span>View Flashcards</span>
          </button>
        ) : (
          <div className="relative inline-block">
            <button
              onClick={handleCreateFlashcards}
              disabled={
                !note.content.trim() ||
                isGeneratingFlashcards ||
                note.content.trim().split(/\s+/).length < 70
              }
              className="group btn-primary btn-icon"
            >
              {isGeneratingFlashcards ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <BsCardText className="text-lg" />
              )}
              <span>Generate Flashcards</span>

              {/* Tooltip inside the button */}
              {!isGeneratingFlashcards &&
                note.content.trim().split(/\s+/).length < 70 && (
                  <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Requires at least 70 words
                  </div>
                )}
            </button>
          </div>
        )}

        {/* <button
          disabled={!note.content.trim()}
          className="btn-primary btn-icon"
        >
          <BsCardText />
          <span>Generate Flashcards</span>
        </button> */}
      </div>

      <NoUsagesModal
        isOpen={showNoUsages}
        onClose={() => setShowNoUsages(false)}
      />
    </div>
  );
}

export default NotesPage;
