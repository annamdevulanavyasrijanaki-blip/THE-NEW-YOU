
import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { UserProfile } from "../types";

const USERS_COLLECTION = "users";

/**
 * Ensures a user document exists in Firestore.
 */
export const syncUserProfile = async (uid: string, email: string, name: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        name: name || "Luxe Member",
        createdAt: serverTimestamp(),
        photoURL: "",
        measurements: {
          height: '-',
          bust: '-',
          waist: '-',
          hips: '-',
        }
      });
      console.log("Created new user profile in Firestore");
    } else {
      await updateDoc(userRef, { email: email });
    }
  } catch (e: any) {
    console.error("Error syncing user profile:", e.message);
    if (e.code === 'permission-denied') {
      throw new Error("Database access denied. Please check Firestore Security Rules.");
    }
    throw e;
  }
};

/**
 * Fetches a user profile from Firestore.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (e: any) {
    console.error("Error fetching profile:", e.message);
    return null;
  }
};

/**
 * Updates a user's profile information.
 */
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (e: any) {
    console.error("Error updating profile:", e.message);
    throw e;
  }
};

/**
 * Deletes user data from Firestore.
 */
export const deleteUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  } catch (e: any) {
    console.error("Error deleting profile:", e.message);
    throw e;
  }
};
