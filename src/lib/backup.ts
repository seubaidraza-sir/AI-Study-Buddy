import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserProfile, Note } from "../types";

export async function backupUserData(
  profile: UserProfile,
  notes: Note[]
) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in.");

  await setDoc(
    doc(db, "users", user.uid),
    {
      profile,

      notes: notes.map(note => ({
        id: note.id,
        title: note.title ?? "",
        content: note.content ?? "",
        category: note.category ?? "",
        date: note.date ?? "",
        isFavorite: note.isFavorite ?? false
      })),

      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function restoreUserData() {

  const user = auth.currentUser;

  if (!user) return null;


  const userRef = doc(
    db,
    "users",
    user.uid
  );


  const snap = await getDoc(userRef);


  if (!snap.exists()) {
    console.log("No cloud backup found");
    return null;
  }


  const data = snap.data();


  console.log(
    "☁ Backup found:",
    data
  );


  return data;

}
  