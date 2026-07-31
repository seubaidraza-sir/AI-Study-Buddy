import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import app from "./firebase";
import { saveUserProfile } from "./firestore";
const auth = getAuth(app);

export const signup = async (
  name: string,
  email: string,
  password: string
) => {
  console.log("Name =", JSON.stringify(name));
  console.log("Email =", JSON.stringify(email));
  console.log("Password =", JSON.stringify(password));

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await saveUserProfile(
    userCredential.user.uid,
    name,
    email.trim()
  );

  return userCredential;
};

// Login function
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout function
export const logout = () => {
  return signOut(auth);
};
export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};
// Google Sign-In
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(
    auth,
    provider
  );

  return result;
};
export default auth;