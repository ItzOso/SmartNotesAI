import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const updateNote = async (noteId, updates) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("Note updated successfully!");
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const createNote = async (uid) => {
  const notesRef = collection(db, "notes");
  try {
    const newNoteRef = await addDoc(notesRef, {
      uid,
      title: "Untitled Note",
      content: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      summary: "",
      flashcards: [],
    });

    return newNoteRef.id;
  } catch (error) {
    console.log("Error creating note:", error);
    throw error;
  }
};

export const getNote = async (noteId) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnapshot = await getDoc(noteRef);
    if (noteSnapshot.exists()) {
      return { id: noteSnapshot.id, ...noteSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error fetching note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId) => {
  try {
    const notesRef = collection(db, "notes");
    const q = query(
      notesRef,
      where("uid", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const usersNotes = querySnapshot.docs.map((note) => {
      return { id: note.id, ...note.data() };
    });
    return usersNotes;
  } catch (error) {
    console.log("Error fetching users notes:", error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await deleteDoc(noteRef);
    console.log("Successfully deleted note.");
  } catch (error) {
    console.log("Error deleting note:", error);
    throw error;
  }
};
