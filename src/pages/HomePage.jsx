import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FiBookOpen } from "react-icons/fi";
import { LuNotebookText } from "react-icons/lu";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { createNote, getUserNotes } from "../services/firebaseService";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";

function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const userNotes = await getUserNotes(currentUser.uid);
        setNotes(userNotes);
        console.log(notes);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    fetchNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      const noteId = await createNote(currentUser.uid);
      navigate(`/notes/${noteId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (timestamp) => {
    const dateOption = { year: "numeric", month: "short", day: "numeric" };
    const timeOption = { hour: "numeric", minute: "numeric" };
    const timestampDate = timestamp.toDate();
    const todaysDate = new Date();
    if (
      timestampDate.toLocaleString("en-US", dateOption) ===
      todaysDate.toLocaleString("en-US", dateOption)
    ) {
      return timestampDate.toLocaleString("en-US", timeOption);
    } else {
      return timestampDate.toLocaleString("en-US", dateOption);
    }
  };

  return (
    <div className="text-center max-w-5xl mx-auto">
      <div className="pt-16 space-y-3">
        <div className="flex space-x-3 mx-auto justify-center items-center">
          <div className="p-4 rounded-full bg-gray-light w-fit text-primary text-4xl hidden sm:block">
            <FiBookOpen />
          </div>
          <p className="text-4xl text-text font-bold">Your Notes</p>
        </div>
        <p className="text-text-light">
          Capture your thoughts, then study by generating flashcards, and
          creating summaries.
        </p>
      </div>
      {loading ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="mt-12 px-4 py-12">
          <div className="p-6 mx-auto rounded-full bg-gray-light w-fit">
            <LuNotebookText className="text-text-light text-4xl" />
          </div>
          <p className="text-text text-3xl mt-4">No notes yet</p>
          <p className="text-text-light mt-2">
            Create your first note to get started with SmartNotes.
          </p>
          <button onClick={handleCreateNote} className="btn-primary mt-6">
            Create your first note
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="relative">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search your notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray rounded-xl px-4 pl-10 py-2 outline-none focus:ring-2 focus:ring-offset-2 w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-6 gap-6">
            {notes
              .filter((note) =>
                note.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((note) => (
                <Link to={`/notes/${note.id}`} key={note.id}>
                  <div className="bg-white border border-gray rounded-xl text-start hover:shadow-md ">
                    <div className="p-4">
                      <p className="text-2xl text-text line-clamp-1">
                        {note.title}
                      </p>
                      <p className="text-text-light line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                    <div className="bg-gray-light border-t border-gray rounded-b-xl p-4">
                      <p className="text-text-light text-sm">
                        {`You saved ${formatDate(note.updatedAt)}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          <button
            onClick={handleCreateNote}
            className="fixed bottom-8 right-8 gradient-bg rounded-full p-5 text-white text-lg hover:opacity-90"
          >
            <IoIosAddCircleOutline />
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
