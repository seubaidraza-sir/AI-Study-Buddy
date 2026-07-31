import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveUserProfile(
  uid: string,
  name: string,
  email: string
) {
  try {
    const ref = doc(db, "users", uid);

    await setDoc(ref, {
      name: name,
      email: email,
      joinedDate: new Date().toLocaleDateString(),
      avatar: "🦉",
      streak: 1,
      studyMinutes: 0,
      xp: 0,
      level: 1,
    });

    console.log("✅ Firestore profile saved successfully");
    console.log("Document path:", ref.path);
  } catch (error) {
    console.error("❌ Firestore Error:", error);
    throw error;
  }
}
export async function getUserProfile(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data();
    }

    return null;
  } catch (error) {
    console.error("❌ Error loading profile:", error);
    return null;
  }
}


export async function updateUserProfile(
  uid: string,
  data: any
) {
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
  } catch (error) {
    console.error("❌ Error updating profile:", error);
  }
}
// =======================
// NOTES FUNCTIONS
// =======================

export async function saveNote(uid: string, note: any) {
  try {
    const notesRef = collection(db, "users", uid, "notes");

    await addDoc(notesRef, {
      ...note,
      createdAt: new Date()
    });

    console.log("✅ Note saved successfully");
  } catch (error) {
    console.error("❌ Error saving note:", error);
  }
}

export async function getNotes(uid: string) {
  try {
    const notesRef = collection(db, "users", uid, "notes");

    const snapshot = await getDocs(notesRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Error loading notes:", error);
    return [];
  }
}

export async function deleteNote(uid: string, noteId: string) {
  try {
    await deleteDoc(doc(db, "users", uid, "notes", noteId));
  } catch (error) {
    console.error(error);
  }
}
// =======================
// FLASHCARDS
// =======================

export async function saveFlashcard(uid: string, flashcard: any) {
  try {
    const flashcardsRef = collection(db, "users", uid, "flashcards");

    await addDoc(flashcardsRef, {
      ...flashcard,
      createdAt: new Date()
    });

    console.log("✅ Flashcard saved");
  } catch (error) {
    console.error("❌ Error saving flashcard:", error);
  }
}

export async function getFlashcards(uid: string) {
  try {
    const flashcardsRef = collection(db, "users", uid, "flashcards");

    const snapshot = await getDocs(flashcardsRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function getDashboardStats(uid: string) {
  console.log("Dashboard UID:", uid);

  const notesRef = collection(db, "users", uid, "notes");
  const chatsRef = collection(db, "users", uid, "chatHistory");
  const flashcardsRef = collection(db, "users", uid, "flashcards");
  const plannerRef = collection(db, "users", uid, "planner");

  const notes = await getDocs(notesRef);
  const chats = await getDocs(chatsRef);
  const flashcards = await getDocs(flashcardsRef);
  const planner = await getDocs(plannerRef);

  console.log("Notes:", notes.size);
  console.log("Chats:", chats.size);
  console.log("Flashcards:", flashcards.size);
  console.log("Planner:", planner.size);

  return {
    notes: notes.size,
    chats: chats.size,
    flashcards: flashcards.size,
    planner: planner.size,
  };
}